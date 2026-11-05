"""
ExoVet FastAPI Backend Application
Serves real-time inference, candidate queries, model metrics, and AI explanations.
Compatible with standard local uvicorn and Vercel Python serverless runtime.
"""

import os
import sys
import json
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

# Ensure workspace root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from ml.data import BASE_FEATURES
from ml.predict import predict_candidate, get_metadata

app = FastAPI(
    title="ExoVet API",
    description="Scientific exoplanet vetting engine powered by NASA Kepler data and machine learning.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Candidate cache
_candidates_df = None


def _resolve_data_path():
    candidate_paths = [
        os.path.join(BASE_DIR, "data", "raw", "kepler_cumulative.csv"),
        os.path.join(os.getcwd(), "data", "raw", "kepler_cumulative.csv"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "raw", "kepler_cumulative.csv"),
        "/var/task/data/raw/kepler_cumulative.csv"
    ]
    for p in candidate_paths:
        if os.path.exists(p):
            return p
    return candidate_paths[0]


def load_candidates():
    global _candidates_df
    if _candidates_df is None:
        csv_path = _resolve_data_path()
        if os.path.exists(csv_path):
            cols = [
                'kepid', 'kepoi_name', 'kepler_name', 'koi_disposition',
                'koi_period', 'koi_duration', 'koi_depth', 'koi_prad',
                'koi_model_snr', 'koi_impact', 'koi_teq', 'koi_insol',
                'koi_steff', 'koi_slogg', 'koi_srad', 'koi_kepmag', 'ra', 'dec'
            ]
            df = pd.read_csv(csv_path)
            avail_cols = [c for c in cols if c in df.columns]
            _candidates_df = df[avail_cols].copy()
            # Clean kepoi_name for whitespace
            _candidates_df['kepoi_name'] = _candidates_df['kepoi_name'].astype(str).str.strip()
            _candidates_df['kepid'] = _candidates_df['kepid'].astype(int)
        else:
            _candidates_df = pd.DataFrame()
    return _candidates_df


# Pydantic Schemas
class PredictionRequest(BaseModel):
    koi_id: Optional[str] = None
    koi_period: Optional[float] = Field(None, ge=0.01, le=5000.0, description="Orbital period in days")
    koi_duration: Optional[float] = Field(None, ge=0.01, le=200.0, description="Transit duration in hours")
    koi_depth: Optional[float] = Field(None, ge=0.1, le=2000000.0, description="Transit depth in parts per million")
    koi_prad: Optional[float] = Field(None, ge=0.01, le=500000.0, description="Planet radius in Earth radii")
    koi_model_snr: Optional[float] = Field(None, ge=0.0, le=50000.0, description="Transit signal to noise ratio")
    koi_impact: Optional[float] = Field(None, ge=0.0, le=100.0, description="Impact parameter")
    koi_teq: Optional[float] = Field(None, ge=0.0, le=30000.0, description="Equilibrium temperature in Kelvin")
    koi_insol: Optional[float] = Field(None, ge=0.0, le=50000000.0, description="Insolation flux (Earth=1)")
    koi_steff: Optional[float] = Field(None, ge=1000.0, le=30000.0, description="Stellar effective temperature in Kelvin")
    koi_slogg: Optional[float] = Field(None, ge=0.0, le=7.0, description="Stellar surface gravity log(g)")
    koi_srad: Optional[float] = Field(None, ge=0.01, le=500.0, description="Stellar radius in Solar radii")
    koi_kepmag: Optional[float] = Field(None, ge=1.0, le=25.0, description="Kepler-band apparent magnitude")
    threshold: Optional[float] = Field(0.50, ge=0.05, le=0.95)


@app.get("/")
@app.get("/api")
def root():
    """Root endpoint verifying ExoVet backend status."""
    return {
        "name": "ExoVet API",
        "description": "NASA Kepler Exoplanet Vetting Engine",
        "status": "operational",
        "version": "1.0.0"
    }


@app.get("/api/health")
@app.get("/health")
def health_check():
    """System health check and runtime status."""
    try:
        meta = get_metadata()
        has_model = os.path.exists(os.path.join(BASE_DIR, "ml", "artifacts", "best_model.joblib"))
        df = load_candidates()
        return {
            "status": "healthy",
            "model_loaded": has_model,
            "best_model": meta.get("best_model_name", "HistGradientBoosting"),
            "dataset_rows": len(df),
            "version": "1.0.0"
        }
    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e)
        }


@app.get("/api/metrics")
@app.get("/metrics")
def get_metrics():
    """Retrieve test performance metrics for all compared models."""
    try:
        meta = get_metadata()
        return {
            "best_model": meta.get("best_model_name"),
            "dataset_info": meta.get("dataset_info"),
            "test_evaluations": meta.get("test_evaluations")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/candidates")
@app.get("/candidates")
def list_candidates(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    disposition: Optional[str] = None,
    sort_by: str = "koi_period",
    sort_order: str = "asc"
):
    """Search, filter, and paginate through Kepler Candidates."""
    df = load_candidates()
    if df.empty:
        return {"total": 0, "page": page, "limit": limit, "items": []}

    filtered = df.copy()

    # Search filter by KOI name or Kepler ID
    if search and isinstance(search, str):
        s = search.strip().upper()
        mask = (
            filtered['kepoi_name'].str.upper().str.contains(s, na=False) |
            filtered['kepid'].astype(str).str.contains(s, na=False)
        )
        if 'kepler_name' in filtered.columns:
            mask = mask | filtered['kepler_name'].fillna('').str.upper().str.contains(s)
        filtered = filtered[mask]

    # Disposition filter
    if disposition and isinstance(disposition, str) and disposition.upper() != "ALL":
        filtered = filtered[filtered['koi_disposition'].str.upper() == disposition.upper()]

    # Sorting
    if sort_by in filtered.columns:
        ascending = (str(sort_order).lower() == "asc")
        filtered = filtered.sort_values(by=sort_by, ascending=ascending, na_position='last')

    total = len(filtered)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    page_df = filtered.iloc[start_idx:end_idx]

    # Replace NaNs with None for JSON compliance
    clean_items = page_df.replace({np.nan: None}).to_dict(orient="records")

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": int(np.ceil(total / limit)) if limit > 0 else 1,
        "items": clean_items
    }


@app.get("/api/candidates/{koi_id}")
@app.get("/candidates/{koi_id}")
def get_candidate_details(koi_id: str):
    """Retrieve full photometric details of a specific candidate by KOI name or KEPID."""
    df = load_candidates()
    clean_id = koi_id.strip().upper()

    match = df[
        (df['kepoi_name'].str.upper() == clean_id) |
        (df['kepid'].astype(str) == clean_id)
    ]

    if match.empty:
        # Try matching prefix e.g. "K00752.01" when user queries "752.01"
        alt_id = f"K0{clean_id}" if not clean_id.startswith("K") else clean_id
        match = df[df['kepoi_name'].str.upper().str.contains(clean_id)]
        if match.empty:
            raise HTTPException(status_code=404, detail=f"Candidate '{koi_id}' not found in Kepler catalog.")

    row = match.iloc[0].replace({np.nan: None}).to_dict()
    return row


@app.post("/api/predict")
@app.post("/predict")
def predict_exoplanet(request: PredictionRequest):
    """
    Run machine learning vetting prediction.
    Accepts either an existing KOI ID or direct physical measurements.
    """
    input_features = {}

    # If koi_id is provided, populate missing fields from catalog
    if request.koi_id:
        try:
            candidate = get_candidate_details(request.koi_id)
            for f in BASE_FEATURES:
                val = getattr(request, f)
                input_features[f] = val if val is not None else candidate.get(f)
            koi_name = candidate.get('kepoi_name')
        except HTTPException:
            koi_name = request.koi_id
    else:
        koi_name = "Custom Observation"

    for f in BASE_FEATURES:
        if f not in input_features or input_features[f] is None:
            input_features[f] = getattr(request, f)

    try:
        prediction = predict_candidate(input_features, threshold=request.threshold or 0.50)
        prediction["koi_id"] = koi_name
        prediction["input_features"] = {k: (round(v, 4) if isinstance(v, float) else v) for k, v in input_features.items()}
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/api/model-comparison")
@app.get("/model-comparison")
def get_model_comparison():
    """Retrieve cross-validation benchmarks and ROC/PR curve points for all models."""
    try:
        meta = get_metadata()
        return {
            "cv_results": meta.get("cv_results"),
            "test_evaluations": meta.get("test_evaluations")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/feature-importance")
@app.get("/feature-importance")
def get_feature_importance():
    """Retrieve held-out permutation feature importances."""
    try:
        meta = get_metadata()
        return {
            "model_name": meta.get("best_model_name"),
            "importances": meta.get("permutation_importance"),
            "leakage_audit": meta.get("leakage_audit")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/error-analysis")
@app.get("/error-analysis")
def get_error_analysis():
    """Retrieve misclassified false positives and false negatives with astrophysical insights."""
    try:
        meta = get_metadata()
        return meta.get("error_analysis", {})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.index:app", host="0.0.0.0", port=8000, reload=True)
