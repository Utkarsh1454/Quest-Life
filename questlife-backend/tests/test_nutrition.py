import pytest
from app.services.nutrition_db import parse_and_lookup, find_best_match

def test_local_parser_heuristics():
    """Verify that the local fallback regex parser extracts food items and quantities properly."""
    result = parse_and_lookup("2 chapati and 1 bowl dal")
    assert len(result["items"]) == 2
    
    # First item: Chapati
    item1 = result["items"][0]
    assert "chapati" in item1["food"].lower() or "roti" in item1["food"].lower()
    assert item1["quantity_label"] == "2"
    assert item1["source"] == "ICMR-NIN IFCT 2017"
    assert item1["calories"] == 208 # 104 * 2

    # Second item: Dal
    item2 = result["items"][1]
    assert "dal" in item2["food"].lower()
    assert item2["quantity_label"] == "1 bowl"
    assert item2["source"] == "ICMR-NIN IFCT 2017"
    assert item2["calories"] == 198 # 198 * 1

def test_database_hierarchy_resolution():
    """Verify that foods are matched to the correct database in the hierarchy."""
    # Dal -> Indian (IFCT)
    match_dal = find_best_match("dal")
    assert match_dal is not None
    assert match_dal[1] == "ICMR-NIN IFCT 2017"

    # Chicken breast -> USDA
    match_chicken = find_best_match("chicken breast")
    assert match_chicken is not None
    assert match_chicken[1] == "USDA FoodData Central"

    # Oreo -> Open Food Facts
    match_oreo = find_best_match("oreo")
    assert match_oreo is not None
    assert match_oreo[1] == "Open Food Facts"

    # Subway -> Nutritionix
    match_subway = find_best_match("subway sandwich")
    assert match_subway is not None
    assert match_subway[1] == "Nutritionix API"

    # Avocado salad recipe -> Edamam
    match_salad = find_best_match("avocado salad recipe")
    assert match_salad is not None
    assert match_salad[1] == "Edamam API"

def test_macro_scaling():
    """Verify that macronutrient scaling works correctly for weights, volumes, and units."""
    # Scenario A: Gram scaling (e.g. 200g paneer, serving is 100g)
    result = parse_and_lookup("200g paneer")
    assert len(result["items"]) == 1
    paneer_item = result["items"][0]
    assert paneer_item["calories"] == 530 # 265 * 2
    assert paneer_item["protein"] == 36.0 # 18 * 2
    
    # Scenario B: Unit scaling (e.g. 3 eggs, serving is 1 egg)
    result_eggs = parse_and_lookup("3 eggs")
    egg_item = result_eggs["items"][0]
    assert egg_item["calories"] == 216 # 72 * 3
    assert egg_item["protein"] == 18.9 # 6.3 * 3

def test_api_endpoint(client):
    """Test the /nutrition/parse API endpoint."""
    response = client.post(
        "/api/v1/nutrition/parse",
        json={"query": "2 chapati, 100g paneer"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "2 chapati, 100g paneer"
    assert len(data["items"]) == 2
    assert data["totals"]["calories"] == 473 # 208 + 265 (estimated/calculated)

@pytest.mark.skip(reason="Depends on live third-party network scraper")
def test_live_scraper_fallback():
    """Verify that querying a non-local food (like 'quinoa') falls back to the live scraper."""
    result = parse_and_lookup("1 quinoa")
    assert len(result["items"]) == 1
    quinoa = result["items"][0]
    assert quinoa["source"] in ["NutritionValue API", "Estimated Standard Portion"]
    assert quinoa["calories"] > 0
    assert quinoa["carbs"] > 0
    assert quinoa["protein"] > 0
