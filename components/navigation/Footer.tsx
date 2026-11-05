import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, ShieldCheck, Database, Orbit } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] mt-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[var(--accent-cyan)] shadow-[0_0_10px_rgba(0,229,255,0.3)]">
                <Image
                  src="/assets/logo/exovet-logo.png"
                  alt="ExoVet"
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <span className="font-bold tracking-wider text-lg text-[var(--text-primary)]">
                EXO<span className="text-[var(--accent-cyan)]">VET</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Teaching machine-learning models to tell real exoplanets from impostors in NASA’s Kepler mission data.
            </p>
            <div className="flex items-center space-x-2 text-xs font-mono text-[var(--accent-cyan)]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Leakage Quarantined & Audited</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-[var(--accent-cyan)] transition-colors">
                  Overview & Hero
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-[var(--accent-cyan)] transition-colors">
                  Candidate Explorer (9,564 KOIs)
                </Link>
              </li>
              <li>
                <Link href="/detector" className="hover:text-[var(--accent-cyan)] transition-colors">
                  Planet Detector & Probability Gauge
                </Link>
              </li>
              <li>
                <Link href="/model-lab" className="hover:text-[var(--accent-cyan)] transition-colors">
                  Model Lab & Benchmark Comparisons
                </Link>
              </li>
              <li>
                <Link href="/explainable-ai" className="hover:text-[var(--accent-cyan)] transition-colors">
                  Explainable AI & Error Analysis
                </Link>
              </li>
              <li>
                <Link href="/science" className="hover:text-[var(--accent-cyan)] transition-colors">
                  Transit Method Interactive Simulator
                </Link>
              </li>
            </ul>
          </div>

          {/* Scientific Sources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-3">
              Data & Science
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://exoplanetarchive.ipac.caltech.edu"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 hover:text-[var(--accent-cyan)] transition-colors"
                >
                  <span>NASA Exoplanet Archive</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.nasa.gov/mission/kepler/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 hover:text-[var(--accent-cyan)] transition-colors"
                >
                  <span>NASA Kepler Mission</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <span className="text-[var(--text-muted)]">Kepler Robovetter DR25</span>
              </li>
              <li>
                <span className="text-[var(--text-muted)]">Shallue & Vanderburg (2018) Baseline</span>
              </li>
            </ul>
          </div>

          {/* Model Status */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-3">
              Production Architecture
            </h4>
            <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Model:</span>
                <span className="text-[var(--text-primary)] font-semibold">HistGradientBoosting</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">PR-AUC:</span>
                <span className="text-[var(--accent-cyan)] font-semibold">0.9705</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">ROC-AUC:</span>
                <span className="text-[var(--accent-cyan)] font-semibold">0.9837</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Catalog:</span>
                <span className="text-[var(--accent-gold)]">9,564 Kepler Objects</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="pt-6 border-t border-[var(--border-color)] text-[11px] leading-relaxed text-[var(--text-muted)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p>
            Disclaimer: ExoVet predictions are statistical machine-learning estimates based on photometric catalog parameters. 
            They do not constitute astronomical discovery validation, which requires spectroscopy and high-resolution imaging.
          </p>
          <div className="flex items-center space-x-2 shrink-0">
            <Orbit className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
            <span>ExoVet &copy; 2026 • Production Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
