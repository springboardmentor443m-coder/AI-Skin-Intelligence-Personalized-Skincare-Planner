from typing import Dict, List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.services.rag_service import rag_engine

router = APIRouter(prefix="/rag", tags=["RAG AI Model Engine"])


class RAGQueryRequest(BaseModel):
    query: str
    user_concern: Optional[str] = None
    user_skin_type: Optional[str] = None
    api_key: Optional[str] = None
    scan_analysis: Optional[Dict] = None
    lang: Optional[str] = "en"


class RAGRecommendationRequest(BaseModel):
    user_concern: Optional[str] = None
    user_skin_type: Optional[str] = None
    top_k: Optional[int] = 6


@router.post("/query")
def query_rag_model(req: RAGQueryRequest):
    """
    RAG API Endpoint: Retrieves dataset products + clinical knowledge context
    and generates grounded generative response via Gemini API / Vector engine.
    """
    res = rag_engine.generate_rag_response(
        user_query=req.query,
        user_concern=req.user_concern,
        user_skin_type=req.user_skin_type,
        api_key=req.api_key,
        scan_analysis=req.scan_analysis,
        lang=req.lang or "en"
    )
    return res


@router.post("/recommendations")
def get_rag_recommendations(req: RAGRecommendationRequest):
    """
    RAG API Endpoint: Vector similarity matching over the 1,138 CSV products dataset.
    """
    products, kb = rag_engine.retrieve_relevant_context(
        query=f"{req.user_concern or ''} {req.user_skin_type or ''}",
        user_concern=req.user_concern,
        user_skin_type=req.user_skin_type,
        top_k=req.top_k or 6
    )
    return {
        "status": "success",
        "rag_source": "1,138 Product Dataset Vector Engine",
        "products": products,
        "knowledge_topics": [k["topic"] for k in kb]
    }
