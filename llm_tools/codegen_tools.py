import os
import json
from utils.llm_utils import extract_code_block, extract_json, extract_json_from_llm
from pydantic import BaseModel, Field
from langchain.tools import StructuredTool
import re


# --- Write Screen Code Tool ---
def write_screen_code_to_file(screen_name, code, output_folder):
    try:
        os.makedirs(output_folder, exist_ok=True)
        filename = os.path.join(output_folder, f"{screen_name}.jsx")
        print(f"[DEBUG] Writing React code for screen '{screen_name}' to {filename}.")
        print(f"[DEBUG] Code content:\n{code}")
        with open(filename, "w", encoding="utf-8") as f:
            f.write(code)
        result = f"Success: Wrote screen code to {filename}"
        print(f"[RETURN] write_screen_code_to_file: {result}")
        return result
    except Exception as e:
        print(f"[ERROR] Failed to write screen code: {e}")
        return f"Error writing screen code: {e}"

class WriteScreenCodeToFileInput(BaseModel):
    screen_name: str = Field(..., description="Name of the screen (used for filename).")
    code: str = Field(..., description="React code to write to file.")
    output_folder: str = Field(..., description="Folder to write the generated screen code.")

write_screen_code_to_file_tool = StructuredTool.from_function(
    func=lambda screen_name, code, output_folder: write_screen_code_to_file(screen_name, code, output_folder),
    name="write_screen_code_to_file_tool",
    description="Writes the provided React code to a file named after the screen in the specified output folder. Usage: screen_name (str) - name of the screen (do NOT include any file extension, e.g., do not add .jsx, MUST be in PascalCase); code (str) - React code to write; output_folder (str) - folder to write the generated screen code.",
    args_schema=WriteScreenCodeToFileInput
)

# --- Load Text File Tool ---
def load_text_file(file_path):
    try:
        print(f"[DEBUG] Loading text file: {file_path}")
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        print(f"[DEBUG] Loaded content (first 500 chars):\n{content[:500]}")
        print(f"[RETURN] load_text_file: (first 500 chars)\n{content[:500]}")
        return content
    except Exception as e:
        print(f"[ERROR] Failed to load file: {e}")
        return f"Error loading file: {e}"

class LoadTextFileInput(BaseModel):
    file_path: str = Field(..., description="Path to the file to read as text.")

load_text_file_structured_tool = StructuredTool.from_function(
    func=lambda file_path: load_text_file(file_path),
    name="load_text_file_tool",
    description="Loads and returns the contents of any file as plain text. Usage: file_path (str) - path to the file to read as text.",
    args_schema=LoadTextFileInput
)

# --- Write Layout To File Tool ---
def write_layout_to_file(screen_name, layout_data, output_folder):
    print(f"[DEBUG] Raw layout_data input for '{screen_name}':\n{layout_data}")
    layout_data_parsed = extract_json(layout_data)
    print(f"[DEBUG] Parsed layout_data for '{screen_name}':\n{layout_data_parsed}")
    try:
        os.makedirs(output_folder, exist_ok=True)
        layout_path = os.path.join(output_folder, f"{screen_name}_layout.json")
        print(f"[DEBUG] Writing layout JSON to {layout_path}")
        with open(layout_path, "w", encoding="utf-8") as f:
            json.dump(layout_data_parsed, f, indent=2)
        result = f"Success: Wrote layout to {layout_path}"
        print(f"[RETURN] write_layout_to_file: {result}")
        return result
    except Exception as e:
        print(f"[ERROR] Failed to write layout: {e}")
        return f"Error writing layout: {e}"

class WriteLayoutToFileInput(BaseModel):
    screen_name: str = Field(..., description="Name of the screen (used for filename).")
    layout_data: str = Field(..., description="Layout data to write to file (should be a JSON-serializable dict).")
    output_folder: str = Field(..., description="Folder to write the layout JSON.")

write_layout_to_file_structured_tool = StructuredTool.from_function(
    func=lambda screen_name, layout_data, output_folder: write_layout_to_file(screen_name, layout_data, output_folder),
    name="write_layout_to_file_tool",
    description="Writes the provided layout data to a file named after the screen in the specified output folder. Usage: screen_name (str) - name of the screen; layout_data (str) - layout data to write; output_folder (str) - folder to write the layout JSON.",
    args_schema=WriteLayoutToFileInput
)

# --- Get File List Tool ---
def get_file_list_tool(directory):
    try:
        result = os.listdir(directory)
        print(f"[RETURN] get_file_list_tool: {result}")
        return result
    except Exception as e:
        return f"Error: {e}"

class GetFileListInput(BaseModel):
    directory: str = Field(..., description="Directory to list files from.")

get_file_list_structured_tool = StructuredTool.from_function(
    func=lambda directory: get_file_list_tool(directory),
    name="get_file_list_tool",
    description="Returns a list of file names in the specified directory. Usage: directory (str) - the directory path to list files from.",
    args_schema=GetFileListInput
)
