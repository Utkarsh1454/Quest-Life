"""Loads and indexes the free-exercise-db dataset for exercise images."""
import json
import logging
from pathlib import Path
from difflib import get_close_matches
import httpx

logger = logging.getLogger(__name__)

DATASET_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json"
IMAGE_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/"
CACHE_PATH = Path(__file__).parent.parent / "data" / "exercises_cache.json"

_exercises_by_name: dict[str, dict] = {}
_by_muscle_group: dict[str, list[dict]] = {}

async def load_exercise_dataset():
    """Fetch the dataset once at startup, or use a bundled local cache if offline."""
    global _exercises_by_name, _by_muscle_group
    data = None
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(DATASET_URL)
            if resp.status_code == 200:
                data = resp.json()
                CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
                CACHE_PATH.write_text(json.dumps(data), encoding='utf-8')
    except Exception as e:
        logger.warning(f"Could not fetch live exercise dataset: {e}")

    if data is None and CACHE_PATH.exists():
        try:
            data = json.loads(CACHE_PATH.read_text(encoding='utf-8'))
        except Exception as e:
            logger.warning(f"Failed to read exercise dataset cache: {e}")

    if not data:
        logger.info("Using built-in fallback exercise definitions.")
        return

    for ex in data:
        name_key = ex["name"].lower().strip()
        images = [f"{IMAGE_BASE}{img}" for img in ex.get("images", [])]
        entry = {
            "name": ex["name"],
            "images": images,
            "primary_muscles": ex.get("primaryMuscles", []),
            "category": ex.get("category", ""),
        }
        _exercises_by_name[name_key] = entry
        for muscle in entry["primary_muscles"]:
            _by_muscle_group.setdefault(muscle.lower(), []).append(entry)

def find_exercise(query_name: str) -> tuple[dict | None, str]:
    """Returns (entry, match_type). match_type is 'exact' | 'fuzzy' | 'muscle_fallback' | 'none'."""
    key = query_name.lower().strip()

    if key in _exercises_by_name:
        return _exercises_by_name[key], "exact"

    # Substring match (handles "barbell bench press" vs "bench press")
    for name, entry in _exercises_by_name.items():
        if key in name or name in key:
            return entry, "fuzzy"

    # Fuzzy string match as a second pass
    close = get_close_matches(key, list(_exercises_by_name.keys()), n=1, cutoff=0.6)
    if close:
        return _exercises_by_name[close[0]], "fuzzy"

    return None, "none"

def get_muscle_group_fallback(muscle_group: str) -> dict | None:
    """Generic image for a muscle group, used only when nothing else matches."""
    candidates = _by_muscle_group.get(muscle_group.lower(), [])
    return candidates[0] if candidates else None
