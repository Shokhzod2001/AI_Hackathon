from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.dependencies import get_current_user
from app.models.user import User
from app.ml import DrugJargonDetector

router = APIRouter(prefix="/api/v1/ml", tags=["ml"])


class PredictRequest(BaseModel):
    text: str


class PredictResponse(BaseModel):
    score: int
    probability: float
    label: str
    triggers: list[str]


class TrainResponse(BaseModel):
    cv_f1_mean: float
    cv_f1_std: float
    n_samples: int


@router.post("/predict", response_model=PredictResponse)
async def predict(body: PredictRequest, _: User = Depends(get_current_user)):
    return DrugJargonDetector.get().predict(body.text)


@router.post("/retrain", response_model=TrainResponse)
async def retrain(_: User = Depends(get_current_user)):
    """Retrain model from built-in corpus (runs synchronously, ~2s)."""
    from app.ml.corpus import POSITIVE, NEGATIVE
    texts  = POSITIVE + NEGATIVE
    labels = [1] * len(POSITIVE) + [0] * len(NEGATIVE)
    metrics = DrugJargonDetector.get().train(texts, labels)
    return metrics
