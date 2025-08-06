import os
from langchain.tools import StructuredTool
from pydantic import BaseModel, Field
from utils.llm_utils import call_agent, build_prompt, escape_curly_braces
from codegen_agentic_flow.layout_agent import layout_sub_agent, layout_edit_agent
from codegen_agentic_flow.codegen_agent import codegen_sub_agent, codegen_edit_sub_agent
from prompts.react_prompts import main_agent_first_phase_prompt, main_agent_second_phase_prompt, app_entry_update_prompt
from langchain_google_genai import ChatGoogleGenerativeAI
from llm_tools.codegen_tools import get_file_list_tool
import json
from llm_tools.codegen_tools import load_text_file_structured_tool, write_screen_code_to_file_tool, get_file_list_structured_tool    
# --- Human Feedback Tool ---

MAIN_AGENT_LLM = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)

class GetFileListInput(BaseModel):
    directory: str = Field(..., description="Directory to list files from.")
# --- Get File List Tool ---

get_file_list_structured_tool = StructuredTool.from_function(
    func=lambda directory: get_file_list_tool(directory),
    name="get_file_list_tool",
    description="Returns a list of file names in the specified directory. Usage: directory (str) - the directory path to list files from.",
    args_schema=GetFileListInput
)

class CodegenAgentInput(BaseModel):
    instructions: str = Field(..., description="Instructions for the codegen agent (e.g., 'Generate React code', 'Refine code').")
    layout_json_path: str = Field(..., description="Path to the generated layout JSON file.")
    component_folder: str = Field(..., description="Folder containing component .jsx files.")
    screen_json_path: str = Field(..., description="Path to the per-screen JSON file or the screen JSON folder.")
    output_folder: str = Field(..., description="Folder to write the React code file.")

codegen_agent_structured_tool = StructuredTool.from_function(
    func=lambda instructions, layout_json_path, component_folder, screen_json_path, output_folder:
        codegen_sub_agent(
            instructions=instructions,
            layout_json_path=layout_json_path,
            component_folder=component_folder,
            screen_json_path=screen_json_path,
            output_folder=output_folder,
        ),
    name="codegen_agent_tool",
    description=(
        "Generates or refines React code for a screen using the codegen agent and writes it to the output folder. "
        "Parameters (in order): instructions (str) - instructions for codegen agent; "
        "layout_json_path (str) - path to the generated layout JSON file; "
        "component_folder (str) - folder containing component .jsx files; "
        "screen_json_path (str) - path to the per-screen JSON file or the screen JSON folder; "
        "output_folder (str) - folder to write the React code file."
    ),
    args_schema=CodegenAgentInput
)

class LayoutAgentInput(BaseModel):
    instructions: str = Field(..., description="Instructions for the layout agent (e.g., 'Create layout', 'Refine layout').")
    screen_json_path: str = Field(..., description="Path to the specific screen JSON file within the screen JSON folder")
    component_folder: str = Field(..., description="Folder containing component .jsx files.")
    output_folder: str = Field(..., description="Folder to write the layout JSON.")

layout_agent_structured_tool = StructuredTool.from_function(
    func=lambda instructions, screen_json_path, component_folder, output_folder:
        layout_sub_agent(
            instructions=instructions,
            screen_json_path=screen_json_path,
            component_folder=component_folder,
            output_folder=output_folder,
        ),
    name="layout_agent_tool",
    description=(
        "Generates or refines a screen layout using the layout agent and writes it to the output folder. "
        "Parameters (in order): instructions (str) - instructions for layout agent; "
        "screen_json_path (str) - Path to the specific screen JSON file within the screen JSON folder "
        "component_folder (str) - folder with component .jsx files; "
        "output_folder (str) - folder to write layout JSON."
    ),
    args_schema=LayoutAgentInput
)

class AppEntryAgentInput(BaseModel):
    components_dir: str = Field(..., description="Directory containing component files.")
    pages_dir: str = Field(..., description="Directory containing page/screen files.")
    instructions: str = Field("Update entry files for Chakra UI and screen routing.", description="Instructions for the app entry sub-agent.")


app_entry_structured_tool = StructuredTool.from_function(
    func=lambda components_dir, pages_dir, 
        instructions="Update entry files for Chakra UI and screen routing.": app_entry_sub_agent(
        components_dir=components_dir,
        pages_dir=pages_dir,
        instructions=instructions
    ),
    name="app_entry_structured_tool",
    description=(
        "Updates or creates App.jsx, App.css, main.jsx, and index.css for Chakra UI integration and screen routing. "
        "Parameters: components_dir (str) - directory containing component files; "
        "pages_dir (str) - directory containing page/screen files; "
        "instructions (str, optional) - instructions for the app entry sub-agent. "
        "Automatically determines file paths for App.jsx, App.css, main.jsx, and index.css based on the components_dir."
    ),
    args_schema=AppEntryAgentInput
)

# --- Main Agent Tools Registry ---

main_agent_tools = [
    layout_agent_structured_tool,
    codegen_agent_structured_tool,
    get_file_list_structured_tool
]

# --- Main Agent Function ---

def main_agent(
    prompt: str,
    screen_json_path: str,
    component_folder: str,
    layout_output_folder: str,
    screen_code_output_folder: str,
):
    """
    Main agent orchestration for a single screen or for refinement.
    """
    # Compose context for the agent
    context = {
        "screen_json_path": screen_json_path,
        "component_folder": component_folder,
        "layout_output_folder": layout_output_folder,
        "screen_code_output_folder": screen_code_output_folder,
    }
    print(f"\n[Main Agent Context]: {context}")
    # The agent can use its tools to load, generate, and write as needed
    result = call_agent(
        llm=MAIN_AGENT_LLM,
        prompt_template=build_prompt(escape_curly_braces(prompt)),
        input_text=str(context),
        tools=main_agent_tools,
        memory=None,
        verbose=True
    )
    print(f"\n[Main Agent Output]:\n{result}")

# --- Entrypoint for main.py ---

def run_main_agent_workflow(
    screen_json_folder,
    component_folder,
    layout_output_folder,
    screen_code_output_folder
):
    # Phase 1: Initial generation (per screen)
    pages_folder = os.path.join("react-ui", "src", "pages")
    for screen_file in os.listdir(screen_json_folder):
        if not screen_file.endswith(".json"):
            continue
        screen_json_path = os.path.join(screen_json_folder, screen_file)

        # Derive screen name (without .json extension)
        screen_name = os.path.splitext(screen_file)[0]
        # Check if code file exists in pages_folder (e.g., MyScreen.jsx or MyScreen.tsx)
        code_exists = False
        for ext in [".jsx", ".tsx", ".js", ".ts"]:
            code_path = os.path.join(pages_folder, f"{screen_name}{ext}")
            if os.path.exists(code_path):
                code_exists = True
                break
        if code_exists:
            print(f"[Skip] Code for '{screen_name}' already exists in pages folder. Skipping.")
            continue

        main_agent(
            prompt=main_agent_first_phase_prompt,
            screen_json_path=screen_json_path,
            component_folder=component_folder,
            layout_output_folder=layout_output_folder,
            screen_code_output_folder=screen_code_output_folder,
        )
    
    app_jsx_entry_point = os.path.join("react-ui", "src", "App.jsx")
    context = {
        "components_dir": component_folder,
        "pages_dir": screen_code_output_folder,
        "app_jsx file": app_jsx_entry_point
    }
    print(f"\n[App Entry Generation Context]: {context}")

    # Use the same tools for file listing, reading, and writing

    app_entry_sub_agent(
        components_dir=component_folder,
        pages_dir=screen_code_output_folder,
        instructions=app_entry_update_prompt
    )

    # # Phase 3: Interactive post-generation editing loop
    # run_post_generation_editing_loop(
    #     screen_json_folder=screen_json_folder,
    #     component_folder=component_folder,
    #     layout_output_folder=layout_output_folder,
    #     screen_code_output_folder=screen_code_output_folder
    # )

# --- Interactive Post-Generation Editing Loop ---

class LayoutEditAgentInput(BaseModel):
    instructions: str = Field(
        ...,
        description="High-level instructions for editing the layout (e.g., 'Move WeatherCard to header', 'Change grid columns to 2')."
    )
    screen_json_path: str = Field(
        ...,
        description="Path to the specific screen JSON file within the screen JSON folder."
    )
    component_folder: str = Field(
        ...,
        description="Folder containing component .jsx files."
    )
    layout_file_path: str = Field(
        ...,
        description="Path to the existing layout JSON file to edit."
    )

layout_edit_agent_structured_tool = StructuredTool.from_function(
    func=lambda instructions, screen_json_path, component_folder, layout_file_path:
        layout_edit_agent(
            instructions=instructions,
            screen_json_path=screen_json_path,
            component_folder=component_folder,
            layout_file_path=layout_file_path,
        ),
    name="layout_edit_agent_tool",
    description=(
        "Edits an existing layout JSON file for a React screen based on high-level instructions. "
        "Does not loop over each component; instead, makes targeted changes to the overall layout as requested. "
        "Parameters (in order): instructions (str) - high-level instructions for editing the layout; "
        "screen_json_path (str) - path to the specific screen JSON file within the screen JSON folder; "
        "component_folder (str) - folder with component .jsx files; "
        "layout_file_path (str) - path to the existing layout JSON file to edit."
    ),
    args_schema=LayoutEditAgentInput
)


class CodegenEditAgentInput(BaseModel):
    instructions: str = Field(
        ...,
        description="Instructions for the codegen agent (e.g., 'Refactor component', 'Add prop', 'Fix bug')."
    )
    layout_json_path: str = Field(
        ...,
        description="Path to the layout JSON file for the screen."
    )
    component_folder: str = Field(
        ...,
        description="Folder containing component .jsx files."
    )
    screen_json_path: str = Field(
        ...,
        description="Path to the specific screen JSON file within the screen JSON folder."
    )
    file_to_edit: str = Field(
        ...,
        description="Path to the specific file to edit (e.g., a component or screen file)."
    )

codegen_edit_agent_structured_tool = StructuredTool.from_function(
    func=lambda instructions, layout_json_path, component_folder, screen_json_path, file_to_edit:
        codegen_edit_sub_agent(
            instructions=instructions,
            layout_json_path=layout_json_path,
            component_folder=component_folder,
            screen_json_path=screen_json_path,
            file_to_edit=file_to_edit
        ),
    name="codegen_edit_agent_tool",
    description=(
        "Edits an existing React code file (component, screen, etc.) based on high-level instructions. "
        "Parameters (in order): instructions (str) - instructions for the codegen agent; "
        "layout_json_path (str) - path to the layout JSON file for the screen; "
        "component_folder (str) - folder with component .jsx files; "
        "screen_json_path (str) - path to the specific screen JSON file; "
        "file_to_edit (str) - path to the file to edit."
    ),
    args_schema=CodegenEditAgentInput
)



edit_agent_tools = [
    layout_edit_agent_structured_tool,
    codegen_edit_agent_structured_tool,
    get_file_list_structured_tool
]


def run_post_generation_editing_loop(
    screen_json_folder,
    component_folder,
    layout_output_folder,
    screen_code_output_folder
):
    """
    Interactive loop for post-generation UI editing.
    Prompts the user for changes, applies them, and persists state.
    """
    print("\n--- Post-generation UI Editing ---")
    print("You can add, edit, or delete screens, component types, or component instances.")
    print("Type 'done' when you are satisfied with the UI.")
    while True:
        user_request = input("\nWhat would you like to add, edit, or delete? (or type 'done' to finish): ")
        if user_request.strip().lower() == "done":
            print("Post-generation editing complete.")
            break

        # Pass only directory paths and user request to call_agent
        context = {
            "screen_json_folder": screen_json_folder,
            "component_folder": component_folder,
            "layout_output_folder": layout_output_folder,
            "screen_code_output_folder": screen_code_output_folder,
            "user_request": user_request
        }
        result = call_agent(
            llm=MAIN_AGENT_LLM,
            prompt_template=build_prompt(escape_curly_braces(main_agent_second_phase_prompt)),
            input_text=str(context),
            tools=edit_agent_tools,
            memory=None,
            verbose=True
        )
        print(f"\nAgent result:\n{result}")






def app_entry_sub_agent(
    components_dir,
    pages_dir,
    instructions=None
):
    """
    Sub-agent that updates/creates App.jsx, App.css, main.jsx, and index.css for Chakra UI integration and screen routing.
    Accepts instructions from the main agent and acts accordingly.
    """
    src_folder = os.path.dirname(components_dir)
    app_jsx_path = "react-ui/src/App.jsx"
    app_css_path = "react-ui/src/App.css"
    main_jsx_path = "react-ui/src/main.jsx"
    index_css_path = "react-ui/src/index.css"

    context = {
        "app_jsx_path": app_jsx_path,
        "app_css_path": app_css_path,
        "main_jsx_path": main_jsx_path,
        "index_css_path": index_css_path,
        "components_dir": components_dir,
        "pages_dir": pages_dir,
        "instructions": instructions or "Update entry files for Chakra UI and screen routing."
    }
    print(f"\n[App Entry Sub-Agent Context]: {context}")

    prompt = app_entry_update_prompt.format(
        app_jsx_path=app_jsx_path,
        app_css_path=app_css_path,
        main_jsx_path=main_jsx_path,
        index_css_path=index_css_path,
        components_dir=components_dir,
        pages_dir=pages_dir
    )

    result = call_agent(
        llm=MAIN_AGENT_LLM,
        prompt_template=build_prompt(escape_curly_braces(prompt)),
        input_text=str(context),
        tools=[load_text_file_structured_tool, write_screen_code_to_file_tool, get_file_list_structured_tool],
        memory=None,
        verbose=True
    )
    print(f"\n[App Entry Sub-Agent Output]:\n{result}")
    return result