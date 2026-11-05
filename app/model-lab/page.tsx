"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  GitCompare,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  pr_auc: number;
  confusion_matrix: {
    tn: number;
    fp: number;
    fn: number;
    tp: number;
  };
  pr_curve: Array<{ recall: number; precision: number }>;
  roc_curve: Array<{ fpr: number; tpr: number }>;
}

interface CVFoldScores {
  mean: number;
  std: number;
  folds: number[];
}

export default function ModelLabPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    cv_results?: Record<string, Record<string, CVFoldScores>>;
    test_evaluations?: Record<string, ModelMetrics>;
  }>({});
  const [selectedModel, setSelectedModel] = useState<string>("HistGradientBoosting");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/model-comparison");
        if (!res.ok) throw new Error("Failed to load model comparison");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const modelsList = data.test_evaluations ? Object.keys(data.test_evaluations) : [];
  const activeMetrics = data.test_evaluations?.[selectedModel];
  const activeCV = data.cv_results?.[selectedModel];

  // Combined PR Curve dataset for side-by-side comparison
  const hgbPr = data.test_evaluations?.["HistGradientBoosting"]?.pr_curve || [];
  const rfPr = data.test_evaluations?.["Random Forest"]?.pr_curve || [];
  const lrPr = data.test_evaluations?.["Logistic Regression"]?.pr_curve || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="border-b border-[var(--border-color)] pb-6">
        <div className="flex items-center space-x-2 text-xs font-mono text-[var(--accent-cyan)] uppercase tracking-wider mb-1">
          <Cpu className="w-3.5 h-3.5" />
          <span>Scientific Model Laboratory • 4-Model Comparison</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">
          Model Benchmark & Laboratory
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
          Compare the progression from linear baselines to non-linear bagging and gradient boosting. Evaluated honestly on held-out test data and 5-fold stratified cross-validation.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--accent-cyan)]" />
          <p className="text-xs text-[var(--text-muted)] mt-2">Loading Model Benchmark Data...</p>
        </div>
      ) : (
        <>
          {/* Model Selection Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {modelsList.map((m) => {
              const isSelected = selectedModel === m;
              const ev = data.test_evaluations?.[m];
              return (
                <button
                  key={m}
                  onClick={() => setSelectedModel(m)}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    isSelected
                      ? "glass-panel border-[var(--accent-cyan)] shadow-[0_0_16px_rgba(0,229,255,0.25)] bg-[var(--accent-cyan)]/10"
                      : "glass-panel border-[var(--border-color)] hover:border-[var(--border-color-hover)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                      {m === "HistGradientBoosting" ? "SELECTED BEST" : "CANDIDATE"}
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />}
                  </div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">{m}</h4>
                  <div className="mt-2 text-xs font-mono flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">PR-AUC:</span>
                    <span className="text-[var(--accent-cyan)] font-extrabold">
                      {ev?.pr_auc.toFixed(4) || "—"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Model Deep Dive Metrics */}
          {activeMetrics && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[var(--border-color)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-4">
                <div>
                  <h3 className="text-xl font-bold font-mono text-[var(--text-primary)]">
                    {selectedModel} Evaluation Results
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Evaluated on 1,518 held-out test candidates (550 Confirmed, 968 False Positive)
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs font-mono text-[var(--accent-cyan)]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Leakage Quarantined</span>
                </div>
              </div>

              {/* 6 Metric KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] block">PR-AUC (Primary)</span>
                  <span className="text-xl font-mono font-extrabold text-[var(--accent-cyan)]">
                    {activeMetrics.pr_auc.toFixed(4)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] block">ROC-AUC</span>
                  <span className="text-xl font-mono font-extrabold text-blue-400">
                    {activeMetrics.roc_auc.toFixed(4)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] block">F1-Score</span>
                  <span className="text-xl font-mono font-extrabold text-purple-400">
                    {activeMetrics.f1.toFixed(4)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] block">Precision</span>
                  <span className="text-xl font-mono font-extrabold text-emerald-400">
                    {activeMetrics.precision.toFixed(4)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] block">Recall</span>
                  <span className="text-xl font-mono font-extrabold text-amber-400">
                    {activeMetrics.recall.toFixed(4)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] block">Accuracy</span>
                  <span className="text-xl font-mono font-extrabold text-[var(--text-primary)]">
                    {activeMetrics.accuracy.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Confusion Matrix Heatmap */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-4">
                <div className="md:col-span-5 space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                    Confusion Matrix (Held-out Test)
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-center font-mono">
                    {/* True Negative */}
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-300 block">True Negative (TN)</span>
                      <span className="text-2xl font-bold text-emerald-400">
                        {activeMetrics.confusion_matrix.tn}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] block mt-1">Correct Impostors</span>
                    </div>

                    {/* False Positive */}
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
                      <span className="text-[10px] text-rose-300 block">False Positive (FP)</span>
                      <span className="text-2xl font-bold text-rose-400">
                        {activeMetrics.confusion_matrix.fp}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] block mt-1">Wasted Follow-up</span>
                    </div>

                    {/* False Negative */}
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <span className="text-[10px] text-amber-300 block">False Negative (FN)</span>
                      <span className="text-2xl font-bold text-amber-400">
                        {activeMetrics.confusion_matrix.fn}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] block mt-1">Lost Planets</span>
                    </div>

                    {/* True Positive */}
                    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                      <span className="text-[10px] text-cyan-300 block">True Positive (TP)</span>
                      <span className="text-2xl font-bold text-[var(--accent-cyan)]">
                        {activeMetrics.confusion_matrix.tp}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] block mt-1">Validated Planets</span>
                    </div>
                  </div>
                </div>

                {/* Scientific Insight Alert */}
                <div className="md:col-span-7 p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-3 text-xs leading-relaxed">
                  <div className="flex items-center space-x-2 font-bold text-[var(--text-primary)]">
                    <Info className="w-4 h-4 text-[var(--accent-cyan)]" />
                    <span>Why PR-AUC is the Definitive Metric in Astronomy</span>
                  </div>
                  <p className="text-[var(--text-secondary)]">
                    The Kepler KOI dataset is naturally imbalanced: ~64% of candidate signals are false positives. 
                    A naive Majority-Class Baseline achieves <strong>63.77% accuracy</strong> simply by guessing that every object is a false positive—while finding exactly <strong>zero exoplanets</strong>.
                  </p>
                  <p className="text-[var(--text-secondary)]">
                    Precision measures how cleanly telescope follow-up time is protected, while Recall ensures genuine worlds aren’t discarded. <strong>HistGradientBoosting</strong> reaches <strong>0.9705 PR-AUC</strong> and <strong>0.9837 ROC-AUC</strong>, comfortably outperforming linear models.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Scientific Curves: PR & ROC */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* PR Curve Chart */}
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-[var(--text-primary)]">
                    Precision-Recall (PR) Curves
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">
                    Higher curve toward top-right indicates superior planet separation
                  </p>
                </div>
                <span className="text-xs font-mono text-[var(--accent-cyan)] font-bold">
                  PR-AUC: {activeMetrics?.pr_auc.toFixed(4)}
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activeMetrics?.pr_curve || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="recall"
                      type="number"
                      domain={[0, 1]}
                      stroke="var(--text-muted)"
                      fontSize={11}
                      label={{ value: "Recall", position: "insideBottom", offset: -5, fill: "var(--text-muted)" }}
                    />
                    <YAxis
                      dataKey="precision"
                      type="number"
                      domain={[0, 1]}
                      stroke="var(--text-muted)"
                      fontSize={11}
                      label={{ value: "Precision", angle: -90, position: "insideLeft", fill: "var(--text-muted)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--bg-secondary)",
                        borderColor: "var(--border-color)",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="precision"
                      name={selectedModel}
                      stroke="var(--accent-cyan)"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ROC Curve Chart */}
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-[var(--text-primary)]">
                    Receiver Operating Characteristic (ROC)
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">
                    True Positive Rate vs. False Positive Rate
                  </p>
                </div>
                <span className="text-xs font-mono text-blue-400 font-bold">
                  ROC-AUC: {activeMetrics?.roc_auc.toFixed(4)}
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activeMetrics?.roc_curve || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="fpr"
                      type="number"
                      domain={[0, 1]}
                      stroke="var(--text-muted)"
                      fontSize={11}
                      label={{ value: "False Positive Rate (FPR)", position: "insideBottom", offset: -5, fill: "var(--text-muted)" }}
                    />
                    <YAxis
                      dataKey="tpr"
                      type="number"
                      domain={[0, 1]}
                      stroke="var(--text-muted)"
                      fontSize={11}
                      label={{ value: "True Positive Rate (TPR)", angle: -90, position: "insideLeft", fill: "var(--text-muted)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--bg-secondary)",
                        borderColor: "var(--border-color)",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="tpr"
                      name={selectedModel}
                      stroke="#60A5FA"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 5-Fold Stratified Cross-Validation Table */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-[var(--border-color)]">
            <div className="p-5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <h4 className="text-base font-bold text-[var(--text-primary)]">
                5-Fold Stratified Cross-Validation Benchmarks
              </h4>
              <p className="text-xs text-[var(--text-muted)]">
                Evaluating stability across 5 distinct train/validation splits (Mean ± Standard Deviation)
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[var(--bg-primary)] border-b border-[var(--border-color)] text-[var(--text-muted)] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Model Architecture</th>
                    <th className="py-3 px-4">CV PR-AUC</th>
                    <th className="py-3 px-4">CV ROC-AUC</th>
                    <th className="py-3 px-4">CV F1-Score</th>
                    <th className="py-3 px-4">CV Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {modelsList.map((m) => {
                    const cv = data.cv_results?.[m];
                    const isBest = m === "HistGradientBoosting";
                    return (
                      <tr key={m} className={isBest ? "bg-[var(--accent-cyan)]/10 font-bold" : ""}>
                        <td className="py-3 px-4 text-[var(--text-primary)]">
                          {m} {isBest && "★ (Selected Best)"}
                        </td>
                        <td className="py-3 px-4 text-[var(--accent-cyan)]">
                          {cv?.pr_auc ? `${cv.pr_auc.mean.toFixed(4)} ± ${cv.pr_auc.std.toFixed(4)}` : "—"}
                        </td>
                        <td className="py-3 px-4 text-blue-400">
                          {cv?.roc_auc ? `${cv.roc_auc.mean.toFixed(4)} ± ${cv.roc_auc.std.toFixed(4)}` : "—"}
                        </td>
                        <td className="py-3 px-4 text-purple-400">
                          {cv?.f1 ? `${cv.f1.mean.toFixed(4)} ± ${cv.f1.std.toFixed(4)}` : "—"}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-primary)]">
                          {cv?.accuracy ? `${cv.accuracy.mean.toFixed(4)} ± ${cv.accuracy.std.toFixed(4)}` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
