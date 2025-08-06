import json
import os
from typing import Optional
from pydantic import BaseModel, Field
from langchain.tools import StructuredTool
from utils.llm_utils import call_agent, build_prompt, escape_curly_braces
from langchain_google_genai import ChatGoogleGenerativeAI
from prompts.react_prompts import layout_instructions, layout_edit_instructions
from llm_tools.codegen_tools import load_text_file_structured_tool, write_layout_to_file_structured_tool, get_file_list_structured_tool
from utils.json_utils import to_pascal_case
LLM_FOR_LAYOUT_GEN = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)


def layout_sub_agent(
    instructions,        # str: Instructions for the layout agent (e.g., "Create layout", "Refine layout")
    screen_json_path,    # str: Path to the per-screen JSON file containing screen/component info
    component_folder,    # str: Folder containing component .jsx files
    output_folder,       # str: Folder to write the generated layout JSON
):
    """
    Iteratively builds up the layout for a screen, component by component.
    The agent explores files as needed, but you control the iteration.
    Returns error messages if files or folders are missing or if JSON parsing fails.
    """
    # Check if screen_json_path exists
    if not os.path.isfile(screen_json_path):
        return f"Error: screen_json_path '{screen_json_path}' does not exist."

    # Check if component_folder exists
    if not os.path.isdir(component_folder):
        return f"Error: component_folder '{component_folder}' does not exist."

    # Check if output_folder exists
    if not os.path.isdir(output_folder):
        return f"Error: output_folder '{output_folder}' does not exist."

    # Load the screen JSON to get the component instance IDs
    try:
        with open(screen_json_path, "r", encoding="utf-8") as f:
            screen_data = json.load(f)
    except Exception as e:
        return f"Error: Failed to read or parse screen JSON file '{screen_json_path}': {e}"

    component_instance_ids = screen_data.get("screen", {}).get("component_instance_ids", [])
    components = {c["id"]: c for c in screen_data.get("screen", {}).get("components", [])}

    initial_context = {
        "screen_description": screen_data.get("screen", {}).get("description", ""),
        "component_summaries": [
            {
                "id": c["id"],
                "type_id": c.get("type_id", ""),
                "description": c.get("description", ""),
                "label": c.get("props", {}).get("label", "")
            }
            for c in screen_data.get("screen", {}).get("components", [])
        ]
    }
    for comp_id in component_instance_ids:
        comp_data = components.get(comp_id, {})
        pascal_screen_name = to_pascal_case(screen_data["screen"]["name"])
        layout_file_path = os.path.join(output_folder, f"{pascal_screen_name}_layout.json")

        # Ensure the layout file exists before the LLM tries to open it
        if not os.path.isfile(layout_file_path):
            with open(layout_file_path, "w", encoding="utf-8") as lf:
                lf.write("")  # Write an empty file
        iter_instructions = (
            f"{instructions}\n"
            f"Screen Description: {initial_context['screen_description']}\n"
            f"Component List: {json.dumps(initial_context['component_summaries'])}\n"
            f"Place the following component in the layout:\n"
            f"Component ID: {comp_id}\n"
            f"Component Type: {comp_data.get('type_id', '')}\n"
            f"Component Props: {json.dumps(comp_data.get('props', {}))}\n"
            f"Component Description: {comp_data.get('description', '')}\n"
            f"Open the layout file specified by the layout file path. Understand the current layout. Update the layout by adding the new component, optimizing grouping, sizing, and sectioning as needed. Output the full, updated layout JSON. You must ensure that no information is lost. You are not just rewriting the newest component but ensure that all previous components and their layout descriptions are not lost in the process:"
        )

        layout_prompt = {
            "screen_json_path": screen_json_path,
            "component_folder": component_folder,
            "layout_file_path": layout_file_path,
            "instructions": iter_instructions
        }

        agent_tools = [
            load_text_file_structured_tool,
            write_layout_to_file_structured_tool,
            get_file_list_structured_tool
        ]

        try:
            layout_response = call_agent(
                llm=LLM_FOR_LAYOUT_GEN,
                prompt_template=build_prompt(escape_curly_braces(layout_instructions)),
                input_text=layout_prompt,
                tools=agent_tools,
                memory=None,
                verbose=True
            )
            # No need to set current_layout; just rely on file contents for next iteration
        except Exception as e:
            return f"Error: Failed to update layout for component {comp_id}: {e}"

    return "Success: Layout generated and written to output folder by agent."



def layout_edit_agent(
    instructions,        # str: Instructions for the layout agent (e.g., "Move WeatherCard to header", "Change grid columns to 2")
    screen_json_path,    # str: Path to the per-screen JSON file containing screen/component info
    component_folder,    # str: Folder containing component .jsx files
    layout_file_path,  # str: Path to the existing layout JSON file to edit
):
    """
    Edits the layout for a screen in a single operation, based on high-level instructions.
    This agent does NOT loop over each component; it expects the instructions to describe the desired layout changes directly.
    Returns error messages if files or folders are missing or if JSON parsing fails.
    """
    # Check if screen_json_path exists
    if not os.path.isfile(screen_json_path):
        return f"Error: screen_json_path '{screen_json_path}' does not exist."

    # Check if component_folder exists
    if not os.path.isdir(component_folder):
        return f"Error: component_folder '{component_folder}' does not exist."

    # Load the screen JSON to get the screen name
    try:
        with open(screen_json_path, "r", encoding="utf-8") as f:
            screen_data = json.load(f)
    except Exception as e:
        return f"Error: Failed to read or parse screen JSON file '{screen_json_path}': {e}"

    # Ensure the layout file exists before the LLM tries to open it
    if not os.path.isfile(layout_file_path):
        return f"Error: layout file '{layout_file_path}' does not exist. Please create it first."

    # Prepare context for the agent
    initial_context = {
        "screen_description": screen_data.get("screen", {}).get("description", ""),
        "component_summaries": [
            {
                "id": c["id"],
                "type_id": c.get("type_id", ""),
                "description": c.get("description", ""),
                "label": c.get("props", {}).get("label", "")
            }
            for c in screen_data.get("screen", {}).get("components", [])
        ]
    }

    iter_instructions = (
        f"{instructions}\n"
        f"Screen Description: {initial_context['screen_description']}\n"
        f"Component List: {json.dumps(initial_context['component_summaries'])}\n"
        f"Open the layout file specified by the layout file path. Understand the current layout. "
        f"Update the layout according to the instructions above. Output the full, updated layout JSON. "
        f"You must ensure that no information is lost. Never remove or overwrite existing components, containers, or layout nodes unless explicitly instructed. "
        f"Preserve all unrelated code and layout. If you are unsure, halt and request clarification."
    )

    layout_prompt = {
        "screen_json_path": screen_json_path,
        "component_folder": component_folder,
        "layout_file_path": layout_file_path,
        "instructions": iter_instructions
    }

    agent_tools = [
        load_text_file_structured_tool,
        write_layout_to_file_structured_tool,
        get_file_list_structured_tool
    ]

    try:
        layout_response = call_agent(
            llm=LLM_FOR_LAYOUT_GEN,
            prompt_template=build_prompt(escape_curly_braces(layout_edit_instructions)),
            input_text=layout_prompt,
            tools=agent_tools,
            memory=None,
            verbose=True
        )
    except Exception as e:
        return f"Error: Failed to update layout: {e}"

    return "Success: Layout edited and written to output folder by layout agent."