def rewrite_resume(resume_text: str, jd_text: str) -> str:
    try:
        
        rewritten = resume_text + " Optimized for job requirements."

        if not rewritten.strip():
            raise ValueError("Empty AI response")

        return rewritten

    except Exception as e:
        return f"Error: {str(e)}"