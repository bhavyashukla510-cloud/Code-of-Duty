# ai_engine/keyword_matcher.py

from backend.utils.keyword_extractor import extract_keywords

NORMALIZATION = {
    "restful api": "rest api",
    "rest apis": "rest api",
    "nodejs": "node.js",
    "js": "javascript",
    "py": "python",
    "ml": "machine learning"
}

def normalize(text):
    text = text.lower()
    for k, v in NORMALIZATION.items():
        text = text.replace(k, v)
    return text


def match_keywords(resume_text: str, jd_keywords: list[str]) -> dict:
    resume_text = normalize(resume_text)

    matched = []
    missing = []

    for kw in jd_keywords:
        kw_norm = normalize(kw)

        if kw_norm in resume_text:
            matched.append(kw)
        else:
            missing.append(kw)

    total = len(jd_keywords)
    percent = (len(matched) / total * 100) if total > 0 else 0

    return {
        "matched": matched,
        "missing": missing,
        "match_percent": round(percent, 2)
    }
