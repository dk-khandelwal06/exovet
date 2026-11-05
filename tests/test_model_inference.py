"""
Unit Test: Machine Learning Model Artifacts & Real Inference
"""

import os
import pytest
from ml.predict import get_model, get_metadata, predict_candidate


def test_model_artifact_exists():
    """Verify trained joblib model and metadata JSON exist."""
    assert os.path.exists("ml/artifacts/best_model.joblib"), "Model artifact missing"
    assert os.path.exists("ml/artifacts/metadata.json"), "Metadata JSON missing"


def test_model_can_be_loaded():
    """Verify model pipeline loads properly."""
    model = get_model()
    assert model is not None
    assert hasattr(model, "predict_proba")


def test_metadata_contains_metrics():
    """Verify evaluation metadata contains valid benchmark scores."""
    meta = get_metadata()
    assert meta["best_model_name"] == "HistGradientBoosting"
    evals = meta["test_evaluations"]["HistGradientBoosting"]
    assert evals["pr_auc"] > 0.90, f"PR-AUC too low: {evals['pr_auc']}"
    assert evals["roc_auc"] > 0.90, f"ROC-AUC too low: {evals['roc_auc']}"


def test_predict_confirmed_planet():
    """Verify prediction on Kepler-227 b parameters produces high confirmed planet probability."""
    sample_planet = {
        'koi_period': 9.488,
        'koi_duration': 2.958,
        'koi_depth': 615.8,
        'koi_prad': 2.26,
        'koi_model_snr': 35.8,
        'koi_impact': 0.146,
        'koi_teq': 793.0,
        'koi_insol': 93.59,
        'koi_steff': 5455.0,
        'koi_slogg': 4.467,
        'koi_srad': 0.927,
        'koi_kepmag': 15.347
    }
    pred = predict_candidate(sample_planet)
    assert pred["predicted_disposition"] == "CONFIRMED"
    assert pred["confirmed_probability"] > 0.85
    assert "Likely Confirmed Planet" in pred["status"]


def test_predict_false_positive_stellar_binary():
    """Verify massive radius and huge transit depth triggers False Positive classification."""
    sample_binary = {
        'koi_period': 1.732,
        'koi_duration': 2.406,
        'koi_depth': 80000.0,  # 8% dimming
        'koi_prad': 65.0,       # 65 Earth radii (star-sized)
        'koi_model_snr': 500.0,
        'koi_impact': 0.8,
        'koi_teq': 1500.0,
        'koi_insol': 900.0,
        'koi_steff': 6000.0,
        'koi_slogg': 4.5,
        'koi_srad': 1.0,
        'koi_kepmag': 14.0
    }
    pred = predict_candidate(sample_binary)
    assert pred["predicted_disposition"] == "FALSE POSITIVE"
    assert pred["confirmed_probability"] < 0.15
    assert "Likely False Positive" in pred["status"]
