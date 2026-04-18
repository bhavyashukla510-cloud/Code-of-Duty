import os
import requests
from dotenv import load_dotenv

load_dotenv()

def llm_judge_score(resume_text: str, jd_text: str) -> float:
    try:
        api_key = os.getenv("OPENAI_API_KEY")

        prompt = f"""
You are an expert recruiter and ATS evaluator.

Rate the resume based on:
- Relevance to job description
- Skills match
- Impact and achievements
- Use of strong action verbs
- Overall quality

Give a score from 0 to 100 ONLY.
Return ONLY a number.

JOB DESCRIPTION:
{jd_text}

RESUME:
{resume_text}
"""

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "openai/gpt-3.5-turbo",   # ✅ safe working model
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 50
            }
        )

        data = response.json()

        if "choices" not in data:
            raise Exception(data)

        output = data["choices"][0]["message"]["content"].strip()

        # extract number
        score = float(''.join(c for c in output if (c.isdigit() or c == '.')))

        return min(max(score, 0), 100)

    except Exception as e:
        print("LLM Judge Error:", e)
        return 0