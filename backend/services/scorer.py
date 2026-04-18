import re
from ai_engine.llm_judge import llm_judge_score# 🔹 Extract meaningful keywords
def extract_keywords(text):
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
    return list(set(words))


# 🔹 1. Keyword Match Score (40%)
def keyword_match_score(resume, jd):
    jd_keywords = extract_keywords(jd)
    resume_text = resume.lower()

    matched = sum(1 for word in jd_keywords if word in resume_text)

    if not jd_keywords:
        return 0

    return (matched / len(jd_keywords)) * 40


# 🔹 2. Keyword Frequency Score (20%)
def keyword_frequency_score(resume, jd):
    jd_keywords = extract_keywords(jd)
    resume_text = resume.lower()

    score = 0
    for word in jd_keywords:
        count = resume_text.count(word)
        if count > 1:
            score += 1

    if not jd_keywords:
        return 0

    return (score / len(jd_keywords)) * 20


# 🔹 3. Resume Structure Score (20%)
def structure_score(resume):
    sections = ["education", "skills", "projects", "experience"]

    resume_lower = resume.lower()
    found = sum(1 for sec in sections if sec in resume_lower)

    return (found / len(sections)) * 20


# 🔹 4. Action Verbs Score (20%)
def action_verbs_score(resume):
    verbs = [
        "developed", "built", "designed", "implemented",
        "optimized", "led", "created", "improved"
    ]

    resume_lower = resume.lower()
    found = sum(1 for verb in verbs if verb in resume_lower)

    return min((found / len(verbs)) * 20, 20)


# 🔹 FINAL SCORE
def calculate_ats_score(resume, jd):
    score = (
        keyword_match_score(resume, jd) +
        keyword_frequency_score(resume, jd) +
        structure_score(resume) +
        action_verbs_score(resume)
    )

    return round(score, 2)


def get_scores(original_resume, rewritten_resume, jd_text):
    # 🔹 ATS Scores
    before_ats = calculate_ats_score(original_resume, jd_text)
    after_ats = calculate_ats_score(rewritten_resume, jd_text)

    # 🔹 LLM Judge Scores
    before_llm = llm_judge_score(original_resume, jd_text)
    after_llm = llm_judge_score(rewritten_resume, jd_text)

    # 🔹 Final Combined Score (Hybrid)
    before_final = round((before_ats * 0.6) + (before_llm * 0.4), 2)
    after_final = round((after_ats * 0.6) + (after_llm * 0.4), 2)

    improvement = round(after_final - before_final, 2)

    return {
        "before_score": before_final,
        "after_score": after_final,
        "improvement": f"{'+' if improvement >= 0 else ''}{improvement}%",

        # optional (for debugging / demo)
        "before_ats": before_ats,
        "after_ats": after_ats,
        "before_llm": before_llm,
        "after_llm": after_llm
    }