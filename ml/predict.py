"""
ExoVet Inference Engine
Loads serialized model artifacts and performs fast, reliable astronomical predictions.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional

from ml.data import BASE_FEATURES
from ml.features import AstronomicalFeatureEngineer

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _resolve_path(rel_path: str) -> str:
    """Find file in BASE_DIR, current working directory, or relative paths."""
    candidates = [
        os.path.join(BASE_DIR, rel_path),
        os.path.join(os.getcwd(), rel_path),
        os.path.abspath(rel_path),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", rel_path),
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return os.path.join(BASE_DIR, rel_path)


MODEL_PATH = _resolve_path("ml/artifacts/best_model.joblib")
METADATA_PATH = _resolve_path("ml/artifacts/metadata.json")

_cached_model = None
_cached_metadata = None


def get_model():
    """Load and cache the trained model pipeline."""
    global _cached_model
    if _cached_model is None:
        model_file = _resolve_path("ml/artifacts/best_model.joblib")
        if not os.path.exists(model_file):
            raise FileNotFoundError(f"Trained model not found at {model_file}. Train the model first.")
        _cached_model = joblib.load(model_file)
    return _cached_model


def get_metadata():
    """Load and cache metadata and evaluation results."""
    global _cached_metadata
    if _cached_metadata is None:
        meta_file = _resolve_path("ml/artifacts/metadata.json")
        if not os.path.exists(meta_file):
            raise FileNotFoundError(f"Metadata not found at {meta_file}.")
        with open(meta_file, "r") as f:
            _cached_metadata = json.load(f)
    return _cached_metadata


def predict_candidate(features_dict: Dict[str, Any], threshold: float = 0.50) -> Dict[str, Any]:
    """
    Perform exoplanet vetting prediction on a dictionary of candidate measurements.
    
    Returns:
    - predicted_class: "CONFIRMED" or "FALSE POSITIVE"
    - probability: float between 0.0 and 1.0 (probability of being a confirmed planet)
    - threshold: decision threshold applied
    - status: "Likely Confirmed Planet" or "Likely False Positive"
    - model_used: name of the model
    - key_influences: astrophysical factors guiding the decision
    - uncertainty_statement: scientific disclaimer
    """
    model = get_model()
    metadata = get_metadata()

    # Build input dataframe ensuring column order matches BASE_FEATURES
    row_data = {}
    for col in BASE_FEATURES:
        val = features_dict.get(col)
        # Default or fallback if null
        row_data[col] = float(val) if val is not None and not np.isnan(float(val)) else np.nan

    input_df = pd.DataFrame([row_data])

    # Run inference
    prob_confirmed = float(model.predict_proba(input_df)[0, 1])
    is_confirmed = prob_confirmed >= threshold
    predicted_label = "CONFIRMED" if is_confirmed else "FALSE POSITIVE"
    status_label = "Likely Confirmed Planet" if is_confirmed else "Likely False Positive"

    # Analyze local astrophysical indicators
    influences = []
    prad = row_data.get('koi_prad', np.nan)
    depth = row_data.get('koi_depth', np.nan)
    period = row_data.get('koi_period', np.nan)
    snr = row_data.get('koi_model_snr', np.nan)
    impact = row_data.get('koi_impact', np.nan)

    if not np.isnan(prad):
        if prad > 30.0:
            influences.append({
                "feature": "koi_prad",
                "value": prad,
                "effect": "Strong False Positive Indicator",
                "reason": f"Planetary radius of {prad:.1f} R_earth exceeds known physical limits for planets (~25-30 R_earth). High probability of eclipsing stellar binary."
            })
        elif prad < 4.0:
            influences.append({
                "feature": "koi_prad",
                "value": prad,
                "effect": "Favorable Planet Candidate",
                "reason": f"Radius of {prad:.1f} R_earth falls squarely within terrestrial / super-Earth / sub-Neptune regime."
            })

    if not np.isnan(depth):
        if depth > 50000.0:
            influences.append({
                "feature": "koi_depth",
                "value": depth,
                "effect": "Deep Transit Dip",
                "reason": f"Transit depth of {depth:.0f} ppm (>5% stellar dimming) is typical of stellar occultations rather than planetary transits."
            })
        elif depth < 5000.0:
            influences.append({
                "feature": "koi_depth",
                "value": depth,
                "effect": "Subtle Planetary Dip",
                "reason": f"Transit depth of {depth:.0f} ppm is consistent with planetary transit across solar-type star."
            })

    if not np.isnan(snr):
        if snr < 10.0:
            influences.append({
                "feature": "koi_model_snr",
                "value": snr,
                "effect": "Low Signal-to-Noise",
                "reason": f"Signal-to-noise ratio of {snr:.1f} is near Kepler's photometric detection floor; elevated risk of instrumental artifact."
            })
        else:
            influences.append({
                "feature": "koi_model_snr",
                "value": snr,
                "effect": "Robust Detection SNR",
                "reason": f"Signal-to-noise ratio of {snr:.1f} indicates clear transit signal above stellar noise floor."
            })

    if not np.isnan(impact) and impact > 0.9:
        influences.append({
            "feature": "koi_impact",
            "value": impact,
            "effect": "High Grazing Impact",
            "reason": f"Impact parameter {impact:.2f} indicates grazing geometry; transit profile is V-shaped and more prone to false-positive confusion."
        })

    return {
        "predicted_disposition": predicted_label,
        "status": status_label,
        "confirmed_probability": round(prob_confirmed, 4),
        "false_positive_probability": round(1.0 - prob_confirmed, 4),
        "threshold": threshold,
        "model_name": metadata.get("best_model_name", "HistGradientBoosting"),
        "key_influences": influences,
        "uncertainty_statement": (
            "ExoVet model predictions represent statistical estimates derived from Kepler catalog photometric parameters. "
            "They do not constitute formal astronomical validation or discovery confirmation, which requires high-resolution imaging, "
            "radial velocity spectroscopy, or statistical validation via tools like Morton's VESPA."
        )
    }

