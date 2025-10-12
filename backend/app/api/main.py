from fastapi import APIRouter

from app.api.routes import process

api_router = APIRouter()
api_router.include_router(process.router)
