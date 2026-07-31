import os
import uuid

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from PIL import UnidentifiedImageError

if __package__:
    from .predict import predict_image
    from .recommendations import (
        RecommendationFileInvalidError,
        RecommendationFileMissingError,
        RecommendationNotFoundError,
        RecommendationUnexpectedError,
        get_recommendation,
    )
else:
    from predict import predict_image
    from recommendations import (
        RecommendationFileInvalidError,
        RecommendationFileMissingError,
        RecommendationNotFoundError,
        RecommendationUnexpectedError,
        get_recommendation,
    )

app = FastAPI(title="AI Skin Care API")
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024


@app.get("/")
def read_root():
    return {"message": "AI Skin Care API is running successfully!"}


@app.post("/predict")
async def predict_endpoint(file: UploadFile = File(...)):
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    temp_file_path = None
    try:
        if file.content_type not in ALLOWED_CONTENT_TYPES:
            return JSONResponse(
                status_code=400,
                content={"detail": "Upload a PNG, JPEG, or WEBP image."},
            )

        content = await file.read(MAX_UPLOAD_BYTES + 1)
        if not content:
            return JSONResponse(status_code=400, content={"detail": "The uploaded image is empty."})
        if len(content) > MAX_UPLOAD_BYTES:
            return JSONResponse(status_code=413, content={"detail": "Image must be 10MB or smaller."})

        extension = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}[file.content_type]
        unique_filename = f"{uuid.uuid4().hex}{extension}"
        temp_file_path = os.path.join(upload_dir, unique_filename)

        with open(temp_file_path, "wb") as buffer:
            buffer.write(content)

        try:
            prediction = predict_image(temp_file_path)
        except (UnidentifiedImageError, OSError):
            return JSONResponse(status_code=400, content={"detail": "The uploaded file is not a valid image."})
        condition = prediction.get("disease")
        if not isinstance(condition, str):
            raise RecommendationNotFoundError(
                "The prediction did not contain a valid skin condition."
            )

        recommendation = get_recommendation(condition)
        return JSONResponse(
            content={
                "prediction": condition,
                "confidence": round(float(prediction["confidence"]) / 100, 4),
                "recommendation": recommendation,
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
