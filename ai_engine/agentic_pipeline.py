import os
import requests
from dotenv import load_dotenv

load_dotenv()

def run_agentic_pipeline(resume_text: str, jd_text: str) -> str:
    try:
        api_key = os.getenv("OPENAI_API_KEY")

        if not api_key:
            return "ERROR: API key missing"

        prompt = f"""
You are an expert resume writer.

STRICT RULES:
- Rewrite the resume for the SAME ROLE only
- DO NOT change domain
- Improve content using job description
- Use professional resume format

FORMAT:
Name
Contact Info

SUMMARY:
(2-3 lines)

SKILLS:
- bullet points

EXPERIENCE:
Company | Role | Duration
- bullet points with action verbs + impact

PROJECTS:
- bullet points

EDUCATION:
- details

Make it clean, structured, and human-readable.

JOB DESCRIPTION:
{jd_text}

RESUME:
{resume_text}

RETURN ONLY FORMATTED RESUME.
"""
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                # ✅ FIXED MODEL (WORKING)
                "model": "openai/gpt-3.5-turbo",

                "messages": [
                    {"role": "user", "content": prompt}
                ],

                "max_tokens": 700,
                "temperature": 0.3
            }
        )

        data = response.json()

        # 🔍 DEBUG (VERY IMPORTANT)
        print("\n====== AI DEBUG ======")
        print("RAW RESPONSE:", data)
        print("======================")

        # ❌ If API failed
        if "choices" not in data:
            return f"ERROR: {data}"

        output = data["choices"][0]["message"]["content"].strip()

        # 🚨 CRITICAL: detect no rewrite
        if output.lower().strip() == resume_text.lower().strip():
            return "ERROR: AI DID NOT CHANGE RESUME"

        return output

    except Exception as e:
        return f"ERROR: {str(e)}"