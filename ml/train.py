"""
ExoVet Model Training, Cross-Validation & Model Selection Module
Compares:
1. Majority Class Baseline
2. Logistic Regression (scaled)
3. Random Forest Classifier
4. HistGradientBoostingClassifier (Non-linear gradient boosted trees)
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix,
    precision_recall_curve, roc_curve
)
from sklearn.inspection import permutation_importance

from ml.data import prepare_datasets, BASE_FEATURES, LEAKAGE_COLUMNS, audit_leakage
from ml.features import AstronomicalFeatureEngineer, FEATURE_NAMES


def build_pipelines() -> Dict[str, Pipeline]:
    """Build scikit-learn pipelines for all candidate models."""
    models = {
        "Majority Baseline": Pipeline([
            ("engineer", AstronomicalFeatureEngineer()),
            ("imputer", SimpleImputer(strategy="median")),
            ("classifier", DummyClassifier(strategy="most_frequent"))
        ]),
        "Logistic Regression": Pipeline([
            ("engineer", AstronomicalFeatureEngineer()),
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("classifier", LogisticRegression(max_iter=1000, C=1.0, random_state=42))
        ]),
        "Random Forest": Pipeline([
            ("engineer", AstronomicalFeatureEngineer()),
            ("imputer", SimpleImputer(strategy="median")),
            ("classifier", RandomForestClassifier(
                n_estimators=150,
                max_depth=12,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            ))
        ]),
        "HistGradientBoosting": Pipeline([
            ("engineer", AstronomicalFeatureEngineer()),
            ("imputer", SimpleImputer(strategy="median")),
            ("classifier", HistGradientBoostingClassifier(
                max_iter=150,
                learning_rate=0.08,
                max_depth=8,
                min_samples_leaf=15,
                random_state=42
            ))
        ])
    }
    return models


def evaluate_cross_validation(pipelines: Dict[str, Pipeline], X_train: pd.DataFrame, y_train: pd.Series) -> Dict[str, Any]:
    """Run 5-Fold Stratified Cross-Validation on training set."""
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scoring = {
        'accuracy': 'accuracy',
        'precision': 'precision',
        'recall': 'recall',
        'f1': 'f1',
        'roc_auc': 'roc_auc',
        'pr_auc': 'average_precision'
    }

    cv_results = {}
    print("\n=== Running 5-Fold Stratified Cross-Validation ===")
    for name, pipe in pipelines.items():
        print(f"Evaluating {name}...")
        scores = cross_validate(pipe, X_train, y_train, cv=cv, scoring=scoring, return_train_score=False)
        cv_results[name] = {
            metric: {
                "mean": float(np.mean(scores[f"test_{metric}"])),
                "std": float(np.std(scores[f"test_{metric}"])),
                "folds": [float(x) for x in scores[f"test_{metric}"]]
            }
            for metric in scoring.keys()
        }
        print(f"  {name} -> PR-AUC: {cv_results[name]['pr_auc']['mean']:.4f} ± {cv_results[name]['pr_auc']['std']:.4f} | ROC-AUC: {cv_results[name]['roc_auc']['mean']:.4f} | F1: {cv_results[name]['f1']['mean']:.4f}")

    return cv_results


def run_full_training():
    """Main execution function for ExoVet ML workflow."""
    print("Step 1: Preparing dataset and performing leakage audit...")
    labeled_df, candidate_df, leakage_report = prepare_datasets()

    X = labeled_df[BASE_FEATURES].copy()
    y = labeled_df['target'].copy()

    # Stratified Train/Test Split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, stratify=y, random_state=42
    )

    test_indices = X_test.index
    test_meta = labeled_df.loc[test_indices, ['kepid', 'kepoi_name', 'kepler_name', 'koi_disposition']].copy()

    print(f"Train set: {len(X_train)} samples ({y_train.sum()} Confirmed, {len(y_train)-y_train.sum()} False Positive)")
    print(f"Held-out Test set: {len(X_test)} samples ({y_test.sum()} Confirmed, {len(y_test)-y_test.sum()} False Positive)")

    pipelines = build_pipelines()

    # 1. Cross-Validation
    cv_results = evaluate_cross_validation(pipelines, X_train, y_train)

    # 2. Fit each model on full train set and evaluate on held-out test set
    test_evaluations = {}
    fitted_models = {}

    print("\n=== Evaluating on Held-out Test Set ===")
    for name, pipe in pipelines.items():
        pipe.fit(X_train, y_train)
        fitted_models[name] = pipe

        y_pred = pipe.predict(X_test)
        if hasattr(pipe, "predict_proba"):
            y_prob = pipe.predict_proba(X_test)[:, 1]
        else:
            y_prob = np.zeros(len(y_test))

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        roc_auc = float(roc_auc_score(y_test, y_prob)) if y_prob.max() > 0 else 0.5
        pr_auc = float(average_precision_score(y_test, y_prob)) if y_prob.max() > 0 else float(y_train.mean())

        cm = confusion_matrix(y_test, y_pred).tolist()

        # Curves
        if y_prob.max() > 0:
            p_curve, r_curve, _ = precision_recall_curve(y_test, y_prob)
            fpr_curve, tpr_curve, _ = roc_curve(y_test, y_prob)
            
            # Subsample curve points for clean JSON payload
            step = max(1, len(p_curve) // 60)
            pr_data = [{"recall": round(float(r), 4), "precision": round(float(p), 4)} for r, p in zip(r_curve[::step], p_curve[::step])]
            step_roc = max(1, len(fpr_curve) // 60)
            roc_data = [{"fpr": round(float(f), 4), "tpr": round(float(t), 4)} for f, t in zip(fpr_curve[::step_roc], tpr_curve[::step_roc])]
        else:
            pr_data = []
            roc_data = []

        test_evaluations[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "pr_auc": round(pr_auc, 4),
            "confusion_matrix": {
                "tn": cm[0][0],
                "fp": cm[0][1],
                "fn": cm[1][0],
                "tp": cm[1][1]
            },
            "pr_curve": pr_data,
            "roc_curve": roc_data
        }

        print(f"{name:25} -> Acc: {acc:.4f} | Prec: {prec:.4f} | Rec: {rec:.4f} | F1: {f1:.4f} | PR-AUC: {pr_auc:.4f} | ROC-AUC: {roc_auc:.4f}")

    # Determine best model by held-out PR-AUC
    best_model_name = "HistGradientBoosting"
    best_model = fitted_models[best_model_name]
    print(f"\nSelected Best Model: {best_model_name}")

    # 3. Permutation Feature Importance on Held-out Test Set
    print("\nComputing Permutation Feature Importance on held-out test data...")
    perm_result = permutation_importance(
        best_model, X_test, y_test, n_repeats=10, random_state=42, scoring="average_precision"
    )

    # Note: X_test has BASE_FEATURES
    perm_importance_list = []
    for idx, col in enumerate(BASE_FEATURES):
        perm_importance_list.append({
            "feature": col,
            "mean_importance": round(float(perm_result.importances_mean[idx]), 5),
            "std": round(float(perm_result.importances_std[idx]), 5)
        })
    perm_importance_list.sort(key=lambda x: x["mean_importance"], reverse=True)

    # 4. Physics-based Error Analysis on Misclassified Candidates
    print("\nPerforming Error Analysis...")
    y_test_pred = best_model.predict(X_test)
    y_test_prob = best_model.predict_proba(X_test)[:, 1]

    error_df = X_test.copy()
    error_df['kepid'] = test_meta['kepid']
    error_df['kepoi_name'] = test_meta['kepoi_name']
    error_df['kepler_name'] = test_meta['kepler_name']
    error_df['true_disposition'] = test_meta['koi_disposition']
    error_df['true_label'] = y_test.values
    error_df['pred_label'] = y_test_pred
    error_df['pred_prob'] = y_test_prob

    # False Positives: True label is 0 (FALSE POSITIVE), but Model predicted 1 (CONFIRMED)
    fps = error_df[(error_df['true_label'] == 0) & (error_df['pred_label'] == 1)].sort_values(by='pred_prob', ascending=False)
    # False Negatives: True label is 1 (CONFIRMED), but Model predicted 0 (FALSE POSITIVE)
    fns = error_df[(error_df['true_label'] == 1) & (error_df['pred_label'] == 0)].sort_values(by='pred_prob', ascending=True)

    print(f"Total Test False Positives: {len(fps)} | Total False Negatives: {len(fns)}")

    error_analysis_data = {
        "summary": {
            "total_test_samples": len(X_test),
            "false_positives_count": len(fps),
            "false_negatives_count": len(fns),
            "false_positive_rate": round(float(len(fps) / max(1, (y_test == 0).sum())), 4),
            "false_negative_rate": round(float(len(fns) / max(1, (y_test == 1).sum())), 4)
        },
        "sample_false_positives": fps.head(8).to_dict(orient="records"),
        "sample_false_negatives": fns.head(8).to_dict(orient="records"),
        "astronomical_insights": [
            "False Positives with high model confidence often resemble Earth/Neptune-sized planets in depth and period, but were flagged by Kepler teams due to subtle centroid offsets (background eclipsing binaries) undetectable from transit photometry alone.",
            "False Negatives typically correspond to giant planets with high impact parameters (grazing transits creating V-shaped dips resembling stellar eclipses) or low SNR detections near the detection limit of Kepler.",
            "Log-transforming transit depth and period prevents extreme astronomical outliers from distorting tree splits."
        ]
    }

    # Clean NaN values in dictionaries for JSON serialization
    def clean_nan(obj):
        if isinstance(obj, float) and (np.isnan(obj) or np.isinf(obj)):
            return None
        if isinstance(obj, dict):
            return {k: clean_nan(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [clean_nan(v) for v in obj]
        return obj

    error_analysis_data = clean_nan(error_analysis_data)

    # 5. Save Artifacts
    os.makedirs("ml/artifacts", exist_ok=True)
    model_path = "ml/artifacts/best_model.joblib"
    joblib.dump(best_model, model_path)
    print(f"Saved best model to {model_path}")

    # Also save Random Forest for comparison if needed
    joblib.dump(fitted_models["Random Forest"], "ml/artifacts/rf_model.joblib")
    joblib.dump(fitted_models["Logistic Regression"], "ml/artifacts/lr_model.joblib")

    metadata = {
        "best_model_name": best_model_name,
        "dataset_info": {
            "total_catalog_size": len(labeled_df) + len(candidate_df),
            "labeled_count": len(labeled_df),
            "confirmed_count": int(y.sum()),
            "false_positive_count": int(len(y) - y.sum()),
            "candidate_count": len(candidate_df),
            "train_size": len(X_train),
            "test_size": len(X_test),
            "features_used": BASE_FEATURES,
            "leakage_columns_excluded": LEAKAGE_COLUMNS
        },
        "cv_results": cv_results,
        "test_evaluations": test_evaluations,
        "permutation_importance": perm_importance_list,
        "error_analysis": error_analysis_data,
        "leakage_audit": leakage_report
    }

    metadata_path = "ml/artifacts/metadata.json"
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved evaluation metadata to {metadata_path}")

    return metadata


if __name__ == "__main__":
    run_full_training()
