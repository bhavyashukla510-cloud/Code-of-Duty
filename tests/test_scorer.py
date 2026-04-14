from backend.services.scorer import compute_score

def test_score():
    resume = "I built a web application using React and Python"
    jd = "Looking for a developer with React Python and API skills"

    score = compute_score(resume, jd)

    assert score > 0