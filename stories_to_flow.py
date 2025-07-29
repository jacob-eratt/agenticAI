import uuid
import json
from llm_utils import call_agent, build_prompt, escape_curly_braces, extract_json_from_llm
from prompts.ui_componenet_creation_prompts import flow_generation_prompt
from langchain.memory import ConversationBufferMemory

def generate_user_flows(llm, user_stories_front_end, flows_file):
    """
    Iterates over user stories and generates user flows using the LLM.
    Each flow is saved as a JSON object in the output file.
    Tracks all screen names and passes them to the LLM for each iteration.
    """
    user_flows = []
    screen_names = set()  # Track all screen names

    for idx, story in enumerate(user_stories_front_end):
        print(f"\nGenerating user flow for story {idx}/{len(user_stories_front_end)}: {story['name']}")
        # Build the prompt for user flow generation
        story_context = json.dumps({
            "name": story["name"],
            "description": story["description"]
        }, indent=2)

        # Pass current screen names to the LLM
        screen_names_context = json.dumps(sorted(list(screen_names)), indent=2)
        user_input = f"""
        USER STORY:
        {story_context}

        EXISTING SCREEN NAMES:
        {screen_names_context}
        Please reuse existing screen names where possible. Only create a new screen if necessary, and explain why.
        """

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

        # Add flows and extract screen names from steps
        for flow in flows_to_add:
            user_flows.append(flow)
            if "steps" in flow and isinstance(flow["steps"], list):
                for step in flow["steps"]:
                    if isinstance(step, dict) and "screen_name" in step:
                        screen_names.add(step["screen_name"])

    # Save user flows to file (outside the loop)
    with open(flows_file, "w", encoding="utf-8") as f:
        json.dump(user_flows, f, indent=2)
    print(f"User flows saved to {flows_file}")