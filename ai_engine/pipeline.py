from backend.utils.keyword_extractor import extract_keywords
from ai_engine.truth_guard import validate

from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

import os


# 🔹 Load prompts safely
def load_prompt(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Prompt file not found: {file_path}")
    
    with open(file_path, "r") as f:
        return f.read()


# 🔥 FINAL FUNCTION (USED BY BACKEND)
def rewrite_pipeline(resume_text: str, jd_text: str) -> str:
    try:
        # STEP 1: Extract keywords
        jd_keywords = extract_keywords(jd_text)

        # STEP 2: Load prompts
        rewrite_prompt = load_prompt("ai_engine/prompts/rewrite_prompt.txt")
        constraint_prompt = load_prompt("ai_engine/prompts/constraint_prompt.txt")

        full_prompt = rewrite_prompt + "\n\n" + constraint_prompt

        # STEP 3: Setup LLM
        llm = ChatOpenAI(
            temperature=0.3,
            model="gpt-4"
        )

        prompt_template = PromptTemplate(
            input_variables=["resume_text", "jd_keywords"],
            template=full_prompt
        )

        chain = LLMChain(llm=llm, prompt=prompt_template)

        # STEP 4: Run LLM
        ai_output = chain.run({
            "resume_text": resume_text,
            "jd_keywords": ", ".join(jd_keywords)
        })

        if not ai_output or not ai_output.strip():
            raise ValueError("Empty AI response")

        # STEP 5: Truth Guard Validation
        validation = validate(resume_text, ai_output, jd_keywords)

        if not validation["passed"]:
            cleaned_output = ai_output

            for word in validation["flagged_additions"]:
                cleaned_output = cleaned_output.replace(word, "")

            return cleaned_output.strip()

        return ai_output.strip()

    except Exception as e:
        raise Exception(f"Pipeline failed: {str(e)}")