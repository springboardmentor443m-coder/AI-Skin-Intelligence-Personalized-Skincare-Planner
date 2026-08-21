import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models, schemas
from deps import get_current_user
from ml import ingredient_engine

router = APIRouter(prefix="/api/ingredients", tags=["ingredients"])


@router.get("")
def list_ingredients():
    return ingredient_engine.INGREDIENTS


@router.get("/suitable")
def suitable_for_me(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == user.id).first()
    skin_type = (profile.skin_type if profile else None) or "normal"
    concerns = json.loads(profile.concerns_json or "[]") if profile else []
    return ingredient_engine.suitable_ingredients(skin_type, concerns)


@router.post("/check-interactions")
def check_interactions(payload: schemas.IngredientCheckRequest):
    conflicts = ingredient_engine.check_interactions(payload.ingredient_names)
    return {"conflicts": conflicts, "safe_to_combine": len(conflicts) == 0}


@router.post("/check-allergies")
def check_allergies(payload: schemas.IngredientCheckRequest, user: models.User = Depends(get_current_user),
                     db: Session = Depends(get_db)):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == user.id).first()
    user_allergies = json.loads(profile.allergies_json or "[]") if profile else []
    flagged = ingredient_engine.check_allergies(payload.ingredient_names, user_allergies)
    return {"flagged": flagged, "safe": len(flagged) == 0}
