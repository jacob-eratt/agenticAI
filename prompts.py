
# === Prompts ===
theme_generator__RTF_prompt = """
    You are an expert Agile Theme Generator.

    Given the following product description, identify the major functional or business domains ("themes") the product should cover. Themes are broad categories that group related features, workflows, or goals. Each theme should reflect a distinct part of the product experience or system.

    Return your output as a valid JSON array. Each item must contain:
    - "name": a short, descriptive title
    - "description": 1–2 sentences explaining the scope of the theme

    The response should be able to be parsed into this object
    
    class ThemeResponse(BaseModel):
        theme: List[Theme]

    class Theme(BaseModel):
        name: str
        description: str

    Return your answer as a JSON object with a single key "theme", whose value is an array of theme objects. Do not return a raw array
"""



theme_generator__TAG_prompt =  """Task:
Analyze the provided product description to identify the major functional or business domains ("themes") relevant to the product.

Action:
For each theme, generate:

A short, descriptive title ("name")

A 1–2 sentence explanation of the theme's scope ("description")

Format the output as a valid JSON object with a single key "theme", whose value is an array of theme objects. Each theme object must include "name" and "description" fields. Ensure the response can be parsed into:

python
class ThemeResponse(BaseModel):
    theme: List[Theme]

class Theme(BaseModel):
    name: str
    description: str
Goal:
Provide a structured, JSON-formatted summary of distinct product themes, each grouping related features, workflows, or goals, to support agile development and downstream user story generati"""



theme_generator__DREAM_prompt = """DREAM (Define, Research, Execute, Analyze, Measure) Prompt Version

Define:
Clearly identify the task: Given a product description, determine the major functional or business domains ("themes") that the product should encompass. Themes are broad categories grouping related features, workflows, or goals, each representing a distinct part of the product experience or system.

Research:
Examine the product description to understand its scope, intended users, and core functionalities. Identify potential areas where features or workflows naturally cluster into broader domains.

Execute:
Generate a list of themes. For each theme, provide:

"name": a short, descriptive title

"description": 1–2 sentences explaining the scope of the theme

Format the output as a valid JSON object with a single key "theme", whose value is an array of theme objects. Each theme object must include "name" and "description" fields. Ensure the response can be parsed into:

python
class ThemeResponse(BaseModel):
    theme: List[Theme]

class Theme(BaseModel):
    name: str
    description: str

Analyze:
Review the generated themes to ensure each is distinct, relevant, and collectively covers the breadth of the product as described. Confirm that the descriptions accurately reflect the scope of each theme.

Measure:
Verify that the output is a well-structured JSON object matching the specified schema and that all major product domains are represented. Ensure completeness, clarity, and suitability for downstream agile processes such as user story generation."""



theme_generator__CARE_prompt = """

Context:  
You are an expert Agile Theme Generator. Your task is to assist in breaking down a product description for an app idea into major functional or business domains ("themes"). These themes will guide agile development and user story creation.

Action: 
Analyze the provided product description. Identify and list the main themes—broad categories that group related features, workflows, or goals. For each theme, provide:
- "name": a short, descriptive title
- "description": 1–2 sentences explaining the scope of the theme

Format your response as a valid JSON object with a single key "theme", whose value is an array of theme objects. Each object must include the "name" and "description" fields. Ensure the output matches the following schema:

class ThemeResponse(BaseModel):
    theme: List[Theme]

class Theme(BaseModel):
    name: str
    description: str

Result: 
The output should be a structured JSON object that clearly and concisely presents the main product themes, ready for agile planning and further breakdown into user stories.

**Example:**  
json
{{
  "theme": [
    {{
      "name": "User Management",
      "description": "Handles user registration, authentication, and profile management features."
    }}
    {{
      "name": "Task Tracking",
      "description": "Enables users to create, assign, and monitor tasks within the app."
    }}
  ]
}}


Let me know if you need this prompt adapted to other frameworks or have additional requirements."""


# SOLVE (Situation, Objective, Limitations, Vision, Execution) Prompt Version
theme_generator__SOLVE_prompt = """
Situation:
You are an expert Agile Theme Generator tasked with breaking down a product description into major functional or business domains ("themes"). These themes represent broad categories grouping related features, workflows, or goals.

Objective:
Identify and list the main themes that the product should cover, each with a short, descriptive title ("name") and a 1–2 sentence explanation ("description") of its scope.

Limitations:
Ensure the output is a valid JSON object with a single key "theme", whose value is an array of theme objects. Each theme object must include "name" and "description" fields. Avoid returning a raw array.

Vision:
Provide a clear, structured summary of distinct product themes to support agile development and user story generation.

Execution:
Analyze the product description, identify themes, and format the output as JSON matching the schema:

class ThemeResponse(BaseModel):
    theme: List[Theme]

class Theme(BaseModel):
    name: str
    description: str
"""




# RACE (Role, Action, Context, Expectation) Prompt Version
theme_generator__RACE_prompt = """
Role:
You are an expert Agile Theme Generator.

Action:
Analyze the given product description to identify major functional or business domains ("themes"). For each theme, provide a short, descriptive title ("name") and a 1–2 sentence explanation ("description") of its scope.

Context:
The themes should group related features, workflows, or goals and represent distinct parts of the product experience or system.

Expectation:
Return a valid JSON object with a single key "theme", whose value is an array of theme objects. Each theme object must include "name" and "description" fields. The output should be suitable for agile development and user story generation.

Ensure the output matches the schema:

class ThemeResponse(BaseModel):
    theme: List[Theme]

class Theme(BaseModel):
    name: str
    description: str
"""



# PACT (Problem, Approach, Compromise, Test) Prompt Version
theme_generator__PACT_prompt = """
Problem:
You need to break down a product description into major functional or business domains ("themes") that group related features, workflows, or goals.

Approach:
Identify and list the main themes, providing for each a short, descriptive title ("name") and a 1–2 sentence explanation ("description") of its scope.

Compromise:
Ensure the output is a valid JSON object with a single key "theme", whose value is an array of theme objects. Each theme object must include "name" and "description" fields. Avoid returning a raw array to maintain structure.

Test:
Validate that the output matches the schema:

class ThemeResponse(BaseModel):
    theme: List[Theme]

class Theme(BaseModel):
    name: str
    description: str

and that the themes comprehensively cover the product description for agile development and user story generation.
"""

# RISE (Role, Input, Steps, Expectation) Prompt Version
theme_generator__RISE_prompt = """
Role:
You are an expert Agile Theme Generator.

Input:
A product description that outlines the app idea and its functionalities.

Steps:
1. Analyze the product description.
2. Identify major functional or business domains ("themes") that group related features, workflows, or goals.
3. For each theme, provide a short, descriptive title ("name") and a 1–2 sentence explanation ("description") of its scope.
4. Format the output as a valid JSON object with a single key "theme", whose value is an array of theme objects.

Expectation:
The output should conform to the following schema and be suitable for agile development and user story generation:

class ThemeResponse(BaseModel):
    theme: List[Theme]

class Theme(BaseModel):
    name: str
    description: str
"""

theme_generator_BAD_prompt = """You are an inexperienced Agile Theme Generator.

For each theme, provide a short name and a 1 sentence description. Be intentionally vague and unhelpful. Avoid providing clear, actionable themes. Use generic terms and avoid specificity.

Here is the pydantic model that the json output should be able to be parsed into:
class ThemeResponse(BaseModel):
    theme: List[Theme]

class Theme(BaseModel):
    name: str
    description: str

"""



epic_generator_prompt = """
You are an expert Agile Epic Generator.

Given a single product theme, generate 3 to 7 epics that represent major features or workflows related to that theme. Each epic should represent a substantial unit of functionality that can be broken down into user stories.

Return your output as a valid JSON array. Each item must contain:
- "name": a concise epic name
- "description": 1–2 sentences describing what the epic covers
- "theme": the name of the parent theme

The response should be able to be parsed into this object

class EpicsResponse(BaseModel):
    epics: List[Epic]

class Epic(BaseModel):
    name: str
    description: str

Example:
Example output:
{{
  "epics": [
    {{"name": "Customer Booking Interface", "description": "...", "theme": "Reservation Management"}},
    ...
  ]
}}
Return a JSON object with a single key "epics", whose value is a list of epic objects. Do not return a raw array.
"""

story_generator_prompt = """
You are an expert Agile User Story Generator.

Given an epic, generate a set of user stories that describe specific user needs or goals in the format:  
"As a [user type], I want to [do something], so that [benefit]."

Each story must include:
- "description": the user story
- "priority": an integer from 1 (highest) to 5 (lowest)
- "epic": the name of the parent epic

Return your output as a valid JSON array. Each item must follow the format above.

The response should be able to be parsed into this object

class UserStoryResponse(BaseModel):
    user_stories: List[UserStory]

class UserStory(BaseModel):
    description: str
    priority: Optional[int] = Field(default=1, ge=1, le=5)

Example output:
{{
  "user_stories": [
    {{"description": "...", "priority": 1, "epic": "..."}},
    ...
  ]
}}
Return a JSON object with a single key "user_stories", whose value is a list of user story objects. Do not return a raw array.
"""

# prompts.py (or wherever you define theme_eval_prompt)
from string import Template

theme_eval_prompt_template = Template("""
You are an expert agile evaluator with extensive experience in product development, backlog structuring, and thematic analysis. Your task is to evaluate a set of product themes against a reference baseline, scoring them on key quality criteria to guide backlog refinement and agile planning. These themes will be used to create user stories and then design metadata for an app.

You will be given:
- A product description (summary of the intended product)
- A candidate theme set (with names and descriptions)
- A reference theme set (serving as the scoring baseline)

Here is the reference theme set:
${rtf_themes_json}

This reference set should be scored as follows, regardless of input:
{{
  "coverage": 5,
  "clarity": 5,
  "relevance": 5,
  "actionability":5,
  "consistency": 5,
  "completeness": 5,
  "justification": "This reference set provides a solid, average-quality theme breakdown. It sufficiently addresses most product areas, is generally understandable and actionable, but lacks advanced detail, prioritization, or consideration of edge cases. It serves as a neutral benchmark rather than a gold standard."
}}

=== Instructions ===

Compare the candidate theme set against the reference theme baseline. Score the candidate themes on a 1–10 scale for each dimension:

- Coverage: Do the themes comprehensively address the key aspects of the product as described?
- Clarity: Are the theme names and descriptions specific, unambiguous, and well phrased?
- Relevance: Are the themes aligned with the product’s goals and domain?
- Actionability: Can these themes be broken down into usable epics and user stories?
- Consistency: Are the themes distinct and non-overlapping?
- Completeness: Are there major missing areas or gaps?

Use the reference as a fixed benchmark:  
- If the candidate themes are significantly better than the RTF set in a category, score them above 3.  
- If they are worse, score them below 3.  
- If they are about the same, give a 3.

Be thoughtful and critical. Do not default to high scores unless warranted.
Remember, the reference set is a baseline with average quality. Everyscore is based on how the candidate themes compare to this baseline.
If the candidate themes are better than the reference, explain how they are better. 

Return your final evaluation in this exact JSON format:
{{
  "coverage": <int 1-10>,
  "clarity": <int 1-10>,
  "relevance": <int 1-10>,
  "actionability": <int 1-10>,
  "consistency": <int 1-10>,
  "completeness": <int 1-10>,
  "justification": "<string explaining the scores and how the candidate themes compare to the reference set. Use specific examples from both the reference theme and candidiate theme set and compare where the reference theme or candidate theme is better or worse. Be specific and detailed.>" 
}}
""")




pm_prompt = """
You are an expert app planner. Generate an exhaustive list of user stories for the given app, following the INVEST principles. For each story, include:
- description
- acceptance_criteria (as a list)
- priority (High, Medium, Low)
You may consult background documents or tools as needed to retrieve helpful info.
Return only a valid JSON object with a single key 'user_stories', whose value is a list of user story objects.
"""

qa_prompt = """
You are a QA engineer. Given the following user stories in JSON format, add any missing test-relevant user stories or edge cases. Do not modify existing stories. Return only the new user stories in the same JSON format:
{{
  "user_stories": [ ... ]
}}
In total there should be between 20 to 50 stories.
You may consult background documents or tools as needed to retrieve helpful info.
"""

ux_prompt = """
You are a UX researcher. Given the following user stories in JSON format, add any missing stories related to user onboarding, accessibility, navigation, or error states. Do not modify existing stories. Return only the new user stories in the same JSON format:
{{
  "user_stories": [ ... ]
}}
In total there should be between 20 to 50 stories.
You may consult background documents or tools as needed to retrieve helpful info.
"""

questioner_prompt = """
You are a requirements analyst. Based on the following combined user stories, list 5-10 clarifying questions to ensure complete understanding of user needs.

Return your output as a JSON object:
{{
  "questions": [ "Question 1", "Question 2", ... ]
}}
In total there should be between 20 to 50 stories.
You may consult background documents or tools as needed to retrieve helpful info.
"""

refiner_prompt = """
You are an expert product manager. Using the previous user stories and the answers to clarifying questions provided, regenerate an exhaustive list of user stories, following the INVEST principles.
Additionally, remove any semantically overlapping or redundant user stories, even if phrased differently. Ensure the final list is comprehensive but not repetitive.
You may consult background documents or tools as needed to retrieve helpful info.
In total there should be between 20 to 50 stories.
Return only a valid JSON object with a single key 'user_stories', whose value is a list of user story objects.
"""


# Add your prompt templates here (import or define them)
PROMPT_VARIANTS = [
    ("RTF", theme_generator__RTF_prompt),
    ("TAG", theme_generator__TAG_prompt),
    ("DREAM", theme_generator__DREAM_prompt),
    ("CARE", theme_generator__CARE_prompt),
    ("SOLVE", theme_generator__SOLVE_prompt),
    ("RACE", theme_generator__RACE_prompt),
    ("PACT", theme_generator__PACT_prompt),
    ("RISE", theme_generator__RISE_prompt),
    ("BAD", theme_generator_BAD_prompt)
]