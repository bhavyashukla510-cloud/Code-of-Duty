import io
import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from backend.services.rewriter import rewrite_resume
from backend.services.scorer import get_scores
from backend.services.parser import extract_text_from_pdf
from backend.services.pdf_generator import generate_pdf
from backend.services.compatability import check_compatibility
from backend.utils.keyword_extractor import extract_keywords

router = APIRouter()


@router.post("/tailor")
async def tailor_resume(
    file: UploadFile = File(...),
    job_description: str = Form("No job description provided")
):
    """
    Main tailoring endpoint.
    Returns JSON with tailored text, scores, and keywords.
    Use /generate-pdf to download the PDF separately.
    """
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

    # 🔍 Extract matched/missing keywords for frontend display
    jd_keywords = extract_keywords(job_description)
    tailored_lower = tailored_text.lower()
    matched_keywords = [kw for kw in jd_keywords if kw.lower() in tailored_lower]
    missing_keywords = [kw for kw in jd_keywords if kw.lower() not in tailored_lower]

    # 📋 Generate analysis report
    # Check for missing resume sections
    expected_sections = ["summary", "skills", "experience", "projects", "education"]
    tailored_lower_full = tailored_text.lower()
    present_sections = [s for s in expected_sections if s in tailored_lower_full]
    missing_sections = [s for s in expected_sections if s not in tailored_lower_full]

    # Keyword match percentage
    total_jd_kw = len(jd_keywords)
    matched_count = len(matched_keywords)
    match_percentage = round((matched_count / total_jd_kw * 100), 1) if total_jd_kw > 0 else 0

    # Build report
    report = {
        "keyword_match_rate": f"{match_percentage}%",
        "total_jd_keywords": total_jd_kw,
        "matched_count": matched_count,
        "missing_count": len(missing_keywords),
        "present_sections": present_sections,
        "missing_sections": missing_sections,
        "suggestions": [],
    }

    if missing_sections:
        report["suggestions"].append(f"Add missing sections: {', '.join(s.title() for s in missing_sections)}")
    if missing_keywords:
        report["suggestions"].append(f"Consider learning these technical skills required by the JD but missing from your resume: {', '.join(missing_keywords[:10])}")
    if match_percentage < 50:
        report["suggestions"].append("Keyword match is below 50%. The resume may need more relevant experience for this role.")
    if match_percentage >= 70:
        report["suggestions"].append("Strong keyword match! This resume is well-aligned with the job description.")

    # 🔍 DEBUG
    print("\n====== DEBUG ======")
    print("BEFORE SCORE:", scores["before_score"])
    print("AFTER SCORE:", scores["after_score"])
    print("MATCH RATE:", match_percentage, "%")
    print("MISSING KEYWORDS:", missing_keywords[:10])
    print("REWRITTEN:", tailored_text[:300])
    print("===================")

    # 🚀 Return JSON with all data + report
    return {
        "tailored_text": tailored_text,
        "original_text": resume_text,

        # Scores
        "before_score": scores["before_score"],
        "after_score": scores["after_score"],
        "improvement": scores.get("improvement", 0),

        # Sub-scores
        "before_ats": scores.get("before_ats", 0),
        "after_ats": scores.get("after_ats", 0),
        "before_llm": scores.get("before_llm", 0),
        "after_llm": scores.get("after_llm", 0),

        # Keywords
        "matched_keywords": matched_keywords[:30],
        "missing_keywords": missing_keywords[:20],

        # Analysis Report
        "report": report,
    }


class PDFRequest(BaseModel):
    tailored_text: str
    job_description: str = ""


@router.post("/generate-pdf")
async def generate_pdf_endpoint(data: PDFRequest):
    """
    Generate and download the tailored resume as a PDF.
    Called after /tailor returns the text.
    """
    if not data.tailored_text or len(data.tailored_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="No tailored text provided")

    pdf_bytes = generate_pdf(data.tailored_text, data.job_description)

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=optimized_resume.pdf",
        }
    )