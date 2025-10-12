import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.responses import FileResponse
from fastapi.routing import APIRoute
from fastapi.staticfiles import StaticFiles

from app.api.main import api_router

ENV = os.getenv("ENV", "dev")  # "dev" or "prod"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
ENABLE_HTTPS_REDIRECT = os.getenv("ENABLE_HTTPS_REDIRECT", "0") == "1"

def custom_generate_unique_id(route: APIRoute) -> str:
    tag = route.tags[0] if route.tags else "default"
    return f"{tag}-{route.name}"


app = FastAPI(
    title="AWIVE Configurator",
    openapi_url="/api/v1/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] if ENV == "production" else ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
if ENV == "production" and ENABLE_HTTPS_REDIRECT:
    app.add_middleware(HTTPSRedirectMiddleware)

app.include_router(api_router, prefix="/api/v1")

frontend_dir = Path(__file__).resolve().parents[2] / "frontend" / "build"
# app.mount("/static", StaticFiles(directory=frontend_dir / "static"), name="static")
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

@app.get("/")
def serve_root():
    index_file = frontend_dir / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"message": "Frontend not built or not found"}

# Optional: fallback for React routing (SPA)
@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    index_file = frontend_dir / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"message": f"Frontend not built or not found for {full_path}"}
