import json
from langchain.memory import ConversationBufferMemory
from langchain.tools import StructuredTool
from utils.llm_utils import call_agent, build_prompt, escape_curly_braces, extract_json_from_llm
from utils.pydantic_models import *
from prompts.ui_componenet_creation_prompts import screen_assignment_instructions
from llm_tools.box_to_screen_tools import add_box_to_screen, move_box_between_screens, create_screen, delete_screen, edit_screen_description, get_screen_names, get_screen_details




screens = {}
# --- TOOL WRAPPERS ---
add_box_to_screen_tool = StructuredTool.from_function(
    name="add_box_to_screen",
    description="Add a UI component box to a screen. Creates the screen if it does not exist.",
    args_schema=AddBoxToScreenInput,
    func=lambda box_id, screen_name, screen_description: add_box_to_screen(
        box_id, screen_name, screen_description, screens
    ),
)

move_box_between_screens_tool = StructuredTool.from_function(
    name="move_box_between_screens",
    description="Move a box from one screen to another.",
    args_schema=MoveBoxBetweenScreensInput,
    func=lambda box_id, from_screen, to_screen: move_box_between_screens(
        box_id, from_screen, to_screen, screens
    ),
)

create_screen_tool = StructuredTool.from_function(
    name="create_screen",
    description="Create a new screen.",
    args_schema=CreateScreenInput,
    func=lambda screen_name, description: create_screen(screen_name, description, screens)
)

delete_screen_tool = StructuredTool.from_function(
    name="delete_screen",
    description="Delete a screen.",
    args_schema=DeleteScreenInput,
    func=lambda screen_name: delete_screen(screen_name, screens)
)

edit_screen_description_tool = StructuredTool.from_function(
    name="edit_screen_description",
    description="Edit the description of a screen.",
    args_schema=EditScreenDescriptionInput,
    func=lambda screen_name, new_description: edit_screen_description(screen_name, new_description, screens)
)

get_screen_names_tool = StructuredTool.from_function(
    name="get_screen_names",
    description="List all screen names.",
    args_schema=EmptyInput,
    func=lambda: get_screen_names(screens)
)

get_screen_details_tool = StructuredTool.from_function(
    name="get_screen_details",
    description="Get details for a specific screen.",
    args_schema=GetScreenDetailsInput,
    func=lambda screen_name: get_screen_details(screen_name, screens)
)

screen_tools = [
    add_box_to_screen_tool,
    move_box_between_screens_tool,
    create_screen_tool,
    delete_screen_tool,
    edit_screen_description_tool,
    get_screen_names_tool,
    get_screen_details_tool
]


# --- MAIN LOGIC LOOP ---

def assign_boxes_to_screens_with_llm(llm, frontend_boxes, app_query):
    """
    For each frontend box, prompt the LLM to place it in the correct screen using the available tools.
    Maintain a memory buffer of the 3 most recent box assignments (report objects).
    """
    placement_history = []  # Holds dicts with box_name, screen_name, reason, key_insights
    llm_outputs = []
    for box in frontend_boxes:
        recent_memory = placement_history[-3:]
        memory_json = json.dumps(recent_memory, indent=2)

        user_prompt = (
            "Here is the UI component box:\n"
            f"Box ID: {box['id']}\n"
            f"Box Name: {box['name']}\n"
            f"Box Description: {box['description']}\n"
            f"User Stories: {json.dumps([story['name'] for story in box['stories']], indent=2)}\n\n"
            "Here are the 3 most recent box-to-screen assignments (memory buffer):\n"
            f"{memory_json}\n\n"
            "Here is the app query describing the main purpose and user flows:\n"
            f"{app_query}\n\n"
        )

        print(f"User prompt: {user_prompt}")

        memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
        )

        result = call_agent(
            llm=llm,
            prompt_template=build_prompt(escape_curly_braces(screen_assignment_instructions)),
            input_text=user_prompt,
            tools=screen_tools,
            memory=memory,
            verbose=True
        )

        print(f"LLM result: {result}")
        llm_outputs.append(str(result))
        # Extract the output report JSON from the LLM result
        report = extract_json_from_llm(result)
        if report and isinstance(report, dict):
            placement_history.append(report)
    
        # Dump all LLM outputs to a file
    with open("llm_outputs.txt", "w", encoding="utf-8") as f:
        for output in llm_outputs:
            f.write(output + "\n\n")

    return 
    

