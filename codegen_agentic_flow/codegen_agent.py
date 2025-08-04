import json
import os
from typing import Optional
from pydantic import BaseModel, Field
from langchain.tools import StructuredTool
from utils.llm_utils import call_agent, extract_code_block, build_prompt, escape_curly_braces
from langchain_google_genai import ChatGoogleGenerativeAI
from prompts.react_prompts import codegen_agent_prompt
from llm_tools.codegen_tools import get_file_list_structured_tool, write_screen_code_to_file_tool,load_text_file_structured_tool


# --- Pydantic Models for Tool Inputs ---
CODEGEN_LLM = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)
# --- Pydantic Models for Tool Inputs ---

# --- Structured Tools ---
structuredTools = [
    load_text_file_structured_tool,
    write_screen_code_to_file_tool,
    get_file_list_structured_tool
]

# --- Tool Functions & Sub Agent ---

def codegen_sub_agent(
    instructions,
    layout_json_path,
    component_folder,
    screen_json_path,
    output_folder
):
    """
    Orchestrates React code generation for a screen.
    Passes only file/folder paths to the LLM; the agent uses its tools to open/read files and directories as needed.
    The agent is responsible for opening files, extracting the screen name, and writing the code using its tools.
    """
    # Prepare prompt context with only file/folder paths
    codegen_prompt = {
        "instructions": instructions,
        "layout_json_path": layout_json_path,
        "component_folder": component_folder,
        "output_folder": output_folder,
        "screen_json_path": screen_json_path
    }
    print(f"\n[Codegen Agent Context]: {codegen_prompt}")
    # Call the LLM agent, which will use its tools to open/read files and write code as needed
    codegen_response = call_agent(
        llm=CODEGEN_LLM,
        prompt_template=build_prompt(escape_curly_braces(codegen_agent_prompt)),
        input_text=codegen_prompt,
        tools=structuredTools,
        memory=None,
        verbose=True
    )

    # The agent should use its write_screen_code_to_file_tool to write the code itself.
    # No need to extract code or write the file here; just return the agent's response.
    return codegen_response