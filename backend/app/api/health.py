from fastapi import APIRouter

router = APIRouter()


@router.get("")
def health_check():
    return {"status": "ok", "service": "schola-api"}


@router.get("/live")
def liveness():
    return {"status": "alive"}
