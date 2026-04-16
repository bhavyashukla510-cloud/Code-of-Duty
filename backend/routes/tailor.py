from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
import io

from backend.services.rewriter import rewrite_resume
from backend.services.scorer import get_scores
from backend.services.parser import extract_text_from_pdf
from backend.services.pdf_generator import generate_pdf

router = APIRouter()

@router.post("/tailor")
async def tailor_resume(
    file: UploadFile = File(...),
    job_description: str = "No job description provided"
):
    # ✅ Validate PDF
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    content = await file.read()

    resume_text = extract_text_from_pdf(content)

    if not resume_text:
        raise HTTPException(status_code=400, detail="Text extraction failed")

    tailored_text = rewrite_resume(resume_text, job_description)

    scores = get_scores(resume_text, tailored_text, job_description)

    pdf_bytes = generate_pdf(tailored_text)

    headers = {
        "X-Before-Score": str(scores["before_score"]),
        "X-After-Score": str(scores["after_score"]),
        "X-Improvement": scores["improvement"]
    }

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers=headers
    )
