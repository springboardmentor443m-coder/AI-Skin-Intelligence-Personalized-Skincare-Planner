from typing import Optional
import json
import os
import uuid
# pyrefly: ignore [missing-import]
import jwt
from fastapi import FastAPI, File, UploadFile, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from PIL import UnidentifiedImageError
from sqlalchemy.orm import Session

import time
import logging

logger = logging.getLogger("uvicorn.error")

if __package__:
    from .auth import router as auth_router
    from .chat import router as chat_router
    from .database import get_db
    from .models.prediction import PredictionHistory
    from .models.routine import RoutineHistory
    from .predict import predict_image, get_model
    from .services.image_validator import validate_skin_image, get_face_cascades
    from .recommendations import (
        RecommendationFileInvalidError,
        RecommendationFileMissingError,
        RecommendationNotFoundError,
        RecommendationUnexpectedError,
        get_recommendation,
    )
else:
    from auth import router as auth_router
    from chat import router as chat_router
    from database import get_db
    from models.prediction import PredictionHistory
    from models.routine import RoutineHistory
    from predict import predict_image, get_model
    from services.image_validator import validate_skin_image, get_face_cascades
    from recommendations import (
        RecommendationFileInvalidError,
        RecommendationFileMissingError,
        RecommendationNotFoundError,
        RecommendationUnexpectedError,
        get_recommendation,
    )

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-load TensorFlow model and OpenCV Haar face cascades ONCE during backend startup."""
    t_start = time.perf_counter()
    logger.info("[STARTUP] Pre-loading TensorFlow model and OpenCV Haar Cascades...")
    try:
        get_model()
        get_face_cascades()
        t_elapsed = (time.perf_counter() - t_start) * 1000
        logger.info(f"[STARTUP] Warmup complete in {t_elapsed:.2f} ms. TensorFlow model ready in memory.")
    except Exception as err:
        logger.error(f"[STARTUP] Model pre-loading warning: {err}")
    yield

app = FastAPI(title="AI Skin Care API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(chat_router)

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/pjpeg",
    "image/png",
    "image/webp",
    "application/octet-stream",
}

CONTENT_TYPE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/pjpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/octet-stream": ".jpg",
}

SECRET_KEY = "ai_skin_intelligence_super_secret_jwt_key_2026"
ALGORITHM = "HS256"


@app.get("/")
def read_root():
    return {"message": "AI Skin Care API is running successfully!"}


@app.post("/predict")
async def predict_endpoint(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    t_total_start = time.perf_counter()
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    temp_file_path = None
    try:
        content_type = (file.content_type or "image/jpeg").lower().strip()

        content = await file.read(MAX_UPLOAD_BYTES + 1)
        if not content:
            return JSONResponse(
                status_code=400,
                content={
                    "valid_image": False,
                    "prediction": None,
                    "confidence": 0,
                    "message": "The uploaded image is empty."
                }
            )
        if len(content) > MAX_UPLOAD_BYTES:
            return JSONResponse(
                status_code=413,
                content={
                    "valid_image": False,
                    "prediction": None,
                    "confidence": 0,
                    "message": "Image must be 10MB or smaller."
                }
            )

        extension = CONTENT_TYPE_EXTENSIONS.get(content_type, ".jpg")
        unique_filename = f"{uuid.uuid4().hex}{extension}"
        temp_file_path = os.path.join(upload_dir, unique_filename)

        with open(temp_file_path, "wb") as buffer:
            buffer.write(content)

        # 1. Strong Image Validation Layer BEFORE calling CNN model
        t_val_start = time.perf_counter()
        validation = validate_skin_image(temp_file_path)
        t_val = (time.perf_counter() - t_val_start) * 1000

        if not validation.get("valid_image"):
            t_total = (time.perf_counter() - t_total_start) * 1000
            logger.info(
                f"\n[PERFORMANCE]\n"
                f"Backend validation: {t_val:.2f} ms\n"
                f"Model loading: 0 ms\n"
                f"Preprocessing: 0 ms\n"
                f"CNN inference: 0 ms\n"
                f"Recommendation: 0 ms\n"
                f"Database: 0 ms\n"
                f"Total: {t_total:.2f} ms\n"
            )
            return JSONResponse(
                status_code=200,
                content={
                    "valid_image": False,
                    "prediction": None,
                    "confidence": 0,
                    "message": validation.get(
                        "message",
                        "This doesn't appear to be a clear skin/face image. Please upload a clear photo of the affected skin area."
                    ),
                }
            )

        # 2. Run TensorFlow CNN Prediction for validated skin images
        t_pred_start = time.perf_counter()
        try:
            prediction = predict_image(temp_file_path)
        except (UnidentifiedImageError, OSError):
            return JSONResponse(
                status_code=200,
                content={
                    "valid_image": False,
                    "prediction": None,
                    "confidence": 0,
                    "message": "The uploaded file is not a valid image."
                }
            )
        t_pred = (time.perf_counter() - t_pred_start) * 1000

        condition = prediction.get("disease")
        confidence_val = float(prediction.get("confidence", 0))
        timing_info = prediction.get("timing_ms", {})
        t_model = timing_info.get("model_check", 0)
        t_prep = timing_info.get("preprocessing", 0)
        t_infer = timing_info.get("inference", 0)

        # 3. Handle Ambiguous / Low Confidence Predictions (OOD Rejection)
        if not condition or prediction.get("is_ambiguous"):
            t_total = (time.perf_counter() - t_total_start) * 1000
            logger.info(
                f"\n[PERFORMANCE]\n"
                f"Backend validation: {t_val:.2f} ms\n"
                f"Model loading: {t_model:.2f} ms\n"
                f"Preprocessing: {t_prep:.2f} ms\n"
                f"CNN inference: {t_infer:.2f} ms\n"
                f"Recommendation: 0 ms\n"
                f"Database: 0 ms\n"
                f"Total: {t_total:.2f} ms\n"
            )
            return JSONResponse(
                status_code=200,
                content={
                    "valid_image": True,
                    "prediction": None,
                    "confidence": confidence_val,
                    "is_ambiguous": True,
                    "message": prediction.get("message", "Unable to confidently identify a skin condition."),
                    "recommendation": None,
                }
            )

        # 4. Valid Confident Disease Prediction -> Load Recommendation & Persist
        t_rec_start = time.perf_counter()
        recommendation = get_recommendation(condition)
        t_rec = (time.perf_counter() - t_rec_start) * 1000

        t_db_start = time.perf_counter()
        user_id = None
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1].strip('"').strip("'")
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                user_id = payload.get("user_id")
            except Exception:
                pass

        rec_id = None
        created_at_iso = None
        try:
            rec_str = json.dumps(recommendation) if isinstance(recommendation, dict) else str(recommendation)
            pred_record = PredictionHistory(
                user_id=user_id,
                disease=condition,
                confidence=f"{confidence_val * 100:.2f}%",
                recommendation=rec_str,
            )
            db.add(pred_record)
            db.commit()
            db.refresh(pred_record)
            rec_id = pred_record.id
            created_at_iso = pred_record.created_at.isoformat() if pred_record.created_at else None
        except Exception as db_err:
            logger.warning(f"Database prediction history persistence skipped: {db_err}")
            db.rollback()

        t_db = (time.perf_counter() - t_db_start) * 1000
        t_total = (time.perf_counter() - t_total_start) * 1000
        logger.info(
            f"\n[PERFORMANCE]\n"
            f"Backend validation: {t_val:.2f} ms\n"
            f"Model loading: {t_model:.2f} ms\n"
            f"Preprocessing: {t_prep:.2f} ms\n"
            f"CNN inference: {t_infer:.2f} ms\n"
            f"Recommendation: {t_rec:.2f} ms\n"
            f"Database: {t_db:.2f} ms\n"
            f"Total: {t_total:.2f} ms\n"
        )

        return JSONResponse(
            status_code=200,
            content={
                "valid_image": True,
                "id": rec_id,
                "prediction": condition,
                "confidence": confidence_val,
                "recommendation": recommendation,
                "created_at": created_at_iso,
            }
        )


    except RecommendationFileMissingError as exc:
        return JSONResponse(status_code=500, content={"detail": str(exc)})
    except RecommendationFileInvalidError as exc:
        return JSONResponse(status_code=500, content={"detail": str(exc)})
    except RecommendationNotFoundError as exc:
        return JSONResponse(status_code=500, content={"detail": str(exc)})
    except RecommendationUnexpectedError as exc:
        return JSONResponse(status_code=500, content={"detail": str(exc)})
    except Exception as exc:
        return JSONResponse(status_code=500, content={"detail": str(exc)})
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)


@app.get("/predictions/history")
def get_prediction_history(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("user_id")
        except Exception:
            pass

    query = db.query(PredictionHistory)
    if user_id:
        query = query.filter(PredictionHistory.user_id == user_id)

    records = query.order_by(PredictionHistory.created_at.desc()).all()
    parsed_records = []
    for r in records:
        rec_data = r.recommendation
        if isinstance(rec_data, str) and rec_data.startswith("{"):
            try:
                rec_data = json.loads(rec_data)
            except Exception:
                pass
        item = r.to_dict()
        item["recommendation"] = rec_data
        parsed_records.append(item)

    return {"predictions": parsed_records}


@app.delete("/predictions/history/{pred_id}")
def delete_prediction_history(
    pred_id: int,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("user_id")
        except Exception:
            pass

    query = db.query(PredictionHistory).filter(PredictionHistory.id == pred_id)
    if user_id:
        query = query.filter(PredictionHistory.user_id == user_id)

    record = query.first()
    if not record:
        return JSONResponse(status_code=404, content={"detail": "Prediction record not found."})

    db.delete(record)
    db.commit()
    return {"message": f"Prediction {pred_id} deleted successfully."}


class RoutineCompleteRequest(BaseModel):
    date_str: str
    routine_type: str
    task_name: str
    completed: bool = True


@app.post("/routine/complete")
def record_routine_completion(
    request: RoutineCompleteRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("user_id")
        except Exception:
            pass

    if not user_id:
        return JSONResponse(status_code=401, content={"detail": "Authentication required."})

    entry = (
        db.query(RoutineHistory)
        .filter(
            RoutineHistory.user_id == user_id,
            RoutineHistory.date_str == request.date_str,
            RoutineHistory.routine_type == request.routine_type,
            RoutineHistory.task_name == request.task_name,
        )
        .first()
    )

    if not entry:
        entry = RoutineHistory(
            user_id=user_id,
            date_str=request.date_str,
            routine_type=request.routine_type,
            task_name=request.task_name,
            completed=request.completed,
        )
        db.add(entry)
    else:
        entry.completed = request.completed

    db.commit()
    db.refresh(entry)

    return {"message": "Routine status saved.", "entry": entry.to_dict()}


@app.get("/routine/history")
def get_routine_history(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("user_id")
        except Exception:
            pass

    if not user_id:
        return {"routine_history": []}

    records = (
        db.query(RoutineHistory)
        .filter(RoutineHistory.user_id == user_id)
        .order_by(RoutineHistory.created_at.desc())
        .limit(100)
        .all()
    )

    return {"routine_history": [r.to_dict() for r in records]}
