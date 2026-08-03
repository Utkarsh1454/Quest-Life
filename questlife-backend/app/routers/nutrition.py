from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.services.nutrition_db import parse_and_lookup

router = APIRouter(prefix="/nutrition", tags=["Nutrition Engine"])

class ParseNutritionRequest(BaseModel):
    query: str

@router.post("/parse")
def parse_nutrition(req: ParseNutritionRequest):
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail="Query string cannot be empty.")
    
    result = parse_and_lookup(req.query)
    return result
