"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Radar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sliders,
  RotateCcw,
  Search,
  Info,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Cpu,
  Loader2,
} from "lucide-react";

interface PredictionResult {
  predicted_disposition: string;
  status: string;
  confirmed_probability: number;
  false_positive_probability: number;
  threshold: number;
  model_name: string;
  key_influences: Array<{
    feature: string;
    value: number;
    effect: string;
    reason: string;
  }>;
  uncertainty_statement: string;
  koi_id?: string;
  input_features?: Record<string, number | null>;
}

// Default benchmark candidates for one-click testing
const PRESETS = [
  {
    name: "Kepler-227 b (K00752.01) — Confirmed Planet",
    koi: "K00752.01",
    params: {
      koi_period: 9.488,
      koi_duration: 2.958,
      koi_depth: 615.8,
      koi_prad: 2.26,
      koi_model_snr: 35.8,
      koi_impact: 0.146,
      koi_teq: 793.0,
      koi_insol: 93.59,
      koi_steff: 5455.0,
      koi_slogg: 4.467,
      koi_srad: 0.927,
      koi_kepmag: 15.347,
    },
  },
  {
    name: "Eclipsing Binary Impostor (K00754.01) — False Positive",
    koi: "K00754.01",
    params: {
      koi_period: 1.732,
      koi_duration: 2.406,
      koi_depth: 8079.2,
      koi_prad: 33.46,
      koi_model_snr: 505.6,
      koi_impact: 1.276,
      koi_teq: 1395.0,
      koi_insol: 891.0,
      koi_steff: 5805.0,
      koi_slogg: 4.564,
      koi_srad: 0.791,
      koi_kepmag: 15.597,
    },
  },
  {
    name: "Unvetted Candidate (K00757.01) — High SNR",
    koi: "K00757.01",
    params: {
      koi_period: 2.525,
      koi_duration: 1.654,
      koi_depth: 603.3,
      koi_prad: 2.75,
      koi_model_snr: 40.9,
      koi_impact: 0.701,
      koi_teq: 1406.0,
      koi_insol: 925.0,
      koi_steff: 5779.0,
      koi_slogg: 4.449,
      koi_srad: 1.016,
      koi_kepmag: 15.528,
    },
  },
];

function DetectorContent() {
  const searchParams = useSearchParams();
  const urlKoi = searchParams.get("koi");

  const [activeTab, setActiveTab] = useState<"catalog" | "manual">("catalog");
  const [koiSearch, setKoiSearch] = useState(urlKoi || "K00752.01");
  const [threshold, setThreshold] = useState(0.5);

  // Form state
  const [form, setForm] = useState({
    koi_period: 9.488,
    koi_duration: 2.958,
    koi_depth: 615.8,
    koi_prad: 2.26,
    koi_model_snr: 35.8,
    koi_impact: 0.146,
    koi_teq: 793.0,
    koi_insol: 93.59,
    koi_steff: 5455.0,
    koi_slogg: 4.467,
    koi_srad: 0.927,
    koi_kepmag: 15.347,
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load candidate if provided in URL or search
  const loadCandidateFromCatalog = async (koiId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/candidates/${encodeURIComponent(koiId)}`);
      if (!res.ok) throw new Error(`Candidate "${koiId}" not found in catalog.`);
      const data = await res.json();
      setForm({
        koi_period: data.koi_period ?? 10.0,
        koi_duration: data.koi_duration ?? 3.0,
        koi_depth: data.koi_depth ?? 500.0,
        koi_prad: data.koi_prad ?? 2.0,
        koi_model_snr: data.koi_model_snr ?? 30.0,
        koi_impact: data.koi_impact ?? 0.2,
        koi_teq: data.koi_teq ?? 800.0,
        koi_insol: data.koi_insol ?? 100.0,
        koi_steff: data.koi_steff ?? 5500.0,
        koi_slogg: data.koi_slogg ?? 4.4,
        koi_srad: data.koi_srad ?? 1.0,
        koi_kepmag: data.koi_kepmag ?? 15.0,
      });
      // Automatically run prediction
      await runPrediction(koiId, {
        koi_period: data.koi_period,
        koi_duration: data.koi_duration,
        koi_depth: data.koi_depth,
        koi_prad: data.koi_prad,
        koi_model_snr: data.koi_model_snr,
        koi_impact: data.koi_impact,
        koi_teq: data.koi_teq,
        koi_insol: data.koi_insol,
        koi_steff: data.koi_steff,
        koi_slogg: data.koi_slogg,
        koi_srad: data.koi_srad,
        koi_kepmag: data.koi_kepmag,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load candidate.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlKoi) {
      setKoiSearch(urlKoi);
      loadCandidateFromCatalog(urlKoi);
    } else {
      // Default initial prediction on Kepler-227 b
      runPrediction("K00752.01", form);
    }
  }, [urlKoi]);

  const runPrediction = async (koiIdOrName?: string, currentForm = form) => {
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        ...currentForm,
        threshold: threshold,
      };
      if (koiIdOrName) payload.koi_id = koiIdOrName;

      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Prediction request failed.");
      }

      const result: PredictionResult = await res.json();
      setPrediction(result);
    } catch (err: any) {
      setError(err.message || "Failed to compute prediction.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, val: number) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const probPercent = prediction
    ? (prediction.confirmed_probability * 100).toFixed(1)
    : "—";

  const isConfirmed = prediction?.predicted_disposition === "CONFIRMED";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="border-b border-[var(--border-color)] pb-6">
        <div className="flex items-center space-x-2 text-xs font-mono text-[var(--accent-cyan)] uppercase tracking-wider mb-1">
          <Radar className="w-3.5 h-3.5" />
          <span>Real-Time Inference Engine • Gradient Boosted Trees</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">
          Planet Detector
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
          Evaluate Kepler transit measurements against our trained model. View the confirmed exoplanet probability, decision threshold, and astrophysical feature explanations.
        </p>
      </div>

      {/* Main Grid: Controls Left / Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Input Configuration */}
        <div className="lg:col-span-6 space-y-6">
          {/* Preset Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
              Quick Test Presets
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.koi}
                  onClick={() => {
                    setKoiSearch(p.koi);
                    setForm(p.params);
                    runPrediction(p.koi, p.params);
                  }}
                  className="p-2.5 text-left rounded-xl glass-panel text-xs hover:border-[var(--accent-cyan)] transition-colors group"
                >
                  <p className="font-mono font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)]">
                    {p.koi}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] truncate">{p.name.split("—")[1]}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Selector */}
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("catalog")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === "catalog"
                      ? "bg-[var(--accent-cyan)] text-space-950 font-bold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Select from Catalog
                </button>
                <button
                  onClick={() => setActiveTab("manual")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === "manual"
                      ? "bg-[var(--accent-cyan)] text-space-950 font-bold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Manual Input / Sliders
                </button>
              </div>

              {/* Threshold control */}
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="text-[var(--text-muted)]">Threshold:</span>
                <span className="text-[var(--accent-gold)] font-bold">{threshold.toFixed(2)}</span>
              </div>
            </div>

            {/* Threshold Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-[var(--text-muted)] font-mono">
                <span>Conservative (0.80)</span>
                <span>Balanced (0.50)</span>
                <span>Permissive (0.20)</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={threshold}
                onChange={(e) => {
                  const newT = parseFloat(e.target.value);
                  setThreshold(newT);
                  if (prediction) runPrediction(prediction.koi_id, form);
                }}
                className="w-full accent-[var(--accent-gold)] cursor-pointer"
              />
            </div>

            {activeTab === "catalog" && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-[var(--text-primary)] block">
                  Search KOI Candidate:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={koiSearch}
                    onChange={(e) => setKoiSearch(e.target.value)}
                    placeholder="Enter KOI ID (e.g. K00752.01)..."
                    className="flex-grow px-3.5 py-2.5 rounded-xl glass-panel text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent-cyan)]"
                  />
                  <button
                    onClick={() => loadCandidateFromCatalog(koiSearch)}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl bg-[var(--accent-cyan)] text-space-950 font-semibold text-xs hover:brightness-110 flex items-center space-x-1"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Load & Vet</span>
                  </button>
                </div>
              </div>
            )}

            {/* Physical Parameter Sliders */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                Photometric Transit Measurements
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                {/* Period */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Period (days)</span>
                    <span className="text-[var(--accent-cyan)] font-bold">{form.koi_period}</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={form.koi_period}
                    onChange={(e) => handleInputChange("koi_period", parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-panel text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Duration (hrs)</span>
                    <span className="text-[var(--accent-cyan)] font-bold">{form.koi_duration}</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={form.koi_duration}
                    onChange={(e) => handleInputChange("koi_duration", parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-panel text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                {/* Depth */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Depth (ppm)</span>
                    <span className="text-[var(--accent-cyan)] font-bold">{form.koi_depth}</span>
                  </div>
                  <input
                    type="number"
                    step="10"
                    value={form.koi_depth}
                    onChange={(e) => handleInputChange("koi_depth", parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-panel text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                {/* Radius */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Radius (R⊕)</span>
                    <span className="text-[var(--accent-cyan)] font-bold">{form.koi_prad}</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={form.koi_prad}
                    onChange={(e) => handleInputChange("koi_prad", parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-panel text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                {/* Model SNR */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Model SNR</span>
                    <span className="text-[var(--accent-cyan)] font-bold">{form.koi_model_snr}</span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    value={form.koi_model_snr}
                    onChange={(e) => handleInputChange("koi_model_snr", parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-panel text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                {/* Impact */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Impact Parameter</span>
                    <span className="text-[var(--accent-cyan)] font-bold">{form.koi_impact}</span>
                  </div>
                  <input
                    type="number"
                    step="0.05"
                    value={form.koi_impact}
                    onChange={(e) => handleInputChange("koi_impact", parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-panel text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                {/* Stellar Temp */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Stellar Temp (K)</span>
                    <span className="text-[var(--accent-cyan)] font-bold">{form.koi_steff}</span>
                  </div>
                  <input
                    type="number"
                    step="50"
                    value={form.koi_steff}
                    onChange={(e) => handleInputChange("koi_steff", parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-panel text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                {/* Stellar Radius */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Stellar Radius (R☉)</span>
                    <span className="text-[var(--accent-cyan)] font-bold">{form.koi_srad}</span>
                  </div>
                  <input
                    type="number"
                    step="0.05"
                    value={form.koi_srad}
                    onChange={(e) => handleInputChange("koi_srad", parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg glass-panel text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={() => runPrediction(koiSearch, form)}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[var(--accent-cyan)] text-space-950 font-bold text-sm hover:brightness-110 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating Candidate...</span>
                  </>
                ) : (
                  <>
                    <Radar className="w-4 h-4" />
                    <span>Run Vetting Prediction</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real Inference Results & Probability Gauge */}
        <div className="lg:col-span-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {prediction && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[var(--border-color)] space-y-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] block">
                    MODEL ASSESSMENT
                  </span>
                  <h3 className="text-xl font-bold font-mono text-[var(--text-primary)]">
                    {prediction.koi_id || "Custom Observation"}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] block">
                    ARCHITECTURE
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--accent-cyan)]">
                    {prediction.model_name}
                  </span>
                </div>
              </div>

              {/* Circular Probability Gauge */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  {/* Background Track */}
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className="stroke-[var(--border-color)] fill-none"
                      strokeWidth="8"
                    />
                    {/* Active Probability Arc */}
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className={`fill-none transition-all duration-1000 ${
                        isConfirmed ? "stroke-emerald-400" : "stroke-rose-400"
                      }`}
                      strokeWidth="8"
                      strokeDasharray="264"
                      strokeDashoffset={264 - (264 * prediction.confirmed_probability)}
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Centered Probability Text */}
                  <div className="absolute flex flex-col items-center text-center">
                    <span className="text-3xl font-extrabold font-mono text-[var(--text-primary)] tracking-tight">
                      {probPercent}%
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
                      Planet Prob.
                    </span>
                  </div>
                </div>

                {/* Classification Banner */}
                <div
                  className={`mt-4 px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center space-x-2 border shadow-lg ${
                    isConfirmed
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10"
                      : "bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-rose-500/10"
                  }`}
                >
                  {isConfirmed ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  <span>{prediction.status}</span>
                </div>
              </div>

              {/* Prediction Explanation Cards */}
              <div className="space-y-3 pt-2 border-t border-[var(--border-color)]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  Local Astrophysical Influences
                </h4>

                {prediction.key_influences.length === 0 ? (
                  <p className="text-xs text-[var(--text-secondary)]">
                    Measurements reside near typical Kepler candidate medians without extreme anomalies.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {prediction.key_influences.map((inf, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[var(--accent-cyan)]">
                            {inf.feature} ({inf.value})
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                              inf.effect.includes("Planet")
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            {inf.effect}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {inf.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Uncertainty Statement */}
              <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]/50 text-[11px] text-[var(--text-muted)] leading-relaxed space-y-1">
                <div className="flex items-center space-x-1.5 font-semibold text-[var(--text-secondary)]">
                  <Info className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                  <span>Scientific Uncertainty Statement</span>
                </div>
                <p>{prediction.uncertainty_statement}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DetectorPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--accent-cyan)]" />
          <p className="text-xs text-[var(--text-muted)] mt-2">Initializing Planet Detector...</p>
        </div>
      }
    >
      <DetectorContent />
    </Suspense>
  );
}

