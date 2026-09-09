import os
import logging
from typing import Optional, List
import numpy as np
import xgboost as xgb

logger = logging.getLogger(__name__)

# Global model instance loaded once at startup
_STRUCTURING_MODEL: Optional[xgb.Booster] = None

# Model file paths to check
MODEL_PATHS = [
    os.path.join(os.path.dirname(__file__), "models", "xgb_structuring_classifier.json"),
    os.path.join(os.path.dirname(__file__), "xgb_structuring_classifier.json"),
]


def load_structuring_model() -> Optional[xgb.Booster]:
    """Load the XGBoost structuring classifier model into memory once."""
    global _STRUCTURING_MODEL
    if _STRUCTURING_MODEL is not None:
        return _STRUCTURING_MODEL

    for path in MODEL_PATHS:
        if os.path.exists(path):
            try:
                booster = xgb.Booster()
                booster.load_model(path)
                _STRUCTURING_MODEL = booster
                logger.info(f"Loaded XGBoost structuring classifier model from {path}")
                return _STRUCTURING_MODEL
            except Exception as e:
                logger.error(f"Failed to load XGBoost model from {path}: {e}")

    logger.warning("xgb_structuring_classifier.json model file not found.")
    return None


def predict_structuring_risk(feature_vector: List[float]) -> Optional[float]:
    """
    Feed a 9-value feature vector into the XGBoost structuring model.
    Returns:
        Probability float in range [0.0, 1.0], or None if model unavailable.
    """
    model = load_structuring_model()
    if model is None:
        return None

    try:
        data = np.array([feature_vector], dtype=np.float32)
        dmatrix = xgb.DMatrix(data)
        predictions = model.predict(dmatrix)
        score = float(predictions[0])
        # Ensure score is bounded between 0.0 and 1.0
        return max(0.0, min(1.0, score))
    except Exception as e:
        logger.error(f"Error predicting structuring risk: {e}")
        return None


# Load model at module initialization
try:
    load_structuring_model()
except Exception as exc:
    logger.warning(f"Initial model load warning: {exc}")
