"""
ExoVet Feature Engineering & Transformation Pipeline
Transforms raw physical observations into non-linear, scaled, and physically meaningful features.
"""

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin

BASE_FEATURES = [
    'koi_period',
    'koi_duration',
    'koi_depth',
    'koi_prad',
    'koi_model_snr',
    'koi_impact',
    'koi_teq',
    'koi_insol',
    'koi_steff',
    'koi_slogg',
    'koi_srad',
    'koi_kepmag'
]

FEATURE_NAMES = BASE_FEATURES + [
    'log_koi_depth',
    'log_koi_period',
    'log_koi_prad',
    'depth_to_snr',
    'transit_duty_cycle',
    'prad_srad_ratio'
]


class AstronomicalFeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Scikit-learn compliant feature engineering transformer for Kepler transit data.
    Adds astrophysically motivated log-transforms and dimension-less ratios.
    """
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        # Handle both DataFrame and numpy array
        if isinstance(X, pd.DataFrame):
            df = X[BASE_FEATURES].copy()
        else:
            df = pd.DataFrame(X, columns=BASE_FEATURES)

        # Log-transform heavy-tailed features
        # Depths span 0.1 to 1,500,000 ppm
        log_depth = np.log10(np.clip(df['koi_depth'].values, 0.1, None))
        # Periods span 0.2 to 1000 days
        log_period = np.log10(np.clip(df['koi_period'].values, 0.01, None))
        # Planet radii span 0.1 to 200,000 Earth radii (large values are often false positive stars)
        log_prad = np.log10(np.clip(df['koi_prad'].values, 0.01, None))

        # Depth-to-SNR ratio (gauges photometric consistency)
        depth_to_snr = df['koi_depth'].values / (df['koi_model_snr'].values + 1e-4)
        
        # Duty cycle: fraction of orbit spent in transit
        duty_cycle = df['koi_duration'].values / (24.0 * df['koi_period'].values + 1e-4)

        # Ratio of planet radius to stellar radius (1 Solar radius ~ 109.2 Earth radii)
        prad_srad_ratio = df['koi_prad'].values / (109.2 * df['koi_srad'].values + 1e-4)

        engineered = np.column_stack([
            df.values,
            log_depth,
            log_period,
            log_prad,
            depth_to_snr,
            duty_cycle,
            prad_srad_ratio
        ])

        return engineered

    def get_feature_names_out(self, input_features=None):
        return np.array(FEATURE_NAMES)
