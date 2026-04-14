from backend.utils.text_cleaner import clean_text
from backend.utils.keyword_extractor import extract_keywords

def compute_score(resume_text: str, jd_text: str) -> float:
    resume_clean = clean_text(resume_text)
    jd_clean = clean_text(jd_text)

    keywords = extract_keywords(jd_clean)

    if not keywords:
        return 0.0

    matched = sum(1 for word in keywords if word in resume_clean)

    score = (matched / len(keywords)) * 100
    return round(score, 2)


def get_scores(original_resume: str, rewritten_resume: str, jd_text: str):
    before_score = compute_score(original_resume, jd_text)
    after_score = compute_score(rewritten_resume, jd_text)

    improvement = after_score - before_score

    if after_score < before_score:
        after_score = before_score
        improvement = 0

    return {
        "before_score": before_score,
        "after_score": after_score,
        "improvement": f"+{round(improvement, 2)}%"
    }