from backend.utils.keyword_extractor import extract_keywords

def validate(original_text: str, ai_output: str, jd_keywords: list) -> dict:
    
    original_text = original_text.lower()
    ai_output = ai_output.lower()

    # Extract keywords
    original_keywords = set(extract_keywords(original_text))
    output_keywords = set(extract_keywords(ai_output))

    flagged = []

    for word in output_keywords:
        # Word added by AI
        if word not in original_keywords:
            # Only flag if it's important (present in JD)
            if word in jd_keywords:
                flagged.append(word)

    return {
        "passed": len(flagged) == 0,
        "flagged_additions": flagged
    }