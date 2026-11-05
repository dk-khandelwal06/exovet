"""
Integration Test: FastAPI Endpoints
"""

import pytest
from api.index import (
    health_check,
    get_metrics,
    list_candidates,
    get_candidate_details,
    predict_exoplanet,
    get_model_comparison,
    get_feature_importance,
    get_error_analysis,
    PredictionRequest,
)


def test_health_endpoint():
    res = health_check()
    assert res["status"] == "healthy"
    assert res["model_loaded"] is True
    assert res["dataset_rows"] > 9000


def test_metrics_endpoint():
    res = get_metrics()
    assert res["best_model"] == "HistGradientBoosting"
    assert "test_evaluations" in res


def test_candidates_endpoint_pagination():
    res = list_candidates(page=1, limit=10)
    assert res["total"] > 9000
    assert len(res["items"]) == 10
    assert res["page"] == 1


def test_candidates_endpoint_filter():
    res = list_candidates(page=1, limit=10, disposition="CONFIRMED")
    assert res["total"] > 2000
    for item in res["items"]:
        assert item["koi_disposition"] == "CONFIRMED"


def test_candidate_details_endpoint():
    res = get_candidate_details("K00752.01")
    assert res["kepoi_name"] == "K00752.01"
    assert res["kepid"] == 10797460


def test_predict_endpoint_with_koi_id():
    req = PredictionRequest(koi_id="K00752.01")
    res = predict_exoplanet(req)
    assert res["predicted_disposition"] == "CONFIRMED"
    assert "confirmed_probability" in res


def test_feature_importance_endpoint():
    res = get_feature_importance()
    assert len(res["importances"]) == 12
    assert res["model_name"] == "HistGradientBoosting"


def test_error_analysis_endpoint():
    res = get_error_analysis()
    assert "summary" in res
    assert "sample_false_positives" in res
