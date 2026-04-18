# from backend.utils.keyword_extractor import extract_keywords
# from ai_engine.truth_guard import validate

# from langchain_community.chat_models import ChatOpenAI
# from langchain_core.prompts import PromptTemplate

# import os
# from dotenv import load_dotenv

# load_dotenv()

# def load_prompt(file_path):
#     with open(file_path, "r") as f:
#         return f.read()


# def rewrite_pipeline(resume_text: str, jd_text: str) -> str:
#     try:
#         jd_keywords = extract_keywords(jd_text)

#         rewrite_prompt = load_prompt("ai_engine/prompts/rewrite_prompt.txt")
#         constraint_prompt = load_prompt("ai_engine/prompts/constraint_prompt.txt")

#         full_prompt = rewrite_prompt + "\n\n" + constraint_prompt

#         prompt = PromptTemplate(
#             input_variables=["resume_text", "jd_keywords"],
#             template=full_prompt
#         )

#         formatted_prompt = prompt.format(
#             resume_text=resume_text,
#             jd_keywords=", ".join(jd_keywords)
#         )

#         api_key = os.getenv("OPENAI_API_KEY")

#         if not api_key:
#             raise ValueError("OPENAI_API_KEY not found in environment variables")

#         llm = ChatOpenAI(
#         temperature=0.3,
#         model="openai/gpt-3.5-turbo",   # ✅ required for OpenRouter
#         max_tokens=500,
#         openai_api_key=api_key,
#         base_url="https://openrouter.ai/api/v1"   # ✅ IMPORTANT
# )

#         response = llm.invoke(formatted_prompt)
#         ai_output = response.content

#         validation = validate(resume_text, ai_output, jd_keywords)

#         if not validation["passed"]:
#             cleaned_output = ai_output
#             for word in validation["flagged_additions"]:
#                 cleaned_output = cleaned_output.replace(word, "")

#             return cleaned_output.strip()

#         return ai_output.strip()

#     except Exception as e:
#         raise Exception(f"Pipeline failed: {str(e)}")