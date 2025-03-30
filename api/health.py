from fastapi import APIRouter, status
from models import HealthCheck

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthCheck)
def get_health() -> HealthCheck:
    return HealthCheck(status="OK")
