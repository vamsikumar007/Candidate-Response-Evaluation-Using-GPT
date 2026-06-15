from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from evaluator import evaluate_candidate

# Create FastAPI app
app = FastAPI(title="Candidate Response Evaluation API")

# Enable CORS (Allows frontend to communicate with backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request Model
class CandidateRequest(BaseModel):
    question: str
    candidate_answer: str


# Home Endpoint
@app.get("/")
def home():
    return {
        "message": "Candidate Response Evaluation API is Running"
    }


# Candidate Evaluation Endpoint
@app.post("/evaluate")
def evaluate(data: CandidateRequest):
    try:
        result = evaluate_candidate(
            question=data.question,
            candidate_answer=data.candidate_answer
        )

        return result

    except Exception as e:
        return {
            "score": 0,
            "strengths": [],
            "weaknesses": ["Internal Server Error"],
            "feedback": str(e),
            "improvement_suggestions": []
        }