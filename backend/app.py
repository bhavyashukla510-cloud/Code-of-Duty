from fastapi import FastAPI
from backend.routes.score import router as score_router

app = FastAPI()

# Register routes
app.include_router(score_router)