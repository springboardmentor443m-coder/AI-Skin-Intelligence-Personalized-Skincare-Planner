import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from groq import Groq
import jwt
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from pydantic import BaseModel

# Load environment variables
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_key_change_in_production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "skincare_db")

app = FastAPI(title="AI Skincare API - MongoDB Integrated")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MongoDB Client via Motor
client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db["users"]
chats_collection = db["chats"]

# Initialize Groq & Password Context
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# --- Pydantic Schemas ---


class UserAuth(BaseModel):
  username: str
  password: str


class Token(BaseModel):
  access_token: str
  token_type: str


class ChatRequest(BaseModel):
  user_message: str
  skin_concern: str = "general"


# --- Security Helper Functions ---


def hash_password(password: str) -> str:
  pwd_bytes = password.encode("utf-8")[:72]
  return pwd_context.hash(pwd_bytes.decode("utf-8", errors="ignore"))


def verify_password(plain_password: str, hashed_password: str) -> bool:
  pwd_bytes = plain_password.encode("utf-8")[:72]
  return pwd_context.verify(
      pwd_bytes.decode("utf-8", errors="ignore"), hashed_password
  )


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
  to_encode = data.copy()
  expire = datetime.now(timezone.utc) + (
      expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
  )
  to_encode.update({"exp": expire})
  return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)):
  credentials_exception = HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Could not validate credentials",
      headers={"WWW-Authenticate": "Bearer"},
  )
  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    username: str = payload.get("sub")
    if username is None:
      raise credentials_exception

    # Query MongoDB for user
    user = await users_collection.find_one({"username": username})
    if user is None:
      raise credentials_exception
    return user
  except jwt.PyJWTError:
    raise credentials_exception


# --- Root & Auth Endpoints ---


@app.get("/")
def read_root():
  return {"status": "online", "message": "FastAPI Skincare Backend is running!"}


@app.post("/api/auth/register")
async def register(user_data: UserAuth):
  # Check if user already exists in MongoDB
  existing_user = await users_collection.find_one(
      {"username": user_data.username}
  )
  if existing_user:
    raise HTTPException(status_code=400, detail="Username is already taken.")

  # Insert user into MongoDB
  user_doc = {
      "username": user_data.username,
      "password": hash_password(user_data.password),
      "created_at": datetime.now(timezone.utc),
  }
  await users_collection.insert_one(user_doc)

  return {
      "message": (
          f"User '{user_data.username}' registered successfully in MongoDB!"
      )
  }


@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
  user = await users_collection.find_one({"username": form_data.username})

  if not user or not verify_password(form_data.password, user["password"]):
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

  access_token = create_access_token(data={"sub": user["username"]})
  return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
  return {"logged_in_as": current_user["username"]}


# --- AI Chat Endpoint (Saves to MongoDB) ---


@app.post("/api/chat")
async def skincare_chatbot(
    request: ChatRequest, current_user: dict = Depends(get_current_user)
):
  try:
    # Pass current_user["username"] directly into the AI prompt
    user_name = current_user.get("username", "User")
    prompt = (
        f"You are an expert AI Skincare Assistant. Address the user named"
        f" {user_name} warmly in your reply. Primary concern:"
        f" {request.skin_concern}. Question: {request.user_message}"
    )

    chat_completion = groq_client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile",
    )
    bot_reply = chat_completion.choices[0].message.content

    # Save chat history to MongoDB under the user's name
    chat_doc = {
        "username": current_user["username"],
        "user_message": request.user_message,
        "skin_concern": request.skin_concern,
        "bot_reply": bot_reply,
        "timestamp": datetime.now(timezone.utc),
    }
    await chats_collection.insert_one(chat_doc)

    return {"reply": bot_reply}
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))