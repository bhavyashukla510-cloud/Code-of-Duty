from ai_engine.pipeline import rewrite_pipeline

def rewrite_resume(resume_text: str, jd_text: str) -> str:
    try:
        result = rewrite_pipeline(resume_text, jd_text)

        if not result or not result.strip():
            raise ValueError("Empty AI response")

        return result

    except Exception as e:
        return f"Error: {str(e)}"