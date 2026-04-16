from ai_engine.pipeline import run_pipeline

# Step 1: Dummy resume text
resume = """
Developed backend using Java and Spring Boot.
Built REST APIs for scalable applications.
"""

# Step 2: Dummy job description
jd = """
Looking for a developer with experience in Java, Docker, and REST APIs.
"""

# Step 3: Run pipeline
result = run_pipeline(resume, jd)

# Step 4: Print output
print("\n===== FINAL OUTPUT =====\n")
print(result)