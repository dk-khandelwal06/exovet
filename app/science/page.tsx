"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  ExternalLink,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Orbit,
  AlertTriangle,
  Compass,
  CheckCircle2,
} from "lucide-react";

export default function SciencePage() {
  // Transit Simulator State
  const [isPlaying, setIsPlaying] = useState(true);
  const [planetSize, setPlanetSize] = useState(2.5); // Earth radii
  const [transitPeriod, setTransitPeriod] = useState(6.0); // Seconds for simulation cycle
  const [progress, setProgress] = useState(0);

  const animRef = useRef<number>();

  useEffect(() => {
    let lastTime = performance.now();
    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlaying) {
        setProgress((prev) => (prev + delta / transitPeriod) % 1.0);
      }
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, transitPeriod]);

  // Planet X position in SVG viewBox [-120 to +120]
  const planetX = -120 + progress * 240;
  // Star center is at (0, 0), star radius is 40
  const starRadius = 40;
  const planetVisualRadius = 3 + (planetSize / 15) * 14;

  // Calculate mid-transit dip: max dip proportional to (Rp / R*)^2
  const distFromCenter = Math.abs(planetX);
  const isTransiting = distFromCenter < starRadius + planetVisualRadius;
  const dipDepth = (planetSize / 15) * 0.18; // 0 to 18% flux drop
  let currentFlux = 1.0;
  if (isTransiting) {
    const factor = Math.cos((distFromCenter / (starRadius + planetVisualRadius)) * (Math.PI / 2));
    currentFlux = 1.0 - dipDepth * Math.max(0, factor);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Page Header */}
      <div className="border-b border-[var(--border-color)] pb-6">
        <div className="flex items-center space-x-2 text-xs font-mono text-[var(--accent-cyan)] uppercase tracking-wider mb-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Educational Astronomy & Astrophysical Fundamentals</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">
          About the Science
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
          Discover how the transit method detects worlds across the galaxy, and why astronomical impostors mimic planetary signals.
        </p>
      </div>

      {/* WHAT IS AN EXOPLANET? */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7 space-y-4">
          <span className="text-xs font-mono font-bold text-[var(--accent-cyan)] uppercase tracking-wider">
            Cosmic Perspective
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            What is an Exoplanet?
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            An <strong>exoplanet</strong> (extrasolar planet) is any planet that orbits a star beyond our own solar system. Until 1992, humanity had never confirmed the existence of a single world outside our solar neighborhood.
          </p>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Today, thanks to missions like NASA’s <strong>Kepler</strong> and <strong>TESS</strong>, astronomers know of over 5,500 confirmed planets. They range from scorching gas giants (“hot Jupiters”) orbiting in hours, to icy Neptune-like worlds and temperate terrestrial planets.
          </p>
        </div>

        <div className="md:col-span-5 relative h-64 rounded-2xl overflow-hidden glass-panel border border-[var(--border-color)] shadow-xl">
          <Image
            src="/assets/images/deep-space-environment.png"
            alt="Deep Space Exoplanet Environment"
            fill
            sizes="500px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-3 left-3 text-[11px] font-mono text-[var(--text-secondary)]">
            Kepler Field: Cygnus & Lyra constellations
          </div>
        </div>
      </section>

      {/* INTERACTIVE TRANSIT METHOD SIMULATOR */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-color)] space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-[var(--accent-gold)] uppercase tracking-wider">
              Interactive Physics Lab
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              The Transit Method & Synchronized Light Curve
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-xl bg-[var(--accent-cyan)] text-space-950 font-bold text-xs hover:brightness-110 flex items-center space-x-1"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? "Pause Orbit" : "Resume Orbit"}</span>
            </button>
            <button
              onClick={() => setProgress(0)}
              className="p-2 rounded-xl glass-panel text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              title="Reset Orbit"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Simulator Visualizer Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Top: 2D Astronomical Transit View */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative h-64 w-full rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full" viewBox="-120 -60 240 120">
                {/* Orbital line guide */}
                <line x1="-120" y1="0" x2="120" y2="0" stroke="rgba(0,229,255,0.2)" strokeDasharray="4 4" />

                {/* Central Star */}
                <defs>
                  <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFF3B0" />
                    <stop offset="60%" stopColor="#FFB703" />
                    <stop offset="100%" stopColor="#FB8500" stopOpacity="0.8" />
                  </radialGradient>
                </defs>
                <circle cx="0" cy="0" r={starRadius} fill="url(#starGlow)" />

                {/* Transit chord indicator */}
                <text x="0" y="4" textAnchor="middle" fill="#582F0E" fontSize="7" fontWeight="bold" opacity="0.6">
                  Host Star (R*)
                </text>

                {/* Transiting Planet */}
                <circle
                  cx={planetX}
                  cy="0"
                  r={planetVisualRadius}
                  fill="#060B18"
                  stroke="#00E5FF"
                  strokeWidth="1.2"
                />
              </svg>

              {/* Status Overlay */}
              <div className="absolute top-3 left-3 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-primary)]/80 px-2 py-1 rounded border border-[var(--border-color)]">
                {isTransiting ? "TRANSIT IN PROGRESS" : "OUT OF TRANSIT (BASELINE)"}
              </div>
            </div>

            {/* Bottom: Synchronized Photometric Light Curve */}
            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[var(--text-muted)]">Relative Stellar Flux (Normalized)</span>
                <span className="text-[var(--accent-cyan)] font-bold">
                  {(currentFlux * 100).toFixed(2)}%
                </span>
              </div>

              {/* Simulated Light Curve Graph */}
              <div className="h-24 w-full relative border-l border-b border-[var(--border-color)] flex items-end">
                <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                  {/* U-Shaped Transit Profile */}
                  <path
                    d={`M 0 10 L 60 10 Q 75 10 85 ${10 + dipDepth * 200} L 115 ${10 + dipDepth * 200} Q 125 10 140 10 L 200 10`}
                    fill="none"
                    stroke="var(--accent-cyan)"
                    strokeWidth="2"
                  />
                  {/* Real-time Indicator Point */}
                  <circle
                    cx={progress * 200}
                    cy={10 + (1.0 - currentFlux) * 200}
                    r="4"
                    fill="#FFB703"
                  />
                </svg>
              </div>

              <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)] pt-1">
                <span>Ingress (1st Contact)</span>
                <span>Transit Depth ΔF/F ≈ (Rp/R*)²</span>
                <span>Egress (4th Contact)</span>
              </div>
            </div>
          </div>

          {/* Controls Right */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                Simulator Controls
              </h4>

              {/* Planet Radius Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[var(--text-secondary)]">Planet Radius (Rp)</span>
                  <span className="text-[var(--accent-cyan)] font-bold">{planetSize.toFixed(1)} R⊕</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="15.0"
                  step="0.5"
                  value={planetSize}
                  onChange={(e) => setPlanetSize(parseFloat(e.target.value))}
                  className="w-full accent-[var(--accent-cyan)] cursor-pointer"
                />
                <span className="text-[10px] text-[var(--text-muted)] block">
                  {planetSize < 2.0
                    ? "Earth-sized terrestrial world"
                    : planetSize < 5.0
                    ? "Super-Earth / Sub-Neptune"
                    : "Gas Giant / Jupiter-like world"}
                </span>
              </div>

              {/* Orbital Period Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[var(--text-secondary)]">Simulation Period Speed</span>
                  <span className="text-[var(--accent-gold)] font-bold">{transitPeriod.toFixed(1)} s</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="12.0"
                  step="0.5"
                  value={transitPeriod}
                  onChange={(e) => setTransitPeriod(parseFloat(e.target.value))}
                  className="w-full accent-[var(--accent-gold)] cursor-pointer"
                />
              </div>
            </div>

            {/* Scientific Math Card */}
            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-mono space-y-2">
              <span className="text-[var(--accent-cyan)] font-bold block">
                Astrophysical Equation of Transit Depth:
              </span>
              <div className="p-2.5 rounded bg-[var(--bg-secondary)] text-center text-sm font-bold text-[var(--text-primary)]">
                ΔF / F ≈ ( R_planet / R_star )²
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                An Earth-sized planet transiting the Sun dims it by only <strong>84 parts per million (0.0084%)</strong>. A Jupiter-sized planet creates a ~<strong>10,000 ppm (1%)</strong> dip.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY IMPOSTORS EXIST: Eclipsing Binaries & Blends */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
            Astronomical Impostors
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Why Are False Positives Possible?
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Over 50% of Kepler signals are not planets. Nature creates deceptive optical illusions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Reason 1 */}
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold font-mono">
              EB
            </div>
            <h4 className="text-base font-bold text-[var(--text-primary)]">
              Eclipsing Binary Stars
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              When two stars orbit in our line of sight, the smaller star regularly blocks the larger star. Grazing eclipses produce shallow, V-shaped dips that mimic planetary transits.
            </p>
          </div>

          {/* Reason 2 */}
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono">
              BEB
            </div>
            <h4 className="text-base font-bold text-[var(--text-primary)]">
              Background Blended Binaries
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              An eclipsing binary star deep in the background lies within the same Kepler pixel as a bright foreground star. The light is diluted, turning a 50% stellar eclipse into an apparent 0.1% planet dip.
            </p>
          </div>

          {/* Reason 3 */}
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold font-mono">
              INST
            </div>
            <h4 className="text-base font-bold text-[var(--text-primary)]">
              Spacecraft & Stellar Jitter
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Kepler’s reaction wheel jitter, thermal drift, and stellar starspot rotations produce quasi-periodic flux dips near the detector's photon noise threshold.
            </p>
          </div>
        </div>
      </section>

      {/* SCIENTIFIC REFERENCES */}
      <section className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
        <h3 className="text-base font-bold text-[var(--text-primary)]">
          Authoritative Scientific References
        </h3>
        <ul className="space-y-2 text-xs text-[var(--text-secondary)] font-mono">
          <li className="flex items-center space-x-2">
            <ExternalLink className="w-3.5 h-3.5 text-[var(--accent-cyan)] shrink-0" />
            <a
              href="https://exoplanetarchive.ipac.caltech.edu/docs/Kepler_KOI_docs.html"
              target="_blank"
              rel="noreferrer"
              className="hover:underline text-[var(--text-primary)]"
            >
              NASA Exoplanet Archive — Kepler Objects of Interest (KOI) Cumulative Table Documentation
            </a>
          </li>
          <li className="flex items-center space-x-2">
            <ExternalLink className="w-3.5 h-3.5 text-[var(--accent-cyan)] shrink-0" />
            <a
              href="https://iopscience.iop.org/article/10.3847/1538-3881/aa9e09"
              target="_blank"
              rel="noreferrer"
              className="hover:underline text-[var(--text-primary)]"
            >
              Shallue & Vanderburg (2018) — Identifying Exoplanets with Deep Learning in Kepler Data (AJ 155 94)
            </a>
          </li>
          <li className="flex items-center space-x-2">
            <ExternalLink className="w-3.5 h-3.5 text-[var(--accent-cyan)] shrink-0" />
            <a
              href="https://www.nasa.gov/mission/kepler/"
              target="_blank"
              rel="noreferrer"
              className="hover:underline text-[var(--text-primary)]"
            >
              NASA Kepler & K2 Missions Overview
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
