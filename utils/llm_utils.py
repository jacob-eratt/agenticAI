import json
import os
import re
from typing import Any, Type, Union
import logging
import ast
import sys
from pydantic import BaseModel, ValidationError
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_xai import ChatXAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.documents import Document

logger = logging.getLogger("my_app_logger")

# If you use logger or extract_json_block elsewhere, import them too:
# from your_logger_module import logger
# from your_json_utils import extract_json_block

def escape_curly_braces(prompt: str) -> str:
    """
    Escapes all curly braces in a prompt string.
    """
    return prompt.replace("{", "{{").replace("}", "}}")

def extract_json(output: str) -> Any:
    """
    Extracts the first valid JSON object from an LLM output string.
    """
    match = re.search(r"\{.*\}", output, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return None

def remove_key_from_llm_output(output: dict, key: str) -> dict:
    """
    Returns the dict without the specified key.
    """
    if key in output:
        output = output.copy()
        output.pop(key)
    return output

def parse_llm_output_to_model(output: str, model: Type[BaseModel]) -> Any:
    """
    Parses LLM output (string or dict) to a specific Pydantic model.
    """
    if isinstance(output, str):
        data = extract_json(output)
    else:
        data = output
    try:
        return model.parse_obj(data)
    except ValidationError as e:
        print(f"Validation error: {e}")



def build_prompt(template: str) -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        ("system", template),
        ("human", "{input}"),
        MessagesPlaceholder("agent_scratchpad")
    ])

def parse_json_or_log(output_text, model_cls):
    try:
        json_str = extract_json(output_text)
        data = json.loads(json_str)
        result = model_cls(**data)
        return result
    except Exception as e:
        logger.error(f"Failed to parse JSON: {e}\nOutput was:\n{output_text}")
        raise

def extract_json_from_llm(llm_output, key="output"):
    """
    If llm_output is a dict with a key whose value is a JSON string or dict,
    extract and return the JSON object.
    """
    if isinstance(llm_output, dict) and key in llm_output:
        value = llm_output[key]
        if isinstance(value, str):
            return extract_json(value)
        elif isinstance(value, dict):
            return value
    # If output is a string, try to extract JSON
    if isinstance(llm_output, str):
        return extract_json(llm_output)
    return llm_output

import re

def extract_code_block(text: str) -> str:
    """
    Extracts the first code block (triple backticks) from a string.
    Returns the code as a string, or None if not found.
    Supports optional language specifier after the backticks.
    """
    match = re.search(r"```(?:\w+\n)?(.*?)```", text, re.DOTALL)
    if match:
        return match.group(1).strip()

def call_agent(llm: Union[ChatOpenAI, ChatAnthropic, ChatXAI, ChatGoogleGenerativeAI], prompt_template: ChatPromptTemplate, input_text: str, tools: list, memory=None, verbose: bool = True) -> str:
    agent = create_tool_calling_agent(llm=llm, tools=tools, prompt=prompt_template)
    original_stdout = sys.stdout
    try:
        sys.stdout = open("llm_verbose.log", "a", encoding="utf-8")
        agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=verbose, max_iterations=30)
        if memory and hasattr(memory, "load_memory_variables"):
            messages = memory.load_memory_variables({}).get("chat_history", [])
        else:
            messages = memory if memory else []
        result = agent_executor.invoke({"input": input_text, "chat_history": messages})
        output = result.get("output", result)
        if isinstance(output, list) and output and "text" in output[0]:
            return output[0]["text"]
        elif isinstance(output, dict) and "text" in output:
            return output["text"]
        return str(output)
    finally:
        sys.stdout.close()
        sys.stdout = original_stdout















def add_boxes_to_vectordb(boxes, vectorstore):
    """
    Add all boxes to the vector DB, storing only story IDs in metadata (as a JSON string).
    """
    box_docs = []
    for box in boxes:
        story_ids = [story["id"] for story in box.get("stories", []) if "id" in story]
        doc = Document(
            page_content=box["description"],
            metadata={
                "id": box["id"],
                "name": box["name"],
                "container": box["container"],
                "story_ids": json.dumps(story_ids),  # <-- Serialize as JSON string
                "type": "box"
            }
        )
        box_docs.append(doc)
    print(f"Adding {len(box_docs)} boxes to vectorstore (with story IDs only)...")
    vectorstore.add_documents(box_docs)
    print("Boxes added to vectorstore.")


def add_screens_to_vectordb(screens, vectorstore):
    """
    Add all screens to the vector DB, storing box IDs in metadata as a JSON string.
    """
    screen_docs = []
    for screen in screens.values():
        box_ids = [box["id"] for box in screen.boxes]
        doc = Document(
            page_content=screen.description,
            metadata={
                "name": screen.name,
                "boxes": json.dumps(box_ids),  # <-- Serialize as JSON string
                "type": "screen"
            }
        )
        screen_docs.append(doc)
    print(f"Adding {len(screen_docs)} screens to vectorstore...")
    vectorstore.add_documents(screen_docs)
    print("Screens added to vectorstore.")


def safe_parse_props(props):
    if isinstance(props, dict):
        return props
    if isinstance(props, str):
        try:
            result = ast.literal_eval(props)
            if isinstance(result, dict):
                return result
            raise ValueError("Parsed props string is not a dict")
        except Exception as e:
            raise ValueError(f"Could not parse props string as dict: {e}")
    raise ValueError("props must be a dict or a string representing a dict")

def safe_parse_supported_props(supported_props):
    if isinstance(supported_props, list):
        return supported_props
    if isinstance(supported_props, str):
        try:
            result = ast.literal_eval(supported_props)
            if isinstance(result, list):
                return result
            raise ValueError("Parsed supported_props string is not a list")
        except Exception as e:
            raise ValueError(f"Could not parse supported_props string as list: {e}")
    raise ValueError("supported_props must be a list or a string representing a list")


