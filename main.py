from dotenv import load_dotenv
from pydantic import BaseModel, ValidationError, Field 
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_xai import ChatXAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.documents import Document
from collections import defaultdict
from llm_utils import *
from story_creation import *
from app_queries import *
from elo_rating_system import *
from chroma_db import *
from vectorstores import init_vectorstores, manager
import uuid
from typing import List, Dict, Any, Optional, Union
import logging
import json
import argparse
import csv
import random
from langchain_core.messages import AIMessage, HumanMessage
import os


load_dotenv()

logging.basicConfig(
    filename='llm_output.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("my_app_logger")


# === Integration with Prompt Testing Code ===
def run_swiss_elo_evaluation(llm_list, grader_llm, tools, test_inputs, prompt_variants, rounds, samples_per_combo):
    # Initialize all (llm, prompt_variant) combinations as players
    players = [f"{llm_name}::{prompt_name}" for llm_name, _ in llm_list for prompt_name, _ in prompt_variants]


    # Pre-generate outputs per (LLM, prompt variant, user prompt)
    output_cache = defaultdict(list)
    for user_prompt in test_inputs:
        for llm_name, llm in llm_list:
            for prompt_name, prompt_template in prompt_variants:
                player_key = f"{llm_name}::{prompt_name}"
                for _ in range(samples_per_combo):
                    print(f"Pre-generating output for {player_key} on user prompt: {user_prompt[:60]}, sample {_+1}/{samples_per_combo}")
                    try:
                        output = call_agent(llm, build_prompt(prompt_template), user_prompt, tools)
                        output_cache[(user_prompt, player_key)].append(output)
                    except Exception as e:
                        print(f"Failed to pre-generate output for {player_key}: {e}")

    # Prepare CSV file
    csv_file = "test_results.csv"
    csv_fields = ["user_prompt", "player_A", "player_B", "winner", "justification"]
    csv_exists = os.path.isfile(csv_file)

    with open(csv_file, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=csv_fields)
        if not csv_exists:
            writer.writeheader()

        all_ratings_per_prompt = []
        match_histories = []
        for user_prompt in test_inputs:
            print(f"\n==== Evaluating on user prompt: {user_prompt[:60]}... ====")
            tournament = SwissTournament(players)
            for round_num in range(rounds):
                print(f"\n-- Round {round_num + 1}/{rounds} --")
                matchups, bye = tournament.pair_players()
                round_results = []

                for p1, p2 in matchups:
                    print(f"Matchup: {p1} vs {p2}")
                    try:
                        output1 = random.choice(output_cache[(user_prompt, p1)])
                        output2 = random.choice(output_cache[(user_prompt, p2)])
                    except Exception as e:
                        print(f"Output retrieval failed: {e}")
                        continue

                    try:

                        grading_input = f"""
                        Product Prompt:
                        {user_prompt}

                        Player A ID: {p1}
                        Option A:
                        {output1}

                        Player B ID: {p2}
                        Option B:
                        {output2}
                        """
                        grading_response = call_agent(grader_llm, build_prompt(comparison_prompt), grading_input, tools)
                        parsed = json.loads(extract_json_from_llm(grading_response))
                        winner = parsed.get("winner", "Draw")
                        justification = parsed.get("justification", "")

                        if winner == "A":
                            round_results.append((p1, p2, False))
                            csv_winner = p1
                        elif winner == "B":
                            round_results.append((p2, p1, False))
                            csv_winner = p2
                        else:
                            round_results.append((p1, p2, True))
                            csv_winner = "Draw"

                        writer.writerow({
                            "user_prompt": user_prompt,
                            "player_A": p1,
                            "player_B": p2,
                            "winner": csv_winner,
                            "justification": justification
                        })
                        print(f"Winner: {csv_winner}")
                        print(f"{p1} vs {p2} => {winner}\nJustification: {justification}\n")
                    except Exception as e:
                        print(f"Grading failed: {e}")
                        continue
                if bye:
                    print(f"Bye: {bye} gets a free win this round.")
                    round_results.append((bye, None, False))  # This player gets a win for the round

                tournament.report_results(round_results)
            rankings = tournament.get_rankings()
            print(f"\nFinal rankings after evaluating prompt: {user_prompt[:60]}...")
            for rank, (player, rating) in enumerate(rankings, 1):
                print(f"{float(rank)}. {player}: Elo {rating:.2f}")
    
            for player, rating in rankings:
                all_ratings_per_prompt.append({
                    "user_prompt": user_prompt,
                    "player": player,
                    "rating": float(rating)
                })
    # Save Elo ratings to CSV
    ratings_csv = "final_elo_ratings.csv"
    with open(ratings_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["user_prompt", "player", "rating"])
        writer.writeheader()
        writer.writerows(all_ratings_per_prompt)
    print(f"\n Final Elo ratings saved to {ratings_csv}")

    return all_ratings_per_prompt


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--add-new", action="store_true")
    parser.add_argument("--llm", choices=["anthropic", "openai", "gemini"], default="gemini")
    parser.add_argument("--test", action="store_true")  # New argument for test mode
    args = parser.parse_args()

    # Initialize vectorstores with correct args
    print("Initializing vectorstores...")
    manager = init_vectorstores(args)
    print("Vectorstores initialized.")

    if args.llm == "anthropic":
        llm = ChatAnthropic(model="claude-3-5-sonnet-20241022", temperature=0)
        theme_file = "themes_anthropic.json"
        epics_file = "epics_anthropic.json"
        user_stories_file = "user_stories_anthropic.json"
        print("Using LLM: Claude-3.5 (Anthropic)")
    elif args.llm == "openai":
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        theme_file = "themes_gpt4o_mini.json"
        epics_file = "epics_gpt4o_mini.json"
        user_stories_file = "user_stories_gpt4o_mini.json"
        print("Using LLM: GPT-4o-mini (OpenAI)")
    else:  # Default to Gemini 2.5 Pro for best bang for buck
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)
        theme_file = "themes_gemini_flash.json"
        epics_file = "epics_gemini_flash.json"
        user_stories_file = "user_stories_gemini_flash.json"
        print("Using LLM: Gemini-2.5-flash (Google)")

    # Get retrievers
    story_retriever = manager.get_retriever("rag_info", search_type="mmr", search_kwargs={"k": config.search_k})
    pipeline_retriever = manager.get_retriever("pipeline_parts", search_type="mmr", search_kwargs={"k": config.search_k})

    print("RAG DB status:")
    print(f"Story retriever: {'OK' if story_retriever else 'NOT FOUND'}")
    print(f"Pipeline retriever: {'OK' if pipeline_retriever else 'NOT FOUND'}")
    print(f"Theme file path: {theme_file}")

    llms_to_test = [
    ("GPT-4o-mini", ChatOpenAI(model="gpt-4o-mini", temperature=0)),
    ("Claude-3.5", ChatAnthropic(model="claude-3-5-sonnet-20241022", temperature=0)),
    ("grok-3-latest", ChatXAI(model="grok-3-latest", temperature=0)),
    ("gemini-2.5-flash", ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)),  # Corrected Gemini Flash model name,
    # Add more test LLMs here
    ]

    google_grader = ChatGoogleGenerativeAI(model="gemini-2.5-pro", temperature=0)
    app_query = "build me a weather app. like the one used on a phone"
    if args.test:
        print("running test")
        # You should have run_tests defined as shown in previous messages
        tools = [] 
        PROMPT_VARIANTS = []
        run_swiss_elo_evaluation(llms_to_test, google_grader, tools, test_inputs, PROMPT_VARIANTS, rounds=3, samples_per_combo=1)
        return  # Exit after testing

    print("skipped testing")

#region: Story Generation
    #Theme generation
    if not os.path.exists(theme_file):
        print(f"{theme_file} does not exist. Creating new themes...")
        interactive_theme_generation(llm, app_query, theme_file, manager)
    else:
        print(f"{theme_file} exists. Skipping theme generation.")
    
    with open("themes_gemini_flash.json", "r", encoding="utf-8") as f:
        themes = json.load(f)
    
    theme_docs = [
        Document(
            page_content=theme["description"],
            metadata={"name": theme["name"], "id": theme["id"]}
        )
        for theme in themes
    ]
    print(f"Loaded {len(theme_docs)} themes from {theme_file}")
    story_retriever.vectorstore.add_documents(theme_docs)
    print("Themes added to story retriever.")
    
    #Epic generation
    #Only create new epics if epics_file does not exist
    if not os.path.exists(epics_file):
        print(f"{epics_file} does not exist. Creating new epics...")
        interactive_epic_generation(llm, themes, epics_file, manager)
    else:
        print(f"{epics_file} exists. Skipping epic generation.")

    with open(epics_file, "r", encoding="utf-8") as f:
        epics = json.load(f)

    epic_docs = [
        Document(
            page_content=epic["description"],
            metadata={"name": epic["name"], "id": epic["id"], "theme_id": epic["theme_id"]}  
        )
        for epic in epics
    ]
    print(f"Loaded {len(epic_docs)} epics from {epics_file}")
    story_retriever.vectorstore.add_documents(epic_docs)
    print("Epics added to story retriever.")

    # User story generation
    if not os.path.exists(user_stories_file):
        print(f"{user_stories_file} does not exist. Creating new user stories...")
        generate_user_stories(llm, epics, user_stories_file)
    else:
        print(f"{user_stories_file} exists. Skipping user story generation.")

    with open(user_stories_file, "r", encoding="utf-8") as f:
        user_stories = json.load(f)

    story_docs = [
        Document(
            page_content=story["description"],
            metadata={
                "name": story["name"],
                "id": story["id"],
                "epic_id": story["epic_id"],
                "theme_id": story["theme_id"]
            }
        )
        for story in user_stories
    ]
    print(f"Loaded {len(story_docs)} user stories from {user_stories_file}")
    story_retriever.vectorstore.add_documents(story_docs)
    print("User stories added to story retriever.")
#endregion

#region: Story Refinmenet 


if __name__ == "__main__":
    main()
