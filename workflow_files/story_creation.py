import uuid
import json
from langchain_core.messages import AIMessage, HumanMessage
from langchain.memory import ConversationBufferMemory
from utils.llm_utils import *
from utils.vectorstores_utils import manager
from llm_tools.stories_to_box_tools import make_rag_tool, ask_user_tool
from prompts.story_creation_prompts import theme_generator_instructions, question_agent_instructions, epic_generator_instructions, user_story_generator_instructions
from langchain.tools import Tool



def interactive_theme_generation(llm, app_query, theme_file, manager):
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True
     )
    story_retriever = manager.get_retriever("rag_info", search_type="mmr", search_kwargs={"k": 5})
    tools = []
    asked_questions = set()

    while True:
        theme_prompt_template = build_prompt(escape_curly_braces(theme_generator_instructions))
        theme_response = call_agent(llm, theme_prompt_template, app_query, tools, memory)
        themes_data = extract_json_from_llm(theme_response)
        if not themes_data:
            print("Failed to extract JSON from theme_response.")
            themes_data = {}

        all_themes = []
        for theme in themes_data.get("theme", []):
            theme_id = str(uuid.uuid4())
            theme["id"] = theme_id
            all_themes.append(theme)
        print("\nGenerated themes:")
        for idx, theme in enumerate(all_themes, 1):
            print(f"{idx}. {theme.get('name', '')}: {theme.get('description', '')}")

        # Write themes to file after every iteration
        with open(theme_file, "w") as f:
            json.dump(all_themes, f, indent=2)

        ask_user_tool_lc = Tool(
            name="ask_user_tool",
            func=ask_user_tool,
            description="Ask the user a set of questions and return their answers as a JSON object."
        )
        # Pass previously asked questions to the question agent
        question_tools = [make_rag_tool(story_retriever), ask_user_tool_lc]
        question_prompt_template = build_prompt(escape_curly_braces(question_agent_instructions))
        question_agent_input = json.dumps({
            "themes": all_themes,
            "asked_questions": list(asked_questions)
        })
        question_response = call_agent(llm, question_prompt_template, question_agent_input, question_tools, memory)

        # If LLM returns "no", stop loop
        if question_response.strip().lower() == "no":
            print("Theme question agent is done. Stopping loop.")
            break

        # Parse the JSON output for questions and analysis
        try:
            response_json = extract_json_from_llm(question_response)
            response_json = json.loads(response_json)
            questions_list = response_json.get("questions", [])
        except Exception:
            print("Failed to parse questions from LLM, skipping.")
            break

        # If output JSON is empty, break the loop
        if not questions_list:
            print("No questions or analysis returned. Stopping loop.")
            break

        # Add questions to asked_questions set
        for q in questions_list:
            question_text = q.get("question")
            if question_text:
                asked_questions.add(question_text)

        # Add analysis to chat history (analysis is part of the question agent's output)
        analysis_entries = []
        for q in questions_list:
            analysis = q.get("analysis")
            question_text = q.get("question")
            if analysis and question_text:
                analysis_entry = f"Analysis for '{question_text}': {analysis}"
                analysis_entries.append(analysis_entry)
        if analysis_entries:
            analysis_text = "\n".join(analysis_entries)
            print("\nAnalysis of user answers:")
            print(analysis_text)
            memory.append(AIMessage(content=json.dumps(themes_data)))
            memory.append(AIMessage(content=analysis_text))

        print("\nRegenerating themes with updated information...\n")
    return all_themes


def interactive_epic_generation(llm, themes, epic_file, manager):
    epics = []
    for theme in themes:
        print(f"\nGenerating epics for theme: {theme['name']}")
        # Prepare prompt for epic generation
        epic_prompt_template = build_prompt("Generate epics for the following theme. Ask any clarifying questions before generating epics.")
        theme_context = json.dumps(theme)
        tools = []

        # Wrap your ask_user_tool as a LangChain Tool
        ask_user_tool_lc = Tool(
            name="ask_user_tool",
            func=ask_user_tool,
            description="Ask the user a set of questions and return their answers as a JSON object."
        )
        tools = [ask_user_tool_lc]

        # The agent can now ask questions and use responses immediately
        memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
        epic_response = call_agent(llm, epic_prompt_template, theme_context, tools, memory)
        epic_data = extract_json_from_llm(epic_response)
        if epic_data:
            epics.append(epic_data)
        else:
            print("Failed to extract epics for theme:", theme['name'])

    # Save epics to file
    with open(epic_file, "w", encoding="utf-8") as f:
        json.dump(epics, f, indent=2)
    print(f"Epics saved to {epic_file}")



def interactive_epic_generation(llm, themes, epic_file, manager):
    epics = []
    for theme in themes:
        print(f"\nGenerating epics for theme: {theme['name']}")
        epic_prompt_template = build_prompt(escape_curly_braces(epic_generator_instructions))
        theme_context = json.dumps(theme)
        ask_user_tool_lc = Tool(
            name="ask_user_tool",
            func=ask_user_tool,
            description="Ask the user a set of questions and return their answers as a JSON object."
        )
        tools = [ask_user_tool_lc]
        memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
        epic_response = call_agent(llm, epic_prompt_template, theme_context, tools, memory)
        epic_data = extract_json_from_llm(epic_response)

        # Ensure epic_data is a list of epics
        # Ensure epic_data is a list of epics
        if isinstance(epic_data, dict) and "epics" in epic_data:
            epic_list = epic_data["epics"]
        elif isinstance(epic_data, list):
            epic_list = epic_data
        else:
            print("Failed to extract epics for theme:", theme['name'])
            continue

        # Add unique id and theme_id to each epic
        for epic in epic_list:
            if "name" in epic and "description" in epic:
                epic['id'] = str(uuid.uuid4())
                epic['theme_id'] = theme['id']
                epics.append(epic)
            else:
                print(f"Skipping incomplete epic: {epic}")

    # Save epics to file
    with open(epic_file, "w", encoding="utf-8") as f:
        json.dump(epics, f, indent=2)
    print(f"Epics saved to {epic_file}")


def generate_user_stories(llm, epics, user_stories_file):
    user_stories = []
    for epic in epics:
        print(f"\nGenerating user stories for epic: {epic['name']}")
        # Build a prompt for user story generation
        user_story_prompt = f"""
            EPIC:
            Name: {epic['name']}
            Description: {epic['description']}
        """

        # Call the LLM to generate user stories
        user_story_response = call_agent(
            llm,
            build_prompt(escape_curly_braces(user_story_generator_instructions)),
            input_text=user_story_prompt,
            tools=[],  # No tools
            memory=None,
            verbose=True
        )
        stories_json = extract_json_from_llm(user_story_response)
        if isinstance(stories_json, dict):
            stories_list = stories_json["stories"]
        elif isinstance(stories_json, list):
            stories_list = stories_json
        else:
            print("Failed to extract stories for epic:", epic['name'])
            continue

        for story in stories_list:
            if "name" in story and "description" in story:
                story['id'] = str(uuid.uuid4())
                story['epic_id'] = epic['id']
                story['theme_id'] = epic['theme_id']
                user_stories.append(story)
            else:
                print(f"Skipping incomplete story: {story}")

    # Save user stories to file
    with open(user_stories_file, "w", encoding="utf-8") as f:
        json.dump(user_stories, f, indent=2)
    print(f"User stories saved to {user_stories_file}")