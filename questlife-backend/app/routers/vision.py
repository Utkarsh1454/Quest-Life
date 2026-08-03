from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any

from app.cv.form_checker import FormChecker
from app.cv.food_recognizer import FoodRecognizer

router = APIRouter(prefix="/vision", tags=["Vision"])

class PoseRequest(BaseModel):
    exercise_type: str
    pose_data: Dict[str, Any]

class ImageRequest(BaseModel):
    image_base64: str

@router.post("/form-check")
def check_form(request: PoseRequest):
    result = FormChecker.analyze_pose(request.exercise_type, request.pose_data)
    return result

@router.post("/food-recognition")
def recognize_food(request: ImageRequest):
    result = FoodRecognizer.analyze_food_image(request.image_base64)
    return result
