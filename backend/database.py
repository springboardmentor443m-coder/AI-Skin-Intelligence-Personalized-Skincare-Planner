from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

if __package__:
    from .models.base import Base
    from .models.user import User
    from .models.chat import ChatHistory
    from .models.prediction import PredictionHistory
    from .models.skin_profile import SkinProfile
    from .models.routine import RoutineHistory
else:
    from models.base import Base
    from models.user import User
    from models.chat import ChatHistory
    from models.prediction import PredictionHistory
    from models.skin_profile import SkinProfile
    from models.routine import RoutineHistory

# Change these according to your MySQL setup
USERNAME = "root"
PASSWORD = "123456"
HOST = "localhost"
PORT = "3306"
DATABASE = "ai_skin_intelligence"

DATABASE_URL = (
    f"mysql+pymysql://{USERNAME}:{PASSWORD}@{HOST}:{PORT}/{DATABASE}"
)

engine = create_engine(
    DATABASE_URL,
    echo=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Create tables in MySQL
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Base.metadata.create_all error: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()