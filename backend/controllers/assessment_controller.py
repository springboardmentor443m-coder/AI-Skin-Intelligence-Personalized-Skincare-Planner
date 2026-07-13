from fastapi import UploadFile, HTTPException
from services.ml_service import ml_service
from config.database import get_database
from models.assessment import AssessmentRecord
from fastapi.encoders import jsonable_encoder

async def analyze_and_save_assessment(file: UploadFile):
    # 1. Run ML Analysis
    try:
        ml_result = ml_service.analyze_uploaded_image(file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running ML models: {str(e)}")
        
    analysis_data = ml_result["analysis"]
    
    # 2. Prepare database record
    record = AssessmentRecord(
        analysis=analysis_data,
        image_filename=file.filename
    )
    
    # 3. Save to MongoDB
    db = get_database()
    encoded_record = jsonable_encoder(record)
    
    try:
        result = await db["assessments"].insert_one(encoded_record)
        
        # 4. Return result to user
        return {
            "message": "Analysis successful and saved to database",
            "id": str(result.inserted_id),
            "analysis": analysis_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
