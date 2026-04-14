from fastapi import APIRouter
from pydantic import BaseModel
from backend.services.scorer import get_scores

router = APIRouter()

class ScoreRequest(BaseModel):
    original_resume: str
    rewritten_resume: str
    jd_text: str

@router.post("/score")
def score_resume(data: ScoreRequest):
    result = get_scores(
        data.original_resume,
        data.rewritten_resume,
        data.jd_text
    )
    return result