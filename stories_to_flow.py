import uuid
import json
from llm_utils import call_agent, build_prompt, escape_curly_braces, extract_json_from_llm
from prompts.ui_componenet_creation_prompts import flow_generation_prompt
from langchain.memory import ConversationBufferMemory

def generate_user_flows(llm, user_stories_front_end, flows_file):
    """
    Iterates over user stories and generates user flows using the LLM.
    Each flow is saved as a JSON object in the output file.
    """
    user_flows = []
    for idx, story in enumerate(user_stories_front_end):
        print(f"\nGenerating user flow for story {idx}/{len(user_stories_front_end)}: {story['name']}")
        # Build the prompt for user flow generation
        story_context = json.dumps({
            "name": story["name"],
            "description": story["description"]
        }, indent=2)

        user_input = f"""
        USER STORY:
        {story_context}"""

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
        # Ensure the flow has a unique flow_id and story_id is a list
# Ensure the flow has a unique flow_id and story_id is a list
        if isinstance(flow_json, dict):
            flow_json["flow_id"] = str(uuid.uuid4())
            flow_json["story_id"] = story["id"]
            user_flows.append(flow_json)
        elif isinstance(flow_json, list):
            for flow in flow_json:
                flow["flow_id"] = str(uuid.uuid4())
                flow["story_id"] = story["id"]
                user_flows.append(flow)
        else:
            print(f"Failed to extract flow for story: {story['name']}")
            continue

    # Save user flows to file
    with open(flows_file, "w", encoding="utf-8") as f:
        json.dump(user_flows, f, indent=2)
    print(f"User flows saved to {flows_file}")