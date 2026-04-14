def extract_keywords(jd_text: str) -> list:
    words = jd_text.split()
    
    # simple filtering (can upgrade later)
    keywords = [word for word in words if len(word) > 3]
    
    return list(set(keywords))  # unique keywords