"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Radar,
  Compass,
  Cpu,
  Eye,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Layers,
  Database,
  BarChart3,
  Flame,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/10 text-xs font-mono text-[var(--accent-cyan)] tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NASA Kepler Mission Catalog • Machine Learning Vetting</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.1]">
              NOT EVERY PLANET <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-cyan)] via-blue-400 to-[var(--accent-gold)]">
                IS WHAT IT SEEMS.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              Explore the science of exoplanet vetting. Discover how machine learning separates genuine planetary signals from astronomical impostors using NASA’s Kepler observations.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/explore"
                className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm bg-[var(--accent-cyan)] text-space-950 hover:brightness-110 shadow-[0_0_24px_rgba(0,229,255,0.4)] transition-all group"
              >
                <Compass className="w-4 h-4 text-space-950 group-hover:rotate-45 transition-transform" />
                <span>Explore the Universe</span>
                <ArrowRight className="w-4 h-4 text-space-950 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/detector"
                className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm glass-panel text-[var(--text-primary)] hover:border-[var(--accent-cyan)] transition-all"
              >
                <Radar className="w-4 h-4 text-[var(--accent-cyan)]" />
                <span>Open Planet Detector</span>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[var(--border-color)]">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--text-primary)]">
                  9,564
                </p>
                <p className="text-xs text-[var(--text-muted)]">Kepler Objects (KOI)</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
                  2,748
                </p>
                <p className="text-xs text-[var(--text-muted)]">Confirmed Exoplanets</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
                  0.9705
                </p>
                <p className="text-xs text-[var(--text-muted)]">Model PR-AUC Score</p>
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Gemini Space Artwork & Video Layer */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden glass-panel border border-[var(--border-color)] shadow-2xl group aspect-[4/3] sm:aspect-square">
              {/* Responsive Video Background */}
              <video
                src="/assets/videos/solar-system-journey.mp4"
                poster="/assets/images/exoplanet-hero.png"
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-80" />

              {/* Floating Holographic Badge */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl glass-panel border border-[var(--border-color)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono text-[var(--text-primary)] font-semibold">
                      KOI-0752.01 (Kepler-227 b)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                    CONFIRMED
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                  Orbital Period: 9.49 days • Planet Radius: 2.26 R_earth • Transit Depth: 615.8 ppm
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCIENTIFIC OVERVIEW STATS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-[var(--border-color)]">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-[var(--accent-cyan)] font-mono font-bold">
              The Astronomical Challenge
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Telescopes Produce Candidates Faster Than Humans Can Review
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              NASA’s Kepler space telescope stared at ~150,000 stars, measuring periodic dips in starlight. But over 50% of candidate signals are false positives caused by eclipsing binary stars, background stars, or instrument jitter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Confirmed Planets */}
            <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-2xl font-mono font-extrabold text-emerald-400">
                  2,748
                </span>
              </div>
              <h4 className="text-base font-semibold text-[var(--text-primary)]">Confirmed Exoplanets</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Genuine planetary bodies confirmed through radial velocity follow-up or statistical validation. True transit dips with terrestrial or gas-giant physical radii.
              </p>
            </div>

            {/* False Positives */}
            <div className="p-5 rounded-xl border border-rose-500/20 bg-rose-950/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="text-2xl font-mono font-extrabold text-rose-400">
                  4,839
                </span>
              </div>
              <h4 className="text-base font-semibold text-[var(--text-primary)]">False-Positive Impostors</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Eclipsing stellar binaries, background star blends causing centroid shifts, or detector artifacts that mimicked planetary transits.
              </p>
            </div>

            {/* Unvetted Candidates */}
            <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-950/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="text-2xl font-mono font-extrabold text-amber-400">
                  1,977
                </span>
              </div>
              <h4 className="text-base font-semibold text-[var(--text-primary)]">Unvetted Candidates</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Astronomical objects in the Kepler catalog awaiting definitive validation. ExoVet scores them dynamically using the trained ensemble models.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-STEP VISUAL WORKFLOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-[var(--accent-cyan)] font-mono font-bold">
            How ExoVet Works
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            From Photometric Catalog to Probabilistic Vetting
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            A disciplined, leakage-free pipeline built on tree ensembles and astrophysically engineered features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="glass-panel p-6 rounded-2xl relative border border-[var(--border-color)] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] flex items-center justify-center font-mono font-bold">
              01
            </div>
            <h4 className="font-semibold text-base text-[var(--text-primary)]">Kepler Data</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Ingestion of the 9,564 cumulative Kepler Objects of Interest (KOI) catalog via NASA Exoplanet Archive TAP API.
            </p>
            <div className="text-[11px] font-mono text-[var(--accent-cyan)] flex items-center space-x-1">
              <Database className="w-3.5 h-3.5" />
              <span>NASA TAP Sync</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-panel p-6 rounded-2xl relative border border-[var(--border-color)] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] flex items-center justify-center font-mono font-bold">
              02
            </div>
            <h4 className="font-semibold text-base text-[var(--text-primary)]">Leakage Audit</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Quarantine and removal of <code>koi_score</code>, <code>koi_fpflag_*</code>, and pipeline dispositions to prevent circular leakage.
            </p>
            <div className="text-[11px] font-mono text-[var(--accent-gold)] flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Strict Quarantining</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-panel p-6 rounded-2xl relative border border-[var(--border-color)] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono font-bold">
              03
            </div>
            <h4 className="font-semibold text-base text-[var(--text-primary)]">Machine Learning</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Comparison across Majority Baseline, Logistic Regression, Random Forest, and HistGradientBoosting via 5-fold Stratified CV.
            </p>
            <div className="text-[11px] font-mono text-purple-400 flex items-center space-x-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>5-Fold Stratified CV</span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="glass-panel p-6 rounded-2xl relative border border-[var(--border-color)] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold">
              04
            </div>
            <h4 className="font-semibold text-base text-[var(--text-primary)]">Classification</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Interactive probability gauge, permutation feature importance, and astrophysical error analysis for every candidate.
            </p>
            <div className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>PR-AUC 0.9705</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED MULTIMEDIA SHOWCASE: Videos & Imagery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Kepler Space Telescope Card */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-[var(--border-color)] group">
            <div className="relative h-64 w-full">
              <Image
                src="/assets/images/kepler-telescope.png"
                alt="NASA Kepler Space Telescope"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-80" />
            </div>
            <div className="p-6 space-y-3">
              <div className="inline-block px-2.5 py-1 rounded bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)] text-[10px] font-mono font-bold uppercase">
                Mission Science
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                The Kepler Space Telescope Legacy
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Launched in 2009, Kepler revolutionized exoplanet science by continuously observing 150,000 stars in the constellations Cygnus and Lyra, demonstrating that planets outnumber stars in our galaxy.
              </p>
              <Link
                href="/science"
                className="inline-flex items-center space-x-2 text-xs font-semibold text-[var(--accent-cyan)] hover:underline pt-2"
              >
                <span>Read the Science Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Transit Animation Card */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-[var(--border-color)] group">
            <div className="relative h-64 w-full bg-black">
              <video
                src="/assets/videos/exoplanet-transit.mp4"
                poster="/assets/images/planetary-transit.png"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-80" />
            </div>
            <div className="p-6 space-y-3">
              <div className="inline-block px-2.5 py-1 rounded bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] text-[10px] font-mono font-bold uppercase">
                Physics Simulation
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                The Transit Photometry Signature
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                When a world passes between its host star and the observer, it blocks a tiny fraction of light: $(R_p / R_*)^2$. ExoVet analyzes this light curve dip along with orbital period, duration, and SNR.
              </p>
              <Link
                href="/detector"
                className="inline-flex items-center space-x-2 text-xs font-semibold text-[var(--accent-gold)] hover:underline pt-2"
              >
                <span>Test a Transit in Detector</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* EXPLORE CORE TOOLS CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-[var(--accent-cyan)]/30 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest text-[var(--accent-cyan)] uppercase">
              Ready for Astronomical Discovery
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
              Vet Any Exoplanet Candidate in Seconds
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Select any of the 9,564 Kepler Objects of Interest or enter your own custom transit measurements to run live inference on our trained gradient-boosted trees.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/explore"
                className="px-6 py-3 rounded-xl bg-[var(--accent-cyan)] text-space-950 font-semibold text-sm hover:brightness-110 shadow-[0_0_16px_rgba(0,229,255,0.4)]"
              >
                Open Candidate Explorer
              </Link>
              <Link
                href="/model-lab"
                className="px-6 py-3 rounded-xl glass-panel text-[var(--text-primary)] font-semibold text-sm hover:border-[var(--accent-cyan)]"
              >
                Compare 4 Models
              </Link>
            </div>
          </div>

          {/* Decorative video in background */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 pointer-events-none hidden lg:block overflow-hidden">
            <video
              src="/assets/videos/saturn-orbit.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

