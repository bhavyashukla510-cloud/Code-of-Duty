import spacy
import re

nlp = spacy.load("en_core_web_sm")

STOPWORDS = set([
    "experience", "skills", "ability", "knowledge", "work", "team",
    "role", "job", "candidate", "requirements", "responsibilities"
])

def extract_keywords(text: str) -> list:
    doc = nlp(text)

    keywords = set()

    # 🔹 Named Entities (e.g., "Google", "AWS")
    for ent in doc.ents:
        keywords.add(ent.text.lower().strip())

    # 🔹 Noun chunks (e.g., "machine learning", "rest api")
    for chunk in doc.noun_chunks:
        phrase = chunk.text.lower().strip()
        if len(phrase) > 2 and phrase not in STOPWORDS:
            keywords.add(phrase)

    # 🔹 Individual important words
    for token in doc:
        if token.pos_ in ["NOUN", "PROPN"]:
            word = token.text.lower().strip()
            if word not in STOPWORDS and len(word) > 2:
                keywords.add(word)

    # 🔹 CLEAN keywords (VERY IMPORTANT for your scorer)
    cleaned_keywords = set()

    for kw in keywords:
        # remove special characters
        kw = re.sub(r'[^a-zA-Z0-9\s]', '', kw)

        # split phrases into individual words ALSO
        parts = kw.split()
        for part in parts:
            if len(part) > 2:
                cleaned_keywords.add(part)

    return list(cleaned_keywords)