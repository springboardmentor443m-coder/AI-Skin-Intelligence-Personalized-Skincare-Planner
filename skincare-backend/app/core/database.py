from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

try:
    engine = create_engine(settings.DATABASE_URL)
    # Test connection
    with engine.connect() as conn:
        pass
except Exception:
    # Auto-fallback to local SQLite if PostgreSQL is not running locally
    print("PostgreSQL connection failed. Falling back to local SQLite database (skincare.db).")
    engine = create_engine("sqlite:///./skincare.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency used inside route functions to get a DB session per-request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def auto_migrate():
    """Ensure missing columns in existing tables are created automatically."""
    from sqlalchemy import inspect, text
    try:
        insp = inspect(engine)
        existing_tables = insp.get_table_names()
        with engine.begin() as conn:
            for table in Base.metadata.tables.values():
                if table.name in existing_tables:
                    existing_cols = {c["name"] for c in insp.get_columns(table.name)}
                    for col in table.columns:
                        if col.name not in existing_cols:
                            col_type = col.type.compile(engine.dialect)
                            conn.execute(text(f'ALTER TABLE "{table.name}" ADD COLUMN "{col.name}" {col_type}'))
                            print(f"Auto-migrated: Added missing column '{col.name}' to '{table.name}' table.")
    except Exception as e:
        print(f"Auto-migration warning: {e}")


