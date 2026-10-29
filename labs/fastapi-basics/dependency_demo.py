from typing import Annotated
from fastapi import Depends, FastAPI, Query

app = FastAPI()

def page_args(offset: int = Query(default=0, ge=0),
              limit: int = Query(default=10, ge=1, le=50)):
    return {"offset": offset, "limit": limit}

@app.get("/api/page-demo")
def page_demo(page: Annotated[dict, Depends(page_args)]):
    return page
