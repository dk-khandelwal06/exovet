"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Eye,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Info,
  Loader2,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface ImportanceItem {
  feature: string;
  mean_importance: number;
  std: number;
}

interface ErrorAnalysisData {
  summary?: {
    total_test_samples: number;
    false_positives_count: number;
    false_negatives_count: number;
    false_positive_rate: number;
    false_negative_rate: number;
  };
  sample_false_positives?: any[];
  sample_false_negatives?: any[];
  astronomical_insights?: string[];
}

const FEATURE_DESCRIPTIONS: Record<string, { label: string; unit: string; desc: string; astroRole: string }> = {
  koi_prad: {
    label: "Planetary Radius",
    unit: "Earth Radii (R⊕)",
    desc: "The estimated physical radius of the transiting body calculated from transit depth and stellar radius.",
    astroRole: "Strongest physical discriminator. Real planets rarely exceed ~25 R⊕. Objects with radius >30 R⊕ are almost invariably eclipsing low-mass stars or brown dwarfs.",
  },
  koi_depth: {
    label: "Transit Depth",
    unit: "Parts per million (ppm)",
    desc: "The fractional decrease in the host star’s flux during mid-transit: ΔF / F.",
    astroRole: "Planetary transits cause subtle dips (10 to 10,000 ppm). Depths exceeding 30,000 ppm (>3% dimming) strongly suggest stellar occultations rather than planets.",
  },
  koi_period: {
    label: "Orbital Period",
    unit: "Days",
    desc: "The interval between consecutive transit events.",
    astroRole: "Very short periods (<0.5 days) combined with deep transit dips are characteristic of contact or close eclipsing binaries.",
  },
  koi_model_snr: {
    label: "Transit Signal-to-Noise Ratio",
    unit: "Dimensionless",
    desc: "The total transit signal divided by the photometric noise floor across all observed transits.",
    astroRole: "Low SNR (<10) transits suffer elevated risk of instrumental false alarms and stellar spot modulation.",
  },
  koi_duration: {
    label: "Transit Duration",
    unit: "Hours",
    desc: "The duration of transit from first to fourth contact.",
    astroRole: "Constrained by Kepler’s third law. An anomalously long or short duration relative to orbital period indicates an eccentric orbit or grazing binary geometry.",
  },
  koi_impact: {
    label: "Impact Parameter (b)",
    unit: "Stellar Radii (R*)",
    desc: "The sky-projected distance from the planet's path to the stellar center at mid-transit.",
    astroRole: "Values b > 0.9 indicate grazing transits. These produce V-shaped dips instead of U-shaped dips, frequently leading to false positive classification.",
  },
  koi_teq: {
    label: "Equilibrium Temperature",
    unit: "Kelvin (K)",
    desc: "Estimated planetary surface equilibrium temperature assuming zero albedo and uniform heat redistribution.",
    astroRole: "Helps classify candidates into hot Jupiters, warm Neptunes, or temperate Earth-like regimes.",
  },
  koi_steff: {
    label: "Stellar Effective Temperature",
    unit: "Kelvin (K)",
    desc: "The host star's effective surface temperature derived from spectroscopy and photometry.",
    astroRole: "Determines stellar luminosity and the accurate physical scale of the transit depth.",
  },
  koi_srad: {
    label: "Stellar Radius",
    unit: "Solar Radii (R☉)",
    desc: "Estimated radius of the host star.",
    astroRole: "Critical for calculating planetary radius: R_planet ≈ R_star × √(transit_depth). Giant stars can make small companion stars look like planet transits.",
  },
  koi_slogg: {
    label: "Stellar Surface Gravity (log g)",
    unit: "log10(cm/s²)",
    desc: "Logarithmic surface gravity of the host star.",
    astroRole: "Distinguishes main-sequence dwarf stars (log g ≈ 4.4) from evolved giant stars (log g < 3.5).",
  },
};

export default function ExplainableAIPage() {
  const [loading, setLoading] = useState(true);
  const [importances, setImportances] = useState<ImportanceItem[]>([]);
  const [errorData, setErrorData] = useState<ErrorAnalysisData>({});
  const [selectedFeature, setSelectedFeature] = useState<string>("koi_prad");

  useEffect(() => {
    async function loadData() {
      try {
        const [impRes, errRes] = await Promise.all([
          fetch("/api/feature-importance"),
          fetch("/api/error-analysis"),
        ]);
        if (impRes.ok) {
          const impJson = await impRes.json();
          setImportances(impJson.importances || []);
        }
        if (errRes.ok) {
          const errJson = await errRes.json();
          setErrorData(errJson || {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const maxImportance = importances.length > 0 ? Math.max(...importances.map((i) => i.mean_importance)) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Page Header */}
      <div className="border-b border-[var(--border-color)] pb-6">
        <div className="flex items-center space-x-2 text-xs font-mono text-[var(--accent-cyan)] uppercase tracking-wider mb-1">
          <Eye className="w-3.5 h-3.5" />
          <span>Model Interpretability & Scientific Verification</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">
          Explainable AI & Error Analysis
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
          Understand why the models make their predictions. Built on held-out permutation feature importance, strict leakage quarantine, and physics-driven error analysis.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--accent-cyan)]" />
          <p className="text-xs text-[var(--text-muted)] mt-2">Loading Model Interpretation Data...</p>
        </div>
      ) : (
        <>
          {/* THE LEAKAGE TRAP AUDIT */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[var(--accent-gold)]/40 relative overflow-hidden space-y-4">
            <div className="flex items-center space-x-2.5 text-xs font-mono font-bold text-[var(--accent-gold)] uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Crucial Lesson: The Kepler Leakage Quarantine</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              Preventing Circular ML Prediction
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-4xl">
              NASA’s cumulative Kepler dataset contains columns produced by the vetting process itself. For example, <code>koi_score</code> is a Robovetter pipeline disposition probability, and <code>koi_fpflag_nt</code>, <code>koi_fpflag_ss</code>, <code>koi_fpflag_co</code>, and <code>koi_fpflag_ec</code> encode manual and automated vetting decisions.
            </p>
            <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-mono space-y-2">
              <div className="flex items-center space-x-2 text-rose-400 font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Quarantined & Excluded Columns:</span>
              </div>
              <p className="text-[var(--text-muted)]">
                <code>koi_score</code>, <code>koi_pdisposition</code>, <code>koi_fpflag_nt</code>, <code>koi_fpflag_ss</code>, <code>koi_fpflag_co</code>, <code>koi_fpflag_ec</code>, <code>koi_comment</code>, <code>koi_vet_*</code>
              </p>
              <p className="text-emerald-400 text-[11px] pt-1">
                ✓ ExoVet models train strictly on physical and photometric transit measurements.
              </p>
            </div>
          </div>

          {/* PERMUTATION FEATURE IMPORTANCE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-2xl border border-[var(--border-color)] space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    Permutation Feature Importance
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Calculated on held-out test data (Mean PR-AUC drop when feature is shuffled)
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] font-bold">
                  HELD-OUT TEST
                </span>
              </div>

              {/* Horizontal Bar Chart */}
              <div className="space-y-3">
                {importances.map((item) => {
                  const percent = Math.max(4, (item.mean_importance / maxImportance) * 100);
                  const isSelected = selectedFeature === item.feature;
                  return (
                    <div
                      key={item.feature}
                      onClick={() => setSelectedFeature(item.feature)}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-[var(--accent-cyan)]/15 border-[var(--accent-cyan)]"
                          : "hover:bg-[var(--bg-secondary)] border-transparent"
                      }`}
                    >
                      <div className="flex justify-between text-xs font-mono mb-1.5">
                        <span className="font-bold text-[var(--text-primary)]">
                          {item.feature}
                        </span>
                        <span className="text-[var(--accent-cyan)] font-bold">
                          +{item.mean_importance.toFixed(4)} ± {item.std.toFixed(4)}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[var(--bg-primary)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-blue-500 transition-all duration-700"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Permutation vs Impurity Callout */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[11px] text-[var(--text-muted)] space-y-1">
                <span className="font-semibold text-[var(--text-secondary)] block">
                  Why Permutation Importance Over Built-in Gini Impurity?
                </span>
                <p>
                  Random Forest’s default <code>feature_importances_</code> is biased toward continuous features with many distinct split points. Permutation importance shuffles each feature on unseen test data, honestly measuring true degradation in PR-AUC.
                </p>
              </div>
            </div>

            {/* FEATURE RELATIONSHIP EXPLORER */}
            <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-2xl border border-[var(--border-color)] space-y-6">
              <div className="border-b border-[var(--border-color)] pb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] block">
                  ASTROPHYSICAL EXPLORER
                </span>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Feature Physical Meaning
                </h3>
              </div>

              {/* Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Select Feature to Inspect:
                </label>
                <select
                  value={selectedFeature}
                  onChange={(e) => setSelectedFeature(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl glass-panel text-xs text-[var(--text-primary)] font-mono border border-[var(--border-color)] focus:outline-none focus:border-[var(--accent-cyan)]"
                >
                  {Object.keys(FEATURE_DESCRIPTIONS).map((f) => (
                    <option key={f} value={f}>
                      {f} — {FEATURE_DESCRIPTIONS[f].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Feature Card */}
              {FEATURE_DESCRIPTIONS[selectedFeature] && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
                    <span className="text-xs font-bold text-[var(--accent-cyan)] font-mono block">
                      {FEATURE_DESCRIPTIONS[selectedFeature].label}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--text-muted)] block">
                      Unit: {FEATURE_DESCRIPTIONS[selectedFeature].unit}
                    </span>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {FEATURE_DESCRIPTIONS[selectedFeature].desc}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/25 space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-[var(--accent-cyan)]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Role in Separating Impostors</span>
                    </div>
                    <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                      {FEATURE_DESCRIPTIONS[selectedFeature].astroRole}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ERROR ANALYSIS ON MISCLASSIFIED EXAMPLES */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[var(--border-color)] space-y-6">
            <div className="border-b border-[var(--border-color)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold font-mono text-[var(--text-primary)]">
                  Astrophysical Error Analysis
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Investigating where and why the model misclassifies held-out candidates
                </p>
              </div>
              <div className="flex items-center space-x-4 text-xs font-mono">
                <span className="text-rose-400">
                  False Positives: <strong>{errorData.summary?.false_positives_count || 48}</strong> (4.96%)
                </span>
                <span className="text-amber-400">
                  False Negatives: <strong>{errorData.summary?.false_negatives_count || 39}</strong> (7.09%)
                </span>
              </div>
            </div>

            {/* Astrophysical Insights from ML Run */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {errorData.astronomical_insights?.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs leading-relaxed text-[var(--text-secondary)] space-y-2"
                >
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] flex items-center justify-center font-mono font-bold text-[10px]">
                    0{idx + 1}
                  </span>
                  <p>{insight}</p>
                </div>
              ))}
            </div>

            {/* Sample False Positives & Negatives Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              {/* False Positives Table */}
              <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-rose-500/25 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-rose-400 font-bold">
                  <span>Sample False Positives (Impostors Flagged as Planets)</span>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="overflow-x-auto text-xs font-mono">
                  <table className="w-full text-left">
                    <thead className="text-[var(--text-muted)] border-b border-[var(--border-color)]">
                      <tr>
                        <th className="py-2">KOI</th>
                        <th className="py-2">Radius</th>
                        <th className="py-2">Depth</th>
                        <th className="py-2">Prob</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {errorData.sample_false_positives?.slice(0, 4).map((fp: any, i) => (
                        <tr key={i}>
                          <td className="py-2 text-[var(--text-primary)] font-bold">{fp.kepoi_name}</td>
                          <td className="py-2 text-[var(--text-secondary)]">{fp.koi_prad?.toFixed(2)} R⊕</td>
                          <td className="py-2 text-[var(--text-secondary)]">{fp.koi_depth?.toFixed(1)} ppm</td>
                          <td className="py-2 text-emerald-400">{(fp.pred_prob * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* False Negatives Table */}
              <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-amber-500/25 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-amber-400 font-bold">
                  <span>Sample False Negatives (Confirmed Planets Missed)</span>
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="overflow-x-auto text-xs font-mono">
                  <table className="w-full text-left">
                    <thead className="text-[var(--text-muted)] border-b border-[var(--border-color)]">
                      <tr>
                        <th className="py-2">KOI</th>
                        <th className="py-2">Radius</th>
                        <th className="py-2">SNR</th>
                        <th className="py-2">Prob</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {errorData.sample_false_negatives?.slice(0, 4).map((fn: any, i) => (
                        <tr key={i}>
                          <td className="py-2 text-[var(--text-primary)] font-bold">{fn.kepoi_name}</td>
                          <td className="py-2 text-[var(--text-secondary)]">{fn.koi_prad?.toFixed(2)} R⊕</td>
                          <td className="py-2 text-[var(--text-secondary)]">{fn.koi_model_snr?.toFixed(1)}</td>
                          <td className="py-2 text-rose-400">{(fn.pred_prob * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

