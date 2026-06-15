import os
import json
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env
load_dotenv()

# Read API key from .env
api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError(
        "GROQ_API_KEY not found. Please add it to your .env file."
    )

# Initialize Groq client
client = Groq(api_key=api_key)


def evaluate_candidate(question: str, candidate_answer: str):

    # Handle empty response
    if not candidate_answer or candidate_answer.strip() == "":
        return {
            "score": 0,
            "strengths": [],
            "weaknesses": ["No answer provided"],
            "feedback": "Candidate did not provide an answer.",
            "improvement_suggestions": [
                "Provide an answer related to the question."
            ]
        }

    # Handle very short response
    if len(candidate_answer.strip().split()) < 3:
        return {
            "score": 2,
            "strengths": [],
            "weaknesses": ["Answer is too short"],
            "feedback": "The answer is too brief for proper evaluation.",
            "improvement_suggestions": [
                "Explain your answer with more details and examples."
            ]
        }

    prompt = f"""
You are an expert technical interviewer.

Question:
{question}

Candidate Answer:
{candidate_answer}

Evaluate the answer.

Return ONLY valid JSON in the following format:

{{
    "score": 0,
    "strengths": [
        "strength1",
        "strength2"
    ],
    "weaknesses": [
        "weakness1",
        "weakness2"
    ],
    "feedback": "feedback text",
    "improvement_suggestions": [
        "suggestion1",
        "suggestion2"
    ]
}}

Return ONLY JSON.
Do not include markdown.
Do not include explanation.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an interview evaluator that always returns valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=500,
        )

        result = response.choices[0].message.content.strip()

        try:
            return json.loads(result)

        except json.JSONDecodeError:
            return {
                "score": 0,
                "strengths": [],
                "weaknesses": ["Could not parse model output"],
                "feedback": result,
                "improvement_suggestions": []
            }

    except Exception as e:
        return {
            "score": 0,
            "strengths": [],
            "weaknesses": ["API Error"],
            "feedback": str(e),
            "improvement_suggestions": []
        }