from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.score import router as score_router
from backend.routes.tailor import router as tailor_router
from backend.routes.upload import router as upload_router

app = FastAPI(title="AutoAlign API", description="Dynamic Resume Tailoring Engine")

# ── CORS Middleware ──
# Allow React dev server (localhost:5173) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[
        "X-Before-Score", "X-After-Score", "X-Improvement",
        "X-Before-ATS", "X-After-ATS",
        "X-Before-LLM", "X-After-LLM",
        "X-Matched-Keywords", "X-Missing-Keywords",
        "Content-Disposition",
    ],
)

@app.get("/")
def root():
    return {"message": "AutoAlign API running"}

app.include_router(upload_router, prefix="/api")
app.include_router(score_router, prefix="/api")
app.include_router(tailor_router, prefix="/api")