import json

def get_screen_data(screen_name, screens, instances, types):
    # Find the screen by name
    screen = next((s for s in screens.values() if s['name'] == screen_name), None)
    if not screen:
        raise ValueError(f"Screen '{screen_name}' not found.")
    # Gather component instances for this screen
    instance_objs = [instances[iid] for iid in screen['component_instance_ids'] if iid in instances]
    # Gather component types for these instances
    type_ids = set(inst['type_id'] for inst in instance_objs if 'type_id' in inst)
    type_objs = [types[tid] for tid in type_ids if tid in types]
    return screen, instance_objs, type_objs

def build_layout_prompt(screen, instance_objs, type_objs):
    # Merge all info into a single prompt for the LLM
    prompt = {
        "screen": {
            "name": screen["name"],
            "description": screen.get("description", ""),
        },
        "component_instances": [
            {
                "id": inst["id"],
                "type_id": inst["type_id"],
                "props": inst.get("props", {}),
                "description": inst.get("description", "")
            }
            for inst in instance_objs
        ],
        "component_types": [
            {
                "id": typ["id"],
                "name": typ["name"],
                "description": typ.get("description", ""),
                "supported_props": typ.get("supported_props", [])
            }
            for typ in type_objs
        ]
    }
    return json.dumps(prompt, indent=2)

def layout_agent(screen_name, screens, instances, types, llm_layout, llm_code=None):
    # Step 1: Gather and merge all info
    screen, instance_objs, type_objs = get_screen_data(screen_name, screens, instances, types)
    layout_prompt = build_layout_prompt(screen, instance_objs, type_objs)
    
    # Step 2: Pass to LLM for layout generation
    layout_response = call_agent(
        llm=llm_layout,
        prompt_template="You are a React layout expert. Given the following screen and components, create a layout using Chakra UI best practices. Output a layout description or JSX code.",
        input_text=layout_prompt,
        tools=[],
        memory=None,
        verbose=True
    )
    
    # Step 3: Optionally, pass layout to code LLM
    if llm_code:
        code_response = call_agent(
            llm=llm_code,
            prompt_template="Convert the following layout description into a complete React JSX file using Chakra UI.",
            input_text=layout_response,
            tools=[],
            memory=None,
            verbose=True
        )
        return code_response
    else:
        return layout_response

# Usage example:
# screens = json.load(open("screens_human_altered.json"))
# instances = json.load(open("component_instances_original.json"))
# types = json.load(open("component_types_original.json"))
# result = layout_agent("dashboard_screen", screens, instances, types, llm_layout, llm_code)