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
from collections import defaultdict
from tools import *
from prompts import *
from app_queries import *
from elo_rating_system import *
from chroma_db import *
import uuid
from typing import List, Dict, Any, Optional, Union
import logging
import json
import argparse
import csv
import random


load_dotenv()

logging.basicConfig(
    filename='llm_output.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("my_app_logger")

def escape_curly_braces_for_langchain(s: str) -> str:
    return s.replace("{", "{{").replace("}", "}}")

def extract_json_block(text):
    start = text.find('{')
    if start == -1:
        raise ValueError("No JSON object found")

    brace_count = 0
    for i in range(start, len(text)):
        if text[i] == '{':
            brace_count += 1
        elif text[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                return text[start:i+1]

    raise ValueError("Unbalanced braces in JSON content")


class Theme(BaseModel):
    id: Optional[uuid.UUID] = Field(None, description="Unique identifier for the theme")
    name: str
    description: str

class ThemeResponse(BaseModel):
    theme: List[Theme]

class Epic(BaseModel):
    id: Optional[uuid.UUID] = Field(None, description="Unique identifier for the epic")
    theme_id: Optional[uuid.UUID] = Field(None, description="ID of the parent theme")
    name: str
    description: str

class EpicsResponse(BaseModel):
    epics: List[Epic]

class UserStory(BaseModel):
    id: Optional[uuid.UUID] = Field(None, description="Unique identifier for the story")
    epic_id: Optional[uuid.UUID] = Field(None, description="ID of the parent epic")
    description: str
    priority: Optional[int] = Field(default=1, ge=1, le=5)

class UserStoryResponse(BaseModel):
    user_stories: List[UserStory]

def stories_to_json(items: List[BaseModel]) -> str:
    return json.dumps([item.dict() for item in items], indent=2)

def build_prompt(template: str) -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        ("system", template),
        ("human", "{input}"),
        MessagesPlaceholder("agent_scratchpad")
    ])

def parse_json_or_log(output_text, model_cls):
    try:
        json_str = extract_json_block(output_text)
        data = json.loads(json_str)
        result = model_cls(**data)
        return result
    except Exception as e:
        logger.error(f"Failed to parse JSON: {e}\nOutput was:\n{output_text}")
        raise



def call_agent( llm: Union[ChatOpenAI, ChatAnthropic, ChatXAI, ChatGoogleGenerativeAI], prompt_template: ChatPromptTemplate, input_text: str, tools: list, verbose: bool = False) -> str:
    agent = create_tool_calling_agent(llm=llm, tools=tools, prompt=prompt_template)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=verbose)
    result = agent_executor.invoke({"input": input_text})
    output = result.get("output", result)
    if isinstance(output, list) and output and "text" in output[0]:
        return output[0]["text"]
    elif isinstance(output, dict) and "text" in output:
        return output["text"]
    return str(output)


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
                        parsed = json.loads(extract_json_block(grading_response))
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
    parser.add_argument("--llm", choices=["anthropic","openai"], default="openai")
    parser.add_argument("--test", action="store_true")  # New argument for test mode
    args = parser.parse_args()

    if args.llm == "anthropic":
        llm = ChatAnthropic(model="claude-3-5-sonnet-20241022", temperature=0)
        theme_file = "themes_anthropic.json"
        epics_file = "epics_anthropic.json"
        user_stories_file = "user_stories_anthropic.json"
    else:
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        theme_file = "themes_gpt4o_mini.json"
        epics_file = "epics_gpt4o_mini.json"
        user_stories_file = "user_stories_gpt4o_mini.json"

    embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectorstore = prepare_vectorstore(embedding, config, args.add_new)
    retriever = vectorstore.as_retriever(search_type="mmr", search_kwargs={"k": config.search_k})
    tools = [make_rag_tool(retriever)]

    llms_to_test = [
    ("GPT-4o-mini", ChatOpenAI(model="gpt-4o-mini", temperature=0)),
    ("Claude-3.5", ChatAnthropic(model="claude-3-5-sonnet-20241022", temperature=0)),
    ("grok-3-latest", ChatXAI(model="grok-3-latest", temperature=0)),
    ("gemini-2.5-flash", ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)),  # Corrected Gemini Flash model name,
    # Add more test LLMs here
]

    google_grader = ChatGoogleGenerativeAI(model="gemini-2.5-pro", temperature=0)

    if args.test:
        print("running test")
        # You should have run_tests defined as shown in previous messages
        run_swiss_elo_evaluation(llms_to_test, google_grader, tools, test_inputs, PROMPT_VARIANTS, rounds=3, samples_per_combo=1)
        return  # Exit after testing
    
    all_themes = []
    all_epics = []
    all_stories = []
    print("skipped testing")
    return
    # === Generate Themes ===
    theme_prompt_template = build_prompt(theme_generator__RTF_prompt)
    theme_response = call_agent(llm, theme_prompt_template, query, tools)
    themes_response = parse_json_or_log(theme_response, ThemeResponse)

    for theme in themes_response.theme:
        theme_id = uuid.uuid4()
        theme_dict = {
            "id": str(theme_id),
            "name": theme.name,
            "description": theme.description
        }
        all_themes.append(theme_dict)
    with open(theme_file, "w") as f:
        f.write(stories_to_json(all_themes))

    # === Generate Epics ===
    all_epics = []
    for theme in all_themes:
        epic_prompt_template = build_prompt(epic_generator_prompt)
        input_theme = f"{theme.name}: {theme.description}"
        epic_response = call_agent(llm,epic_prompt_template, input_theme, tools)
        epics_response = parse_json_or_log(epic_response, EpicsResponse)
        for epic in epics_response.epics:
            epic_id = uuid.uuid4()
            epic_dict = {
                "id": str(epic_id),
                "theme_id": theme["id"],  # reference to parent theme
                "name": epic.name,
                "description": epic.description
            }
            all_epics.append(epic_dict)
    
    with open(epics_file, "w") as f:
        f.write(stories_to_json(all_epics))

    # === Generate User Stories ===
    all_stories = []
    for epic in all_epics:
        story_prompt_template = build_prompt(story_generator_prompt)
        input_epic = f"{epic.name}: {epic.description}"
        story_response = call_agent(llm, story_prompt_template, input_epic, tools)
        stories_data = parse_json_or_log(story_response, UserStoryResponse)
        for story in stories_data.user_stories:
            story_id = uuid.uuid4()
            story_dict = {
                "id": str(story_id),
                "epic_id": epic["id"],  # reference to parent epic
                "title": story.title,
                "description": story.description
            }
            all_stories.append(story_dict)
        #all_stories.extend(stories_data.user_stories)

    with open(user_stories_file, "w") as f:
        f.write(stories_to_json(all_stories))

    print("\n=== Final Comprehensive User Stories ===")
    print(stories_to_json(all_stories))
    logger.info("Final user stories:")
    logger.info(stories_to_json(all_stories))

if __name__ == "__main__":
    main()
