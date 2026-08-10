import os
import sys
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, Profile
from app.api.v1.endpoints.auth import get_current_user

# Add /ai directory to python path to load predict.py
base_dir = os.path.dirname(os.path.abspath(__file__))
ai_path = os.path.abspath(os.path.join(base_dir, "../../../../../ai"))
if ai_path not in sys.path:
    sys.path.append(ai_path)

router = APIRouter()

_classifier = None

def get_classifier():
    """Singleton getter for SkinClassifier model to avoid loading weights repeatedly."""
    global _classifier
    if _classifier is None:
        try:
            from predict import SkinClassifier
            model_path = os.path.join(ai_path, "skin_type_model.h5")
            _classifier = SkinClassifier(model_path=model_path)
        except FileNotFoundError as e:
            # Model not trained yet
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The AI classification model is not yet trained or loaded. Please run the training pipeline first."
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to load AI model: {e}"
            )
    return _classifier

@router.post("/analyze")
async def analyze_skin_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Validate file content type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a valid image (JPEG, PNG, etc.)."
        )
        
    try:
        # 2. Get classifier instance
        classifier = get_classifier()
        
        # 3. Read image bytes
        contents = await file.read()
        
        # 4. Run prediction
        skin_type, confidence, probabilities = classifier.predict(contents)
        
        # 5. Save the prediction to the user's profile database entry
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        if not profile:
            profile = Profile(user_id=current_user.id)
            db.add(profile)
            db.commit()
            
        profile.skin_type = skin_type
        # Add primary concern based on classification results if none exists
        if not profile.concerns:
            if skin_type == "oily":
                profile.concerns = ["oily_skin"]
            elif skin_type == "dry":
                profile.concerns = ["dry_skin"]
            elif skin_type == "combination":
                profile.concerns = ["oily_skin", "dry_skin"]
            elif skin_type == "sensitive":
                profile.concerns = ["sensitive_skin"]
        
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
        # 6. Build customized explanations
        details_mapping = {
            "oily": {
                "description": "Skin exhibits enlarged pores, visible shine, and hyperactive sebum production, mostly concentrated in the T-zone.",
                "risks": ["Acne Vulgaris", "Blackheads/Sebaceous Filaments", "Clogged Pores"],
                "recommendation": "Use non-comedogenic foaming cleansers and lightweight salicylic acid gels."
            },
            "dry": {
                "description": "Skin feels tight, dry, and shows signs of dehydration or fine peeling flakes due to weakened barrier lipids.",
                "risks": ["Dehydration lines", "Sensitivities / Redness", "Premature aging"],
                "recommendation": "Use rich ceramide-based creams, gentle milk cleansers, and hyaluronic acid serums."
            },
            "normal": {
                "description": "Balanced hydration, healthy barrier, clean pores, and minimal blemishes. Skin has optimal oil and water proportions.",
                "risks": ["Seasonal dryness", "UV exposure damage"],
                "recommendation": "Maintain state using broad-spectrum sunscreen and standard daily hydration creams."
            },
            "combination": {
                "description": "Skin exhibits a mix of oily areas in the T-zone (forehead, nose, chin) and normal to dry zones on the cheeks.",
                "risks": ["T-zone congestion", "Cheek flakiness", "Imbalanced sebum distribution"],
                "recommendation": "Use gentle gel cleansers, lightweight gel moisturizers, and target BHA treatments specifically on the T-zone."
            },
            "sensitive": {
                "description": "Skin barrier is easily compromised, resulting in frequent redness, stinging, warmth, or irritation in response to topical ingredients.",
                "risks": ["Contact dermatitis", "Impaired lipid barrier", "Inflammatory reactions"],
                "recommendation": "Use fragrance-free, hypoallergenic formulations, rich ceramides, and highly soothing agents like Centella Asiatica (Cica) and Panthenol."
            }
        }
        
        details = details_mapping.get(skin_type, {
            "description": "Skin evaluation completed.",
            "risks": [],
            "recommendation": "Consult a professional for a detailed routine."
        })
        
        return {
            "success": True,
            "skin_type": skin_type,
            "confidence": confidence,
            "probabilities": probabilities,
            "details": details,
            "updated_profile": {
                "skin_type": profile.skin_type,
                "concerns": profile.concerns
            }
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference processing failed: {e}"
        )


@router.post("/analyze-preset")
def analyze_preset_skin_type(
    skin_type: str = Query(..., description="dry | oily | normal | combination | sensitive"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        skin_type = skin_type.lower()
        if skin_type not in ["dry", "oily", "normal", "combination", "sensitive"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid preset skin type. Must be one of: dry, oily, normal, combination, sensitive."
            )
            
        # Map skin_type to test directory
        base_dir = os.path.dirname(os.path.abspath(__file__))
        ai_path = os.path.abspath(os.path.join(base_dir, "../../../../../ai"))
        test_class_dir = os.path.join(ai_path, "data", "test", skin_type)
        
        if not os.path.exists(test_class_dir):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Dataset test directory for '{skin_type}' not found."
            )
            
        files = [f for f in os.listdir(test_class_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        if not files:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No preset images found in {test_class_dir}."
            )
            
        preset_file_path = os.path.join(test_class_dir, files[0])
        
        with open(preset_file_path, "rb") as f:
            contents = f.read()
            
        # Run inference
        classifier = get_classifier()
        predicted_class, confidence, probabilities = classifier.predict(contents)
        
        # Save to database profile
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        if not profile:
            profile = Profile(user_id=current_user.id)
            db.add(profile)
            db.commit()
            
        profile.skin_type = predicted_class
        
        # Auto-assign concerns on preset scan to display non-zero intensities
        if predicted_class == "oily":
            profile.concerns = ["oily_skin", "acne"]
        elif predicted_class == "dry":
            profile.concerns = ["dry_skin", "fine_lines"]
        elif predicted_class == "combination":
            profile.concerns = ["oily_skin", "dry_skin", "acne"]
        elif predicted_class == "sensitive":
            profile.concerns = ["sensitive_skin"]
        else:
            profile.concerns = []
            
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
        # Details definitions
        details_mapping = {
            "oily": {
                "description": "Skin exhibits enlarged pores, visible shine, and hyperactive sebum production, mostly concentrated in the T-zone.",
                "risks": ["Acne Vulgaris", "Blackheads/Sebaceous Filaments", "Clogged Pores"],
                "recommendation": "Use non-comedogenic foaming cleansers and lightweight salicylic acid gels."
            },
            "dry": {
                "description": "Skin feels tight, dry, and shows signs of dehydration or fine peeling flakes due to weakened barrier lipids.",
                "risks": ["Dehydration lines", "Sensitivities / Redness", "Premature aging"],
                "recommendation": "Use rich ceramide-based creams, gentle milk cleansers, and hyaluronic acid serums."
            },
            "normal": {
                "description": "Balanced hydration, healthy barrier, clean pores, and minimal blemishes. Skin has optimal oil and water proportions.",
                "risks": ["Seasonal dryness", "UV exposure damage"],
                "recommendation": "Maintain state using broad-spectrum sunscreen and standard daily hydration creams."
            },
            "combination": {
                "description": "Skin exhibits a mix of oily areas in the T-zone (forehead, nose, chin) and normal to dry zones on the cheeks.",
                "risks": ["T-zone congestion", "Cheek flakiness", "Imbalanced sebum distribution"],
                "recommendation": "Use gentle gel cleansers, lightweight gel moisturizers, and target BHA treatments specifically on the T-zone."
            },
            "sensitive": {
                "description": "Skin barrier is easily compromised, resulting in frequent redness, stinging, warmth, or irritation in response to topical ingredients.",
                "risks": ["Contact dermatitis", "Impaired lipid barrier", "Inflammatory reactions"],
                "recommendation": "Use fragrance-free, hypoallergenic formulations, rich ceramides, and highly soothing agents like Centella Asiatica (Cica) and Panthenol."
            }
        }
        
        details = details_mapping.get(predicted_class, {
            "description": "Skin evaluation completed.",
            "risks": [],
            "recommendation": "Consult a professional for a detailed routine."
        })
        
        return {
            "success": True,
            "skin_type": predicted_class,
            "confidence": confidence,
            "probabilities": probabilities,
            "details": details,
            "updated_profile": {
                "skin_type": profile.skin_type,
                "concerns": profile.concerns
            }
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Preset scan failed: {e}"
        )

