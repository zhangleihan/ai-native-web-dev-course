from typing import Literal
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Query, Response
from pydantic import BaseModel, ConfigDict, Field

Difficulty = Literal["beginner", "intermediate", "advanced"]


class CaseInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    title: str = Field(min_length=1, max_length=100)
    industry: str = Field(min_length=1, max_length=50)
    difficulty: Difficulty


class CaseOut(CaseInput):
    id: str


class CaseList(BaseModel):
    items: list[CaseOut]
    total: int


def create_app():
    app = FastAPI(title="案例库入门 API")
    items: dict[str, CaseOut] = {}

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    @app.get("/api/cases", response_model=CaseList)
    def list_cases(kw: str = Query(default="", max_length=100),
                   difficulty: Difficulty | None = None):
        found = [item for item in items.values()
                 if kw in item.title and (difficulty is None or item.difficulty == difficulty)]
        return {"items": found, "total": len(found)}

    @app.post("/api/cases", response_model=CaseOut, status_code=201)
    def create_case(body: CaseInput, response: Response):
        item = CaseOut(id=str(uuid4()), **body.model_dump())
        items[item.id] = item
        response.headers["Location"] = f"/api/cases/{item.id}"
        return item

    @app.get("/api/cases/{case_id}", response_model=CaseOut)
    def get_case(case_id: str):
        if case_id not in items:
            raise HTTPException(status_code=404, detail="案例不存在")
        return items[case_id]

    return app


app = create_app()
