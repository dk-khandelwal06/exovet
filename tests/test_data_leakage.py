"""
Unit Test: Data Ingestion and Leakage Prevention
"""

import os
import pytest
import pandas as pd
from ml.data import (
    load_raw_data,
    audit_leakage,
    prepare_datasets,
    BASE_FEATURES,
    LEAKAGE_COLUMNS,
)


def test_raw_data_exists():
    """Verify raw cumulative Kepler dataset is present."""
    raw_path = "data/raw/kepler_cumulative.csv"
    assert os.path.exists(raw_path), f"File {raw_path} not found"
    df = pd.read_csv(raw_path)
    assert len(df) > 9000, f"Expected >9,000 rows, got {len(df)}"


def test_leakage_audit_identifies_all_columns():
    """Verify leakage audit catches robovetter disposition score and flags."""
    df = load_raw_data()
    report = audit_leakage(df)
    identified = report["identified_leakage_columns"]
    for col in ["koi_score", "koi_fpflag_nt", "koi_fpflag_ss", "koi_fpflag_co"]:
        assert col in identified, f"Expected {col} in identified leakage columns"


def test_leakage_excluded_from_training_features():
    """Verify base features used for training contain zero leakage columns."""
    for col in LEAKAGE_COLUMNS:
        assert col not in BASE_FEATURES, f"CRITICAL: Leakage column {col} found in BASE_FEATURES!"


def test_prepare_datasets_separation():
    """Verify labeled rows are strictly CONFIRMED and FALSE POSITIVE, and CANDIDATES are isolated."""
    labeled_df, candidate_df, _ = prepare_datasets()
    assert set(labeled_df['koi_disposition'].unique()) == {"CONFIRMED", "FALSE POSITIVE"}
    assert (candidate_df['koi_disposition'] == "CANDIDATE").all()
    assert set(labeled_df['target'].unique()) == {0, 1}
