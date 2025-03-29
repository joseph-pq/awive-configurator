from pydantic import BaseModel


class ProcessPublic(BaseModel):
    ga: str


class ProcessInput(BaseModel):
    gcps: list[tuple[int, int]]
    distances: dict[tuple[int, int], float]
