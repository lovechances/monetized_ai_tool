from fastapi import FastAPI

from app.config import APP_NAME, APP_VERSION, APP_ENV
from app.db.init_db import init_db
from app.routes import ai, auth, billing, reports, system, usage, users, uploads, jobs
from app.config import FRONTEND_URL
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(users.router)
app.include_router(auth.router)
app.include_router(ai.router)
app.include_router(reports.router)
app.include_router(usage.router)
app.include_router(system.router)
app.include_router(uploads.router)
app.include_router(jobs.router)
app.include_router(billing.router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def root():
    return {
        "message": "Monetized AI Backend is running",
        "app_name": APP_NAME,
        "version": APP_VERSION,
        "environment": APP_ENV
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }


@app.get("/version")
def get_version():
    return {
        "app_name": APP_NAME,
        "version": APP_VERSION,
        "environment": APP_ENV
    }

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "backend",
    }