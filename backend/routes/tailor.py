import io
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse

from backend.services.rewriter import rewrite_resume
from backend.services.scorer import get_scores
from backend.services.parser import extract_text_from_pdf
from backend.services.pdf_generator import generate_pdf
from backend.services.compatability import check_compatibility

router = APIRouter()

@router.post("/tailor")
async def tailor_resume(
    file: UploadFile = File(...),
    job_description: str = "No job description provided"
):
    # ✅ Validate file
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    content = await file.read()

    # 📄 Extract text from PDF
    resume_text = extract_text_from_pdf(content)

    if not resume_text:
        raise HTTPException(status_code=400, detail="Text extraction failed")

    # 🧠 Check domain compatibility
    check = check_compatibility(resume_text, job_description)

    if not check["compatible"]:
        raise HTTPException(status_code=400, detail=check["message"])

    # 🔥 AI Rewrite (optimized resume)
    tailored_text = rewrite_resume(resume_text, job_description)

    # 🚨 Safety check (avoid blank/broken output)
    if "ERROR" in tailored_text or len(tailored_text.strip()) < 50:
        raise HTTPException(status_code=500, detail="AI failed to generate resume")

    # 📊 Scoring (ATS + LLM Judge)
    scores = get_scores(resume_text, tailored_text, job_description)

    # 🔍 DEBUG (optional, keep for testing)
    print("\n====== DEBUG ======")
    print("BEFORE SCORE:", scores["before_score"])
    print("AFTER SCORE:", scores["after_score"])
    print("REWRITTEN:", tailored_text[:300])
    print("===================")

    # 📄 Generate PDF from optimized resume
    pdf_bytes = generate_pdf(tailored_text)

    # 🚀 Return downloadable PDF ONLY
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
    "Content-Disposition": "attachment; filename=optimized_resume.pdf",

    # ✅ Combined score
    "X-Before-Score": str(scores["before_score"]),
    "X-After-Score": str(scores["after_score"]),
    "X-Improvement": scores["improvement"],

    # ✅ ATS score
    "X-Before-ATS": str(scores.get("before_ats", 0)),
    "X-After-ATS": str(scores.get("after_ats", 0)),

    # ✅ LLM Judge score
    "X-Before-LLM": str(scores.get("before_llm", 0)),
    "X-After-LLM": str(scores.get("after_llm", 0))
}
    )