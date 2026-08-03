from fastapi import APIRouter
from pydantic import BaseModel

from app.services.notifications import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class RegisterDeviceRequest(BaseModel):
    user_id: int
    fcm_token: str

class SendTestRequest(BaseModel):
    user_id: int
    title: str
    body: str
    type: str

@router.post("/register-device")
def register_device(request: RegisterDeviceRequest):
    return NotificationService.register_device(request.user_id, request.fcm_token)

@router.post("/send-test")
def send_test_notification(request: SendTestRequest):
    return NotificationService.send_notification(request.user_id, request.title, request.body, request.type)
