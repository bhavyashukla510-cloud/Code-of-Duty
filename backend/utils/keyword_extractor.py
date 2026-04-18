import os
import re
import requests
from dotenv import load_dotenv

load_dotenv()

def extract_keywords(text):
    """
    Extract technical keywords, programming languages, tools, and frameworks from a job description.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        return _fallback_extract(text)

    prompt = f"""
You are an expert technical recruiter. Extract a list of ONLY technical skills, programming languages, frameworks, and tools from the following job description.
Return ONLY a comma-separated list of keywords. DO NOT include generic words like 'good', 'strong', 'experience', 'development', 'team', 'working', etc.

JOB DESCRIPTION:
{text}
"""
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "openai/gpt-3.5-turbo",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 100,
                "temperature": 0.1
            },
            timeout=10
        )
        data = response.json()
        if "choices" in data:
            output = data["choices"][0]["message"]["content"].strip()
            # Split by comma and clean up
            keywords = [kw.strip().lower() for kw in output.split(",") if kw.strip()]
            return list(set(keywords))
    except Exception as e:
        print(f"LLM extraction failed: {e}")
        
    return _fallback_extract(text)

def _fallback_extract(text):
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
    stopwords = {
        "the", "and", "with", "have", "from", "your", "their", "about", "which",
        "will", "would", "there", "these", "those", "been", "being", "into",
        "over", "under", "using", "used", "also", "other", "good", "strong",
        "experience", "development", "team", "working", "design", "build",
        "must", "should", "could", "this", "that", "high", "expected", "including",
        "like", "field", "issues", "deliver", "growth", "discussions", "apis", "restful"
    }
    keywords = [w for w in words if w not in stopwords]
    return list(set(keywords))