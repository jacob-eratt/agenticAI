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
from tools import *
from prompts import *
from app_queries import *
from chroma_db import *
import uuid
from typing import List, Dict, Any, Optional, Union
import logging
import json
import argparse
import csv


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


def run_tests(llm_list, grader_llm, tools, test_inputs, prompt_variants, results_file="test_results.csv"):
    results = []

    for llm_name, test_llm in llm_list:
        print(f"\n=== Testing prompts using LLM: {llm_name} ===\n")

        for input_item in test_inputs:
            print(f"Input: {input_item[:50]}...")

            # Step 1: Generate RTF reference themes using grader LLM
            rtf_prompt_template = None
            for name, template in prompt_variants:
                if name == "RTF":
                    rtf_prompt_template = template
                    break

            if rtf_prompt_template is None:
                logger.error("RTF prompt template not found in prompt_variants")
                continue

            try:
                rtf_prompt = build_prompt(rtf_prompt_template)
                rtf_response = call_agent(grader_llm, rtf_prompt, input_item, tools)
                rtf_data = parse_json_or_log(rtf_response, ThemeResponse)
                rtf_json = stories_to_json(rtf_data.theme)
                print("Generated RTF reference themes")
            except Exception as e:
                logger.error(f"[{llm_name}] Failed to generate RTF reference: {e}")
                continue

            # Prepare grading system prompt
            escaped_json = escape_curly_braces_for_langchain(rtf_json)
            grading_prompt_text = theme_eval_prompt_template.substitute(rtf_themes_json=escaped_json)

            # Step 2: Test all prompt variants on current LLM
            for prompt_name, prompt_template in prompt_variants:
                if prompt_name == "RTF":
                    continue  # skip the reference

                print(f"Generating themes with prompt: {prompt_name} using {llm_name}")
                try:
                    prompt = build_prompt(prompt_template)
                    candidate_response = call_agent(test_llm, prompt, input_item, tools)
                    candidate_data = parse_json_or_log(candidate_response, ThemeResponse)
                    candidate_json = stories_to_json(candidate_data.theme)
                except Exception as e:
                    logger.error(f"[{llm_name}] Theme generation failed for {prompt_name}: {e}")
                    continue

                # Step 3: Grade candidate themes using GPT-4 grader
                print(f"Grading output from {llm_name} using GPT-4")
                try:
                    grading_prompt = build_prompt(grading_prompt_text)
                    grading_input = f"""
                        Themes to grade:
                        {candidate_json}
                        Product Description:
                        {input_item},
                    """
                    grading_response = call_agent(grader_llm, grading_prompt, grading_input, tools)
                    grading_data = json.loads(extract_json_block(grading_response))
                except Exception as e:
                    logger.error(f"[{llm_name}] Grading failed for {prompt_name}: {e}")
                    continue

                result = {
                    "llm": llm_name,
                    "input": input_item,
                    "prompt_name": prompt_name,
                    "coverage": grading_data.get("coverage"),
                    "clarity": grading_data.get("clarity"),
                    "relevance": grading_data.get("relevance"),
                    "actionability": grading_data.get("actionability"),
                    "justification": grading_data.get("justification")
                }
                results.append(result)
                print(f"[{llm_name}] {prompt_name} scored and recorded")

    # Step 4: Save all results to CSV
    if results:
        fieldnames = list(results[0].keys())
        file_exists = os.path.isfile(results_file)
        with open(results_file, "a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            if not file_exists:
                writer.writeheader()
            writer.writerows(results)
        print(f"Results saved to {results_file}")
    else:
        print("No results to save.")




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
    ("gemini-2.5-flash", ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)),  # Corrected Gemini Flash model name
    ("gemini-2.5-pro", ChatGoogleGenerativeAI(model="gemini-2.5-pro", temperature=0)),
    # Add more test LLMs here
]

    google_grader = ChatGoogleGenerativeAI(model="gemini-2.5-pro", temperature=0)

    if args.test:
        print("running test")
        # You should have run_tests defined as shown in previous messages
        run_tests(llms_to_test, google_grader, tools, test_inputs, PROMPT_VARIANTS, results_file="test_results.csv")
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
