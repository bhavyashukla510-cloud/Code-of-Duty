def check_compatibility(resume_text: str, jd_text: str):
    resume = resume_text.lower()
    jd = jd_text.lower()

    mismatch_pairs = [
        ("data", "java"),
        ("analyst", "developer"),
        ("python", "java"),
        ("sql", "spring")
    ]

    mismatch_score = 0

    for r, j in mismatch_pairs:
        if r in resume and j in jd:
            mismatch_score += 1

    if mismatch_score >= 2:
        return {
            "compatible": False,
            "message": "Resume and Job Description are from different domains"
        }

    return {
        "compatible": True,
        "message": "Compatible"
    }