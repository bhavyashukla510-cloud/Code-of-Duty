from fastapi import APIRouter, UploadFile, File, HTTPException
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.parser import extract_text_from_pdf

router = APIRouter()

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400, 
            detail="Only PDF files are allowed"
        )
    
    content = await file.read()
    resume_text = extract_text_from_pdf(content)
    
    if not resume_text:
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from PDF"
        )
    
    return {
        "message": "PDF uploaded successfully",
        "resume_text": resume_text,
        "filename": file.filename
    }