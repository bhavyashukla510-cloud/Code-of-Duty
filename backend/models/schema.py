from pydantic import BaseModel

class UploadResponse(BaseModel):
    message: str
    resume_text: str
    filename: str

class TailorRequest(BaseModel):
    resume_text: str
    job_description: str

class TailorResponse(BaseModel):
    original_text: str
    tailored_text: str
    before_score: float
    after_score: float
    message: str

class ScoreResponse(BaseModel):
    before_score: float
    after_score: float
    improvement: str