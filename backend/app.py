from fastapi import FastAPI
from backend.routes.score import router as score_router
from backend.routes.tailor import router as tailor_router

app = FastAPI()

app.include_router(score_router)
app.include_router(tailor_router)