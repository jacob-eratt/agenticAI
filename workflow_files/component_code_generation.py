import json
import os
from collections import defaultdict
from utils.llm_utils import call_agent, build_prompt, escape_curly_braces, extract_code_block
from prompts.react_prompts import react_component_generation_system_prompt
from llm_tools.codegen_tools import get_file_list_structured_tool, write_screen_code_to_file_tool, load_text_file_structured_tool
import re
def load_json_list(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


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
    filename = os.path.join(folder_path, f"{name}.jsx")
    os.makedirs(folder_path, exist_ok=True)
    with open(filename, "w", encoding="utf-8") as f:
        f.write(code)

index_js_generation_prompt = """
You are a senior React developer. Your task is to generate an index.js file for a components directory. 
Given a list of component file names (in PascalCase, without the .jsx extension), output a single index.js file that re-exports each component as a named export using PascalCase.

- For each component, use: export { default as <PascalCaseName> } from './<PascalCaseName>.jsx';
- Do not include any explanation or comments, only output the code.
- Wrap the code in triple backticks.

Example input:
{
  "component_names": ["weather_card", "navbar", "footer"]
}

Example output:
```js
export { default as weather_card } from './weather_card.jsx';
export { default as navbar } from './navbar.jsx';
export { default as footer } from './footer.jsx';
```
**Summary:**  
- All file names, component names, and exports will be in PascalCase.
- This will keep everything consistent and avoid confusion for the LLM.
"""

def generate_index_js_for_components(folder_path, llm):
    # List all .jsx files in the folder
    component_files = [f for f in os.listdir(folder_path) if f.endswith('.jsx')]
    # Remove file extension for export names
    exports = [os.path.splitext(f)[0] for f in component_files]
    # Prepare prompt for LLM
    user_prompt = {
        "component_names": exports
    }
    # Call LLM to generate index.js code
    llm_code = call_agent(
        llm=llm,
        prompt_template=build_prompt(escape_curly_braces(index_js_generation_prompt)),
        input_text=json.dumps(user_prompt, indent=2),
        tools=[get_file_list_structured_tool, write_screen_code_to_file_tool, load_text_file_structured_tool],
        memory=None,
        verbose=False
    )
    code = extract_code_block(llm_code)
    # Write index.js
    index_path = os.path.join(folder_path, "index.js")
    with open(index_path, "w", encoding="utf-8") as f:
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
    
    generate_index_js_for_components(output_folder, llm)

# Example usage:
# generate_and_write_all_components(
#     types_path="types_jsons/component_types.json",
#     instances_path="instances_json/component_instances.json",
#     output_folder="generated_components",
#     llm=my_llm_instance
# )