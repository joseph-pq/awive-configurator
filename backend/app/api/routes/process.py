from fastapi import APIRouter
from app.models import ProcessPublic

router = APIRouter(prefix="/process", tags=["process"])


@router.get("/", response_model=ProcessPublic)
def read_items() -> ProcessPublic:
    return ProcessPublic(ga="asdf")
