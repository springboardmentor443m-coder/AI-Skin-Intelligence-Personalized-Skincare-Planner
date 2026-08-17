from fastapi import UploadFile, HTTPException
from services.ml_service import ml_service
from services.recommendation_service import recommendation_service
# pyrefly: ignore [missing-import]
from config.database import get_database
from models.assessment import AssessmentRecord
from fastapi.encoders import jsonable_encoder

from typing import Optional, Dict, Any

async def analyze_and_save_assessment(file: UploadFile, current_user: Optional[Dict[str, Any]] = None, gender: str = "Unisex"):
    # 1. Run ML Analysis
    try:
        ml_result = ml_service.analyze_uploaded_image(file)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running ML models: {str(e)}")
        
    analysis_data = ml_result["analysis"]
    
    # 2. Extract Skin Type and Primary Concern
    predicted_type = analysis_data.get("skin_type", {}).get("prediction", "Normal")
    predicted_concern = analysis_data.get("skin_concerns", {}).get("prediction", "Normal")
    
    # 3. Generate Tailored Product Recommendations & Groq LLM 7-Day Routine
    product_recs = recommendation_service.get_product_recommendations(predicted_type, predicted_concern, gender)
    weekly_routine = recommendation_service.generate_llm_routine(predicted_type, predicted_concern, gender)
    
    user_id = current_user["id"] if current_user else "anonymous"
    
    # 4. Prepare database record
    record = AssessmentRecord(
        user_id=user_id,
        analysis=analysis_data,
        image_filename=file.filename
    )
    
    # 5. Save to MongoDB
    db = get_database()
    encoded_record = jsonable_encoder(record)
    
    try:
        result = await db["assessments"].insert_one(encoded_record)
        
        # 6. Return comprehensive result to user
        return {
            "message": "Analysis successful and saved to database",
            "id": str(result.inserted_id),
            "analysis": analysis_data,
            "product_recommendations": product_recs,
            "weekly_routine": weekly_routine
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

