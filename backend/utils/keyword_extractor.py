import re

def extract_keywords(text):
    # extract words (length >= 4)
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())

    # remove common words
    stopwords = {
        "this","that","with","have","from","your","their",
        "about","which","will","would","there","these",
        "those","been","being","into","over","under",
        "using","used","also","other"
    }

    keywords = [w for w in words if w not in stopwords]

    return list(set(keywords))