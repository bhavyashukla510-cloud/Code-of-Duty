from fastapi import FastAPI

from backend.routes.score import router as score_router
from backend.routes.tailor import router as tailor_router

app = FastAPI()

@app.get("/")
def root():
    return {"message": "API running"}

app.include_router(score_router, prefix="/api")
app.include_router(tailor_router, prefix="/api")