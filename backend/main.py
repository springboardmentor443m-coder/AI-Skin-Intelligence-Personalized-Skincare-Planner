import os
import uuid

from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from google.auth.transport import requests
from google.oauth2 import id_token
from pydantic import BaseModel
from PIL import UnidentifiedImageError

BASE_DIR = os.path.dirname(__file__)
for env_path in [os.path.join(BASE_DIR, ".env"), os.path.join(BASE_DIR, "..", ".env")]:
    if os.path.exists(env_path):
        load_dotenv(env_path, override=False)

if __package__:
    try:
        from .predict import predict_image
        from .recommendations import (
            RecommendationFileInvalidError,
            RecommendationFileMissingError,
            RecommendationNotFoundError,
            RecommendationUnexpectedError,
            get_recommendation,
        )
    except ModuleNotFoundError:
        predict_image = None
        RecommendationFileInvalidError = RecommendationFileMissingError = RecommendationNotFoundError = RecommendationUnexpectedError = Exception
        get_recommendation = None
    from .chatbot import ask_groq
else:
    try:
        from predict import predict_image
        from recommendations import (
            RecommendationFileInvalidError,
            RecommendationFileMissingError,
            RecommendationNotFoundError,
            RecommendationUnexpectedError,
            get_recommendation,
        )
    except ModuleNotFoundError:
        predict_image = None
        RecommendationFileInvalidError = RecommendationFileMissingError = RecommendationNotFoundError = RecommendationUnexpectedError = Exception
        get_recommendation = None
    from chatbot import ask_groq


app = FastAPI(title="AI Skin Care API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    context: dict | None = None


class GoogleAuthRequest(BaseModel):
    credential: str


ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024


@app.get("/")
def read_root():
    return {
        "message": "AI Skin Care API is running successfully!"
    }


@app.post("/auth/google")
async def google_auth(request: GoogleAuthRequest):
    client_id = os.getenv("GOOGLE_CLIENT_ID") or os.getenv("GOOGLE_OAUTH_CLIENT_ID")

    if not client_id:
        return JSONResponse(
            status_code=500,
            content={"detail": "Google OAuth client ID is not configured on the backend."},
        )

    try:
        payload = id_token.verify_oauth2_token(request.credential, requests.Request(), client_id)
    except ValueError as exc:
        return JSONResponse(status_code=401, content={"detail": str(exc)})

    if payload.get("aud") != client_id:
        return JSONResponse(status_code=401, content={"detail": "The Google credential audience is invalid."})

    if payload.get("iss") not in {"accounts.google.com", "https://accounts.google.com"}:
        return JSONResponse(status_code=401, content={"detail": "The Google credential issuer is invalid."})

    if not payload.get("email_verified"):
        return JSONResponse(status_code=401, content={"detail": "The Google account email is not verified."})

    return {
        "name": payload.get("name") or payload.get("email", "Google User"),
        "email": payload.get("email"),
        "picture": payload.get("picture") or "",
        "googleId": payload.get("sub") or "",
    }


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
            return JSONResponse(
                status_code=400,
                content={"detail": "The uploaded image is empty."},
            )

        if len(content) > MAX_UPLOAD_BYTES:
            return JSONResponse(
                status_code=413,
                content={"detail": "Image must be 10MB or smaller."},
            )

        extension = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
        }[file.content_type]

        unique_filename = f"{uuid.uuid4().hex}{extension}"

        temp_file_path = os.path.join(upload_dir, unique_filename)

        with open(temp_file_path, "wb") as buffer:
            buffer.write(content)

        if predict_image is None or get_recommendation is None:
            return JSONResponse(
                status_code=503,
                content={"detail": "Prediction services are currently unavailable."},
            )

        try:
            prediction = predict_image(temp_file_path)
        except (UnidentifiedImageError, OSError):
            return JSONResponse(
                status_code=400,
                content={"detail": "The uploaded file is not a valid image."},
            )

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


@app.options("/chat")
async def chat_options():
    return JSONResponse(status_code=200, content={})


@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        reply = ask_groq(request.message, request.context)

        return {
            "status": "success",
            "reply": reply,
        }

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "detail": str(e),
            },
        )