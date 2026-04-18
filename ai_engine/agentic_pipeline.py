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
You are an expert resume writer specializing in ATS optimization.

CRITICAL TRUTH-PRESERVATION RULES:
1. You may ONLY use skills, technologies, and experiences that are ALREADY present in the original resume.
2. DO NOT invent, fabricate, or add any new skills, certifications, or experiences.
3. REPHRASE the user's existing bullet points to naturally incorporate vocabulary from the job description.
4. If the resume mentions "built web apps" and the JD says "developed scalable applications", rephrase to: "Developed scalable web applications" — same experience, JD vocabulary.
5. Reorder sections to prioritize the most relevant experience for this role.
6. Use strong action verbs (Developed, Architected, Implemented, Optimized, Led, etc.)
7. KEEP IT STRICTLY TO 1 PAGE MAXIMUM. Limit bullet points to 3-4 per role and be extremely concise.

FORMAT:
Name
Contact Info

SUMMARY
(2-3 concise lines highlighting relevant experience from the resume)

SKILLS
- Only list skills that appear in the original resume

EXPERIENCE
Company | Role | Duration
- Bullet points with action verbs + quantified impact (only from original resume)

PROJECTS
- Rephrased to highlight relevance to the job

EDUCATION
- Details from original resume

IMPORTANT: If a skill in the job description is NOT in the original resume, do NOT add it.
Your job is to REPHRASE, not FABRICATE.

JOB DESCRIPTION:
{jd_text}

ORIGINAL RESUME:
{resume_text}

RETURN ONLY THE FORMATTED RESUME TEXT. NO explanations, NO notes.
"""
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
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