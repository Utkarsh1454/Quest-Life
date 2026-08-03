from fastapi import APIRouter
from pydantic import BaseModel

from app.services.wearables import WearablesService

router = APIRouter(prefix="/wearables", tags=["Wearables"])

class SyncRequest(BaseModel):
    user_id: int
    auth_token: str

@router.post("/sync/google-fit")
def sync_google_fit(request: SyncRequest):
    return WearablesService.sync_google_fit(request.user_id, request.auth_token)

@router.post("/sync/apple-health")
def sync_apple_health(request: SyncRequest):
    return WearablesService.sync_apple_health(request.user_id, request.auth_token)
