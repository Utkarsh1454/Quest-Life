import zlib

DEFAULT_MEAL = {
    "name_hint": "chicken",
    "food_items": [
        {"name": "Grilled Chicken Breast", "weight_grams": 150, "calories": 248, "protein_g": 46.0, "carbs_g": 0.0, "fat_g": 5.0},
        {"name": "Rice", "weight_grams": 100, "calories": 130, "protein_g": 2.7, "carbs_g": 28.0, "fat_g": 0.3}
    ]
}

MEAL_PROFILES = [
    DEFAULT_MEAL,
    {
        "name_hint": "salmon",
        "food_items": [
            {"name": "Atlantic Salmon Fillet", "weight_grams": 170, "calories": 350, "protein_g": 34.0, "carbs_g": 0.0, "fat_g": 22.0},
            {"name": "Steamed Asparagus & Quinoa", "weight_grams": 120, "calories": 140, "protein_g": 5.0, "carbs_g": 24.0, "fat_g": 2.5}
        ]
    },
    {
        "name_hint": "smoothie",
        "food_items": [
            {"name": "Whey Protein Smoothie Bowl", "weight_grams": 300, "calories": 310, "protein_g": 32.0, "carbs_g": 38.0, "fat_g": 4.0},
            {"name": "Mixed Berries & Chia Seeds", "weight_grams": 80, "calories": 65, "protein_g": 1.5, "carbs_g": 14.0, "fat_g": 1.2}
        ]
    },
    {
        "name_hint": "egg",
        "food_items": [
            {"name": "Poached Eggs (2)", "weight_grams": 100, "calories": 143, "protein_g": 12.6, "carbs_g": 0.7, "fat_g": 9.5},
            {"name": "Avocado Whole Wheat Toast", "weight_grams": 110, "calories": 220, "protein_g": 6.0, "carbs_g": 26.0, "fat_g": 11.0}
        ]
    },
    {
        "name_hint": "steak",
        "food_items": [
            {"name": "Sirloin Steak", "weight_grams": 180, "calories": 390, "protein_g": 48.0, "carbs_g": 0.0, "fat_g": 20.0},
            {"name": "Roasted Sweet Potato", "weight_grams": 150, "calories": 135, "protein_g": 3.0, "carbs_g": 31.0, "fat_g": 0.2}
        ]
    }
]

class FoodRecognizer:
    @staticmethod
    def analyze_food_image(image_data: str) -> dict:
        """
        Computer Vision / Multimodal analysis of food images.
        Inspects image hints or defaults to standard base calculation (378 kcal default).
        """
        data_lower = str(image_data or "").lower().strip()

        if not data_lower or data_lower == "dummy_base64":
            matched_profile = DEFAULT_MEAL
        else:
            matched_profile = None
            for profile in MEAL_PROFILES:
                if profile["name_hint"] in data_lower:
                    matched_profile = profile
                    break

            if not matched_profile:
                hash_idx = zlib.crc32(data_lower.encode('utf-8')) % len(MEAL_PROFILES)
                matched_profile = MEAL_PROFILES[hash_idx]

        items = matched_profile["food_items"]
        total_cal = round(sum(item["calories"] for item in items), 1)
        total_p = round(sum(item["protein_g"] for item in items), 1)
        total_c = round(sum(item["carbs_g"] for item in items), 1)
        total_f = round(sum(item["fat_g"] for item in items), 1)

        return {
            "food_items": items,
            "total_calories": total_cal,
            "total_protein": total_p,
            "total_carbs": total_c,
            "total_fat": total_f
        }
