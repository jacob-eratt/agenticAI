import json
import os
from collections import defaultdict
from utils.llm_utils import call_agent, build_prompt, escape_curly_braces, extract_code_block
from prompts.react_prompts import react_component_generation_system_prompt

def load_json_list(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def to_snake_case(name):
    import re
    name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    name = re.sub('([a-z0-9])([A-Z])', r'\1_\2', name)
    return name.replace(" ", "_").lower()

def gather_instances_by_type(instances):
    instances_by_type = defaultdict(list)
    for inst in instances:
        type_id = inst.get("type_id")
        if type_id:
            instances_by_type[type_id].append(inst)
    return instances_by_type

def generate_component_code_llm(component_type, instances, llm):
    # Prepare prompt with type info and all its instances
    user_prompt = json.dumps({
        "name": component_type.get("name", "Component"),
        "description": component_type.get("description", ""),
        "supported_props": component_type.get("supported_props", []),
        "instances": instances
    }, indent=2)
    llm_code = call_agent(
        llm=llm,
        prompt_template=build_prompt(escape_curly_braces(react_component_generation_system_prompt)),
        input_text=user_prompt,
        tools=[],
        memory=None,
        verbose=False
    )
    return llm_code

def write_component_to_file(component_type, code, folder_path):
    name = component_type.get("name", "Component")
    snake_name = to_snake_case(name)
    filename = os.path.join(folder_path, f"{snake_name}.jsx")
    os.makedirs(folder_path, exist_ok=True)
    with open(filename, "w", encoding="utf-8") as f:
        f.write(code)

def generate_and_write_all_components(types_path, instances_path, output_folder, llm):
    component_types = load_json_list(types_path)
    component_instances = load_json_list(instances_path)
    instances_by_type = gather_instances_by_type(component_instances)

    for component_type in component_types:
        type_id = component_type.get("id")
        instances = instances_by_type.get(type_id, [])
        print(f"Generating code for component type: {component_type.get('name', type_id)} with {len(instances)} instances")
        raw_llm_output = generate_component_code_llm(component_type, instances, llm)
        code = extract_code_block(raw_llm_output)
        if code:
            write_component_to_file(component_type, code, output_folder)
        else:
            print(f"Warning: No code block found for {component_type.get('name', type_id)}. LLM output:\n{raw_llm_output}")

# Example usage:
# generate_and_write_all_components(
#     types_path="types_jsons/component_types.json",
#     instances_path="instances_json/component_instances.json",
#     output_folder="generated_components",
#     llm=my_llm_instance
# )