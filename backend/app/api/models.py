# Placeholder
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId

from app.schemas.models import (
    AIModelCreate,
    AIModelUpdate
)

from app.database.collections import (
    ai_models_collection
)
from app.api.dependencies import get_current_user, get_current_super_admin

router = APIRouter(
    prefix="/models",
    tags=["AI Models"]
)

@router.post("/create", dependencies=[Depends(get_current_super_admin)])
def create_model(data: AIModelCreate):

    existing = ai_models_collection.find_one(
        {"model_name": data.model_name}
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Model already exists"
        )

    model = {
        "model_name": data.model_name,
        "provider": data.provider,
        "input_cost_per_1k": data.input_cost_per_1k,
        "output_cost_per_1k": data.output_cost_per_1k,
        "is_active": data.is_active
    }

    result = ai_models_collection.insert_one(model)

    return {
        "message": "AI Model Created Successfully",
        "model_id": str(result.inserted_id)
    }


@router.get("/all", dependencies=[Depends(get_current_user)])
def get_all_models():
    models = list(ai_models_collection.find())
    for model in models:
        model["_id"] = str(model["_id"])
    return {
        "total": len(models),
        "models": models
    }

@router.get("/media-rates")
def get_media_rates():
    # Real, raw API costs based on current official pricing to prevent loss
    return {
        "image": {
            "nano_banana_2_lite": {
                "name": "Nano Banana 2 Lite (Flash Lite)",
                "resolutions": {
                    "1K (1024x1024)": {"tokens": 1117, "cost": 0.033},
                    "2K (2048x2048)": {"tokens": 1683, "cost": 0.050},
                    "4K (4096x4096)": {"tokens": 2517, "cost": 0.075}
                }
            },
            "nano_banana_2": {
                "name": "Nano Banana 2 (Flash)",
                "resolutions": {
                    "1K (1024x1024)": {"tokens": 1117, "cost": 0.067},
                    "2K (2048x2048)": {"tokens": 1683, "cost": 0.101},
                    "4K (4096x4096)": {"tokens": 2517, "cost": 0.151}
                }
            },
            "nano_banana_pro": {
                "name": "Nano Banana Pro (Gemini 3 Pro)",
                "resolutions": {
                    "1K (1024x1024)": {"tokens": 1117, "cost": 0.100},
                    "2K (2048x2048)": {"tokens": 1683, "cost": 0.139},
                    "4K (4096x4096)": {"tokens": 2517, "cost": 0.240}
                }
            }
        },
        "video": {
            "720p": 0.05,  # Runway Gen-2 standard (roughly 5 credits/sec = $0.05)
            "1080p": 0.08, # Premium/Upscaled API 
            "4k": 0.15     # 4K / High tier Video models
        },
        "audio": 0.0003    # ElevenLabs premium realistic TTS (~$0.30 per 1000 characters)
    }