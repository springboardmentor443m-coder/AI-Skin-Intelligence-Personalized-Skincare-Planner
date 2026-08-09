from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from recommendation.recommender import RecommendationEngine


class RecommendRequest(BaseModel):
    query: str


app = FastAPI(
    title="Skincare Recommendation API",
    description="Minimal FastAPI backend for the existing recommendation engine",
    version="1.0.0",
)


@app.on_event("startup")
def load_recommendation_engine() -> None:
    engine = RecommendationEngine()
    engine.load_models()
    app.state.recommendation_engine = engine


@app.get("/api/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "message": "Recommendation API is running",
    }


@app.post("/api/recommend")
def recommend(request: RecommendRequest) -> list[dict]:
    engine = getattr(app.state, "recommendation_engine", None)

    if engine is None:
        raise HTTPException(
            status_code=503,
            detail="Recommendation engine is not ready",
        )

    if not request.query.strip():
        raise HTTPException(
            status_code=400,
            detail="Query cannot be empty",
        )

    return engine.recommend_products(
        query_text=request.query,
        top_k=10,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("recommendation.api:app", host="127.0.0.1", port=8000)
