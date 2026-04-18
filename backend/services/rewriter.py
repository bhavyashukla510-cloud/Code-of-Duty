from ai_engine.agentic_pipeline import run_agentic_pipeline

def rewrite_resume(resume_text: str, jd_text: str) -> str:
    result = run_agentic_pipeline(resume_text, jd_text)

    # ❌ If API failed → return original resume
    if result.startswith("ERROR") or len(result) < 50:
        return resume_text

    return result