from dotenv import load_dotenv
from pydantic import BaseModel, ValidationError
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor
from functools import partial
from tools import *
from chroma_db import *
import re 
from typing import List, Dict, Any
import logging
import json
import argparse

load_dotenv()

logging.basicConfig(
    filename='llm_output.log',  # Output file name
    level=logging.INFO,         # Log level
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("my_app_logger")

def extract_json_block(text):
    match = re.search(r'({.*})', text, re.DOTALL)
    if match:
        return match.group(1)
    raise ValueError("No JSON block found")

# === Output Model ===
class UserStory(BaseModel):
    description: str
    acceptance_criteria: List[str]
    priority: str

class Screen(BaseModel):
    name: str
    purpose: str
    key_ui_elements: List[str]
    navigation_targets: List[str]

class UIComponent(BaseModel):
    name: str
    purpose: str
    customization_options: List[str]
    documentation_link: str = ""

class APIEndpoint(BaseModel):
    http_method: str
    url_path: str
    description: str
    required_parameters: List[Dict[str, str]]
    example_request: Dict[str, Any]
    example_response: Dict[str, Any]

class UserStoriesResponse(BaseModel):
    user_stories: List[UserStory]

class ComponentsResponse(BaseModel):
    screens: List[Screen]
    ui_components: List[UIComponent] 
    api_endpoints: List[APIEndpoint]

# === Prompts ===
pm_prompt = """
You are an expert app planner. Generate an exhaustive list of user stories for the given app, following the INVEST principles. For each story, include:
- description
- acceptance_criteria (as a list)
- priority (High, Medium, Low)
You may consult background documents or tools as needed to retrieve helpful info.
Return only a valid JSON object with a single key 'user_stories', whose value is a list of user story objects.
"""

qa_prompt = """
You are a QA engineer. Given the following user stories in JSON format, add any missing test-relevant user stories or edge cases. Do not modify existing stories. Return only the new user stories in the same JSON format:
{{
  "user_stories": [ ... ]
}}
In total there should be between 20 to 50 stories.
You may consult background documents or tools as needed to retrieve helpful info.
"""

ux_prompt = """
You are a UX researcher. Given the following user stories in JSON format, add any missing stories related to user onboarding, accessibility, navigation, or error states. Do not modify existing stories. Return only the new user stories in the same JSON format:
{{
  "user_stories": [ ... ]
}}
In total there should be between 20 to 50 stories.
You may consult background documents or tools as needed to retrieve helpful info.
"""

questioner_prompt = """
You are a requirements analyst. Based on the following combined user stories, list 5-10 clarifying questions to ensure complete understanding of user needs.

Return your output as a JSON object:
{{
  "questions": [ "Question 1", "Question 2", ... ]
}}
In total there should be between 20 to 50 stories.
You may consult background documents or tools as needed to retrieve helpful info.
"""

refiner_prompt = """
You are an expert product manager. Using the previous user stories and the answers to clarifying questions provided, regenerate an exhaustive list of user stories, following the INVEST principles.
Additionally, remove any semantically overlapping or redundant user stories, even if phrased differently. Ensure the final list is comprehensive but not repetitive.
You may consult background documents or tools as needed to retrieve helpful info.
In total there should be between 20 to 50 stories.
Return only a valid JSON object with a single key 'user_stories', whose value is a list of user story objects."""

def build_prompt(template:str) -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        ("system", template),
        ("human", "{input}"),
        MessagesPlaceholder("agent_scratchpad")
    ])

def parse_json_or_log(output_text, parser):
    try:
        json_str = extract_json_block(output_text)
        return parser.parse(json_str)
    except Exception as e:
        logger.error(f"Failed to parse JSON: {e}\nOutput was:\n{output_text}")
        raise

def stories_to_json(stories: List[UserStory]) -> str:
    return json.dumps({"user_stories": [s.dict() for s in stories]}, indent=2)

def deduplicate_user_stories(stories: List[UserStory]) -> List[UserStory]:
    seen = set()
    unique = []
    for s in stories:
        key = (s.description.strip().lower(), tuple(sorted(s.acceptance_criteria)), s.priority)
        if key not in seen:
            seen.add(key)
            unique.append(s)
    return unique


# === Main Run ===
def call_agent(prompt_template: ChatPromptTemplate, input_text: str, tools: list, verbose: bool = True) -> str:
    # === Agent ===
    llm = ChatAnthropic(model="claude-3-5-sonnet-20241022")
    agent = create_tool_calling_agent(llm=llm, tools=tools, prompt=prompt_template)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=verbose)
    result = agent_executor.invoke({"input": input_text})
    
    output = result["output"]
    if isinstance(output, list) and output and "text" in output[0]:
        return output[0]["text"]
    elif isinstance(output, dict) and "text" in output:
        return output["text"]
    return str(output)

# === Main Function ===
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--add-new", action="store_true", help="Add new documents to the vectorstore")
    args = parser.parse_args()

    embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectorstore = prepare_vectorstore(embedding, config, args.add_new)
    retriever = vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={"k": config.search_k}
    )
    rag_tool_with_retriever = make_rag_tool(retriever)
    tools = [rag_tool_with_retriever]

    query = "An end-to-end restaurant management app that helps small-to-medium restaurants handle reservations, table assignments, menu customization, online orders, and staff shift scheduling, with a basic customer-facing interface for table booking and order tracking."
    pm_prompt_template = build_prompt(pm_prompt)
    pm_output_text = call_agent(pm_prompt_template, query, tools)
    user_stories_response = parse_json_or_log(pm_output_text, PydanticOutputParser(pydantic_object=UserStoriesResponse))
    current_stories = user_stories_response.user_stories

    with open("user_stories.json", "w") as f:
        f.write(stories_to_json(current_stories))

    while True:
        current_stories = deduplicate_user_stories(current_stories)

        qa_prompt_template = build_prompt(qa_prompt)
        qa_output = call_agent(qa_prompt_template, stories_to_json(current_stories),tools)
        print(qa_output)
        try:
            qa_stories = parse_json_or_log(qa_output, PydanticOutputParser(pydantic_object=UserStoriesResponse)).user_stories
            current_stories.extend(qa_stories)
        except ValidationError:
            logger.warning("No QA additions or parse error.")

        current_stories = deduplicate_user_stories(current_stories)

        ux_prompt_template = build_prompt(ux_prompt)
        ux_output = call_agent(ux_prompt_template, stories_to_json(current_stories),tools)
        print(ux_output)
        try:
            ux_stories = parse_json_or_log(ux_output, PydanticOutputParser(pydantic_object=UserStoriesResponse)).user_stories
            current_stories.extend(ux_stories)
        except ValidationError:
            logger.warning("No UX additions or parse error.")

        current_stories = deduplicate_user_stories(current_stories)

        questioner_prompt_template = build_prompt(questioner_prompt)
        questioner_output = call_agent(questioner_prompt_template, stories_to_json(current_stories), tools)
        try:
            questions_block = extract_json_block(questioner_output)
            questions = json.loads(questions_block).get("questions", [])
        except Exception as e:
            logger.error(f"Failed to parse questions JSON: {e}")
            questions = []

        if not questions:
            print("\nNo more questions. Finalizing user stories.")
            break

        print("\nPlease answer the following clarifying questions:")
        answers = {}
        for i, q in enumerate(questions):
            print(f"{i+1}. {q}")
            answers[q] = input(f"Answer {i+1}: ").strip()

        combined_input = stories_to_json(current_stories) + "\n\nHuman answers:\n" + json.dumps(answers, indent=2)
        refiner_prompt_template = build_prompt(refiner_prompt)
        refined_output = call_agent(refiner_prompt_template, combined_input, tools)
        refined_stories = parse_json_or_log(refined_output, PydanticOutputParser(pydantic_object=UserStoriesResponse)).user_stories
        current_stories = deduplicate_user_stories(refined_stories)
        

        # Save updated stories to file after each refinement
        with open("user_stories.json", "w") as f:
            f.write(stories_to_json(current_stories))

        cont = input("\nWould you like to refine again if needed? (y/n): ").strip().lower()
        if cont != 'y':
            break

    final_json = stories_to_json(current_stories)
    print("\n=== Final Comprehensive User Stories ===")
    print(final_json)
    logger.info("Final user stories:")
    logger.info(final_json)


if __name__ == "__main__":
    main()
