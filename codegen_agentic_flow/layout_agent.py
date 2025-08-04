import json
import os
from typing import Optional
from pydantic import BaseModel, Field
from langchain.tools import StructuredTool
from utils.llm_utils import call_agent, build_prompt, escape_curly_braces
from langchain_google_genai import ChatGoogleGenerativeAI
from prompts.react_prompts import layout_instructions
from llm_tools.codegen_tools import load_text_file_structured_tool, write_layout_to_file_structured_tool, get_file_list_structured_tool


# --- Pydantic Models for Tool Inputs ---
LLM_FOR_LAYOUT_GEN = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)

def layout_sub_agent(
    instructions,
    screen_json_path,
    component_folder,
    output_folder,
):
    # Prepare prompt for LLM
    layout_prompt = {
        "output_folder": output_folder,
        "screen_json_path": screen_json_path,
        "component_folder": component_folder,
        "instructions": instructions
    }


    agent_tools = [
        load_text_file_structured_tool,
        write_layout_to_file_structured_tool,
        get_file_list_structured_tool
    ]

    # Call LLM to generate/refine layout, passing the tools array so the agent can use them
    layout_response = call_agent(
        llm=LLM_FOR_LAYOUT_GEN,
        prompt_template=build_prompt(escape_curly_braces(layout_instructions)),
        input_text=layout_prompt,
        tools=agent_tools,
        memory=None,
        verbose=True
    )





