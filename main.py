from dotenv import load_dotenv
from pydantic import BaseModel, ValidationError, Field 
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor
from functools import partial
from tools import *
from prompts import *
from chroma_db import *
import re 
from typing import List, Dict, Any, Optional, Union
import logging
import json
import argparse


load_dotenv()

logging.basicConfig(
    filename='llm_output.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("my_app_logger")


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
    name: str
    description: str

class ThemeResponse(BaseModel):
    theme: List[Theme]

class Epic(BaseModel):
    name: str
    description: str

class EpicsResponse(BaseModel):
    epics: List[Epic]

class UserStory(BaseModel):
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
        parser = PydanticOutputParser(pydantic_object=model_cls)
        return parser.parse(json_str)
    except Exception as e:
        logger.error(f"Failed to parse JSON: {e}\nOutput was:\n{output_text}")
        raise


def call_agent( llm: Union[ChatOpenAI, ChatAnthropic], prompt_template: ChatPromptTemplate, input_text: str, tools: list, verbose: bool = True) -> str:
    agent = create_tool_calling_agent(llm=llm, tools=tools, prompt=prompt_template)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=verbose)
    result = agent_executor.invoke({"input": input_text})
    output = result.get("output", result)
    if isinstance(output, list) and output and "text" in output[0]:
        return output[0]["text"]
    elif isinstance(output, dict) and "text" in output:
        return output["text"]
    return str(output)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--add-new", action="store_true")
    parser.add_argument("--llm", choices=["anthropic","openai"], default="openai")
    args = parser.parse_args()

    if args.llm == "anthropic":
        llm = ChatAnthropic(model="claude-3-5-sonnet-20241022", temperature=0)
        theme_file = "themes_anthropic.json"
        epics_file = "epics_anthropic.json"
        user_stories = "user_stories_anthropic.json"
    else:
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        theme_file = "themes_gpt4o_mini.json"
        epics_file = "epics_gpt4o_mini.json"
        user_stories_file = "user_stories_gpt4o_mini.json"

    embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectorstore = prepare_vectorstore(embedding, config, args.add_new)
    retriever = vectorstore.as_retriever(search_type="mmr", search_kwargs={"k": config.search_k})
    tools = [make_rag_tool(retriever)]

    query = "An end-to-end restaurant management app that helps small-to-medium restaurants handle reservations, table assignments, menu customization, online orders, and staff shift scheduling, with a basic customer-facing interface for table booking and order tracking."

    # === Generate Themes ===
    theme_prompt_template = build_prompt(theme_generator_prompt)
    theme_response = call_agent(llm, theme_prompt_template, query, tools)
    themes_response = parse_json_or_log(theme_response, ThemeResponse)
    all_themes = themes_response.theme
    with open(theme_file, "w") as f:
        f.write(stories_to_json(all_themes))

    # === Generate Epics ===
    all_epics = []
    for theme in all_themes:
        epic_prompt_template = build_prompt(epic_generator_prompt)
        input_theme = f"{theme.name}: {theme.description}"
        epic_response = call_agent(llm,epic_prompt_template, input_theme, tools)
        epics_response = parse_json_or_log(epic_response, EpicsResponse)
        print(epics_response)
        all_epics.extend(epics_response.epics)
        print(all_epics)
    with open(epics_file, "w") as f:
        f.write(stories_to_json(all_epics))

    # === Generate User Stories ===
    all_stories = []
    for epic in all_epics:
        story_prompt_template = build_prompt(story_generator_prompt)
        input_epic = f"{epic.name}: {epic.description}"
        story_response = call_agent(llm, story_prompt_template, input_epic, tools)
        stories_data = parse_json_or_log(story_response, UserStoryResponse)
        print(stories_data)
        all_stories.extend(stories_data.user_stories)

    with open(user_stories_file, "w") as f:
        f.write(stories_to_json(all_stories))

    print("\n=== Final Comprehensive User Stories ===")
    print(stories_to_json(all_stories))
    logger.info("Final user stories:")
    logger.info(stories_to_json(all_stories))

if __name__ == "__main__":
    main()
