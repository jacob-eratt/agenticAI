import uuid
import json
from utils.llm_utils import call_agent, build_prompt, escape_curly_braces, extract_json_from_llm
from prompts.ui_component_creation_prompts import flow_generation_prompt
from langchain.memory import ConversationBufferMemory
import uuid
import json
from utils.llm_utils import call_agent, build_prompt, escape_curly_braces, extract_json_from_llm
from prompts.ui_component_creation_prompts import flow_generation_prompt
from langchain.memory import ConversationBufferMemory

def generate_user_flows(llm, user_stories_front_end, flows_file):
    """
    Iterates over user stories and generates user flows using the LLM.
    Tracks screen names and component names to encourage reuse and consistency.
    """
    user_flows = []
    screen_names_to_keep = set()
    screen_names_to_delete = set()
    component_names_used = set()  # Track all component names used so far

    for idx, story in enumerate(user_stories_front_end):
        print(f"\nGenerating user flow for story {idx}/{len(user_stories_front_end)}: {story['name']}")
        # Build the prompt for user flow generation
        story_context = json.dumps({
            "name": story["name"],
            "description": story["description"]
        }, indent=2)

        # Pass only screen_names_to_keep and component_names_used to the LLM
        screen_names_context = json.dumps(sorted(list(screen_names_to_keep)), indent=2)
        component_names_context = json.dumps(sorted(list(component_names_used)), indent=2)
        user_input = f"""
        USER STORY:
        {story_context}

        EXISTING SCREEN NAMES:
        {screen_names_context}

        EXISTING COMPONENT NAMES:
        {component_names_context}

        Please reuse existing screen and component names where possible. Only create a new screen or component if necessary, and explain why.
        """
        print(f"User input for LLM:\n{user_input}")

        memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
        )
        # Call the LLM to generate the user flow
        flow_response = call_agent(
            llm,
            build_prompt(escape_curly_braces(flow_generation_prompt)),
            input_text=user_input,
            tools=[],  # No tools needed
            memory=memory,
            verbose=True
        )
        flow_json = extract_json_from_llm(flow_response)
        flows_to_add = []

        if isinstance(flow_json, dict):
            flow_json["flow_id"] = str(uuid.uuid4())
            flow_json["story_id"] = story.get("id", story.get("story_id"))
            flows_to_add.append(flow_json)
        elif isinstance(flow_json, list):
            for flow in flow_json:
                flow["flow_id"] = str(uuid.uuid4())
                flow["story_id"] = story.get("id", story.get("story_id"))
                flows_to_add.append(flow)
        else:
            print(f"Failed to extract flow for story: {story['name']}")
            continue

        # Add flows and update screen/component name sets using only add/delete lists
        for flow in flows_to_add:
            user_flows.append(flow)
            # Add new screens to keep set
            if "screen_names_to_add" in flow and isinstance(flow["screen_names_to_add"], list):
                for name in flow["screen_names_to_add"]:
                    screen_names_to_keep.add(name)
            # Add screens to delete set and remove from keep set
            if "screen_names_to_delete" in flow and isinstance(flow["screen_names_to_delete"], list):
                for name in flow["screen_names_to_delete"]:
                    screen_names_to_delete.add(name)
                screen_names_to_keep -= set(flow["screen_names_to_delete"])
            screen_names_to_keep -= screen_names_to_delete

            # Extract component names from steps and add to set
            if "steps" in flow and isinstance(flow["steps"], list):
                for step in flow["steps"]:
                    if "component_name" in step:
                        component_names_used.add(step["component_name"])

            if "component_names_to_add" in flow and isinstance(flow["component_names_to_add"], list):
                for name in flow["component_names_to_add"]:
                    component_names_used.add(name)

        # Save user flows to file (outside the loop)
        with open(flows_file, "w", encoding="utf-8") as f:
            json.dump(user_flows, f, indent=2)
        print(f"User flows saved to {flows_file}")

        # Optionally, save the sets for later use
        with open("screen_names_to_keep.json", "w", encoding="utf-8") as f:
            json.dump(sorted(list(screen_names_to_keep)), f, indent=2)
        with open("component_names_used.json", "w", encoding="utf-8") as f:
            json.dump(sorted(list(component_names_used)), f, indent=2)