def check_compatibility(resume_text: str, jd_text: str):
    """
    Check if the resume and job description are from compatible domains.
    Uses bidirectional domain detection — only flags if the resume's domain
    is clearly unrelated to the JD's domain (e.g., a chef applying for a software role).
    """
    resume = resume_text.lower()
    jd = jd_text.lower()

    # Define domain signatures — (domain_keywords_in_resume, domain_keywords_in_jd)
    # Only flag if resume is CLEARLY from a different domain
    domain_signatures = {
        "culinary": ["chef", "cooking", "kitchen", "restaurant", "sous chef", "pastry"],
        "medical": ["surgeon", "clinical", "patient care", "nursing", "diagnosis", "medical license"],
        "legal": ["attorney", "litigation", "paralegal", "law firm", "bar exam", "legal counsel"],
        "construction": ["plumbing", "carpentry", "masonry", "electrician", "hvac", "roofing"],
    }

    tech_keywords = ["software", "developer", "programming", "python", "java", "javascript",
                     "react", "node", "database", "api", "cloud", "devops", "frontend",
                     "backend", "machine learning", "data science", "engineer"]

    # Detect if JD is tech-related
    jd_is_tech = sum(1 for kw in tech_keywords if kw in jd) >= 3

    if jd_is_tech:
        # Check if resume is from a clearly non-tech domain
        for domain, keywords in domain_signatures.items():
            resume_domain_score = sum(1 for kw in keywords if kw in resume)
            resume_tech_score = sum(1 for kw in tech_keywords if kw in resume)

            # Only flag if resume is strongly non-tech AND has no tech skills
            if resume_domain_score >= 3 and resume_tech_score == 0:
                return {
                    "compatible": False,
                    "message": f"Resume appears to be from {domain} domain, but job requires tech skills. Consider uploading a relevant resume."
                }

    return {
        "compatible": True,
        "message": "Compatible"
    }