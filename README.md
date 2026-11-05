# ExoVet 🪐🔭

> **Teaching a model to tell real planets from impostors in NASA's Kepler data.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://react.js.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.5+-F7931E?logo=scikitlearn)](https://scikit-learn.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r160-black?logo=threedotjs)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 1. Scientific Overview & Problem Statement

NASA's **Kepler Space Telescope** monitored ~150,000 stars over four continuous years, measuring minuscule periodic dips in stellar brightness caused by celestial bodies passing in front of host stars—the **transit method**. 

However, over **50% of detected signals are astronomical impostors**:
- **Eclipsing binary stars** (a companion star eclipsing the primary star).
- **Background blended stars** (unresolved background binaries diluting light within the same Kepler pixel).
- **Stellar activity and instrument noise** (starspots, reaction wheel jitter, cosmic rays).

Each candidate must undergo rigorous "vetting" before being counted as a planet. Manual review does not scale to future surveys (such as TESS, PLATO, and Roman), and deep learning on raw light curves (e.g. *Shallue & Vanderburg 2018*) requires heavy compute and is difficult to interpret.

**ExoVet** solves this challenge on tabular catalog measurements using disciplined, non-linear tree ensembles and explainable machine learning.

---

## 2. The Leakage Quarantine

The single most critical lesson in this project is **leakage prevention**. The cumulative Kepler Objects of Interest (KOI) catalog includes columns generated *by the vetting process itself*:

| Column Name | Reason Quarantined & Dropped |
| :--- | :--- |
| `koi_score` | A disposition probability (0.0 to 1.0) produced by NASA's automated **Robovetter** pipeline. Using it creates circular prediction. |
| `koi_pdisposition` | The pipeline's automated classification label. |
| `koi_fpflag_nt` | Flag for non-transit-like event (human/pipeline vetted). |
| `koi_fpflag_ss` | Flag for stellar / secondary eclipse (human/pipeline vetted). |
| `koi_fpflag_co` | Flag for centroid offset (identifies background star blends). |
| `koi_fpflag_ec` | Flag for ephemeris contamination. |
| `koi_comment`, `koi_vet_*` | Post-vetting provenance and review timestamps. |

> **ExoVet strictly excludes all leakage columns.** Models learn purely from physical and transit measurements: orbital period, transit depth, transit duration, planet radius, signal-to-noise ratio, impact parameter, stellar temperature, surface gravity, stellar radius, and engineered log transforms.

---

## 3. Real Machine Learning Benchmarks

Trained on **7,587 labeled Kepler objects** (4,839 False Positives, 2,748 Confirmed Planets) using a stratified 80/20 train/test split (1,518 held-out test candidates):

| Model | PR-AUC (Primary) | ROC-AUC | Accuracy | Precision | Recall | F1-Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Majority Baseline** | 0.3622 | 0.5000 | 63.77% | 0.0000 | 0.0000 | 0.0000 |
| **Logistic Regression** (Scaled) | 0.8598 | 0.9307 | 86.17% | 0.7805 | 0.8600 | 0.8183 |
| **Random Forest** (150 trees) | 0.9580 | 0.9779 | 93.28% | 0.9043 | 0.9109 | 0.9076 |
| **HistGradientBoosting** ★ | **0.9705** | **0.9837** | **94.27%** | **0.9141** | **0.9291** | **0.9216** |

### 5-Fold Stratified Cross-Validation
- **HistGradientBoosting:** PR-AUC $0.9576 \pm 0.0086$ • ROC-AUC $0.9777 \pm 0.0051$ • F1 $0.9045 \pm 0.0102$
- **Random Forest:** PR-AUC $0.9458 \pm 0.0082$ • ROC-AUC $0.9717 \pm 0.0062$ • F1 $0.8907 \pm 0.0125$

---

## 4. Key Platform Features

1. **Animated 3D Solar System Canvas:** Real-time Three.js scene featuring the Sun, 8 planets (Mercury, Venus, Earth with atmospheric layer, Mars, Jupiter with atmospheric cloud bands, Saturn with geometry rings, Uranus, Neptune), revolving orbits, and starry twinkling.
2. **Three Comprehensive Themes:**
   - **Light Mode:** High-contrast ivory & slate observatory design.
   - **Twilight Mode:** Dusk blue-grey slate observatory atmosphere.
   - **Dark Mode:** Deep midnight space with electric cyan and starlight accents.
3. **6 Complete Application Sections:**
   - **Home:** Interactive hero, Kepler statistics, 4-step ML process, multimedia video loops.
   - **Explore Candidates:** Filterable and sortable catalog table of all 9,564 KOIs with details modal.
   - **Planet Detector:** Radial probability gauge, decision threshold tuning, and local feature influence analysis.
   - **Model Lab:** 4-model comparison, confusion matrix heatmap, interactive PR & ROC curves, and cross-validation tables.
   - **Explainable AI:** Held-out permutation feature importance, leakage audit documentation, and false positive / false negative error analysis.
   - **About Science:** Interactive transit physics simulator with real-time synchronized photometric light curve dip ($\Delta F / F \approx (R_p / R_*)^2$).

---

## 5. Technology Stack & Project Structure

```
exovet/
├── app/                      # Next.js App Router pages
│   ├── page.tsx              # Home / Hero
│   ├── explore/page.tsx      # Candidate Explorer (9,564 KOIs)
│   ├── detector/page.tsx     # Planet Detector & Probability Gauge
│   ├── model-lab/page.tsx    # Model Benchmark Lab
│   ├── explainable-ai/page.tsx # Explainable AI & Error Analysis
│   ├── science/page.tsx      # Transit Physics Simulator
│   ├── globals.css           # 3 Visual themes (Light, Twilight, Dark)
│   └── layout.tsx            # Root layout with 3D Canvas & Nav
├── components/
│   ├── 3d/                   # Three.js / React Three Fiber Solar System
│   ├── navigation/           # Navbar & Footer
│   └── theme/                # ThemeProvider & context
├── api/
│   └── index.py              # FastAPI backend endpoints
├── ml/
│   ├── data.py               # Leakage audit & data preparation
│   ├── features.py           # Astrophysical feature engineering
│   ├── train.py              # Model training & CV benchmark
│   ├── predict.py            # Serialized inference engine
│   └── artifacts/            # best_model.joblib & metadata.json
├── data/
│   ├── raw/                  # kepler_cumulative.csv (9,564 rows)
│   └── processed/            # Cleaned subsets
├── public/
│   └── assets/               # Integrated videos, imagery & logos
├── tests/                    # pytest suite (17 passed)
├── requirements.txt          # Python dependencies
├── package.json              # Node.js dependencies
└── vercel.json               # Vercel deployment configuration
```

---

## 6. Local Development Quickstart

### Prerequisites
- Python 3.12+ (tested with Python 3.13)
- Node.js 18+ (tested with Node.js 26)

### Installation
```bash
# 1. Install Node dependencies
npm install --legacy-peer-deps

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Retrain model (optional, pre-trained artifacts included)
npm run train
```

### Running the Application
```bash
# Run both Next.js frontend and FastAPI backend concurrently:
npm run dev

# Or run them in separate terminals:
# Terminal 1: Python API
npm run dev:api

# Terminal 2: Next.js Frontend
npm run dev:next
```

- **Frontend Application:** [http://localhost:3000](http://localhost:3000)
- **FastAPI Health Endpoint:** [http://localhost:8000/api/health](http://localhost:8000/api/health)
- **API Documentation (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 7. Running Tests

```bash
# Run backend, ML and leakage unit tests:
python -m pytest tests/
```
All 17 tests covering data leakage quarantine, model serialization, probability inference, and API endpoints pass cleanly.

---

## 8. Deployment to GitHub and Vercel

### GitHub
```bash
git add .
git commit -m "feat: complete ExoVet astronomy ML platform"
git branch -M main
git remote add origin https://github.com/<your-username>/exovet.git
git push -u origin main
```

### Vercel Deployment
1. Import repository in [Vercel Dashboard](https://vercel.com/new).
2. Framework Preset: **Next.js**.
3. Deploy automatically using included `vercel.json` routing.
4. The serverless Python runtime handles `/api/index.py` with pre-compiled Joblib artifacts.

---

## 9. Scientific Citations & Acknowledgements

- **NASA Exoplanet Archive**: Operated by the California Institute of Technology under contract with NASA.
- **Kepler Science Team**: For the Kepler Robovetter DR25 cumulative data release.
- **Shallue & Vanderburg (2018)**: *Identifying Exoplanets with Deep Learning in Kepler Data*, The Astronomical Journal, 155:94.

*Disclaimer: ExoVet predictions represent statistical machine-learning estimates based on photometric catalog measurements. They do not constitute formal astronomical validation or discovery confirmation.*
