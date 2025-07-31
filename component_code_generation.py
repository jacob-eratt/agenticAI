import json
import os
from llm_utils import call_agent, build_prompt, escape_curly_braces, extract_code_block
from prompts.react_prompts import react_component_generation_system_prompt 


def load_component_types(path):
    with open(path, "r", encoding="utf-8") as f:
        types = json.load(f)
    return {t["id"]: t for t in types if "id" in t}

def to_snake_case(name):
    import re
    name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    name = re.sub('([a-z0-9])([A-Z])', r'\1_\2', name)
    return name.replace(" ", "_").lower()

def generate_component_code_llm(component_type, llm):
    # User prompt is just the component type info
    user_prompt = json.dumps({
        "name": component_type.get("name", "Component"),
        "description": component_type.get("description", ""),
        "supported_props": component_type.get("supported_props", [])
    }, indent=2)

    print(user_prompt)
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

def generate_and_write_all_components(component_types_path, output_folder, llm):
    component_types = load_component_types(component_types_path)
    for type_id, type_info in component_types.items():
        print(f"Generating code for component type: {type_info.get('name', type_id)}")
        code = extract_code_block(generate_component_code_llm(type_info, llm))
        write_component_to_file(type_info, code, output_folder)