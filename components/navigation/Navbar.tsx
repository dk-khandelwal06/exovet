"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useTheme, ThemeMode } from "../theme/ThemeProvider";
import {
  Compass,
  Radar,
  Cpu,
  Eye,
  BookOpen,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
  Orbit,
} from "lucide-react";

const NAV_LINKS = [
  { name: "Home", href: "/", icon: Orbit },
  { name: "Explore", href: "/explore", icon: Compass },
  { name: "Planet Detector", href: "/detector", icon: Radar },
  { name: "Model Lab", href: "/model-lab", icon: Cpu },
  { name: "Explainable AI", href: "/explainable-ai", icon: Eye },
  { name: "About Science", href: "/science", icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-[var(--border-color)] bg-[var(--nav-bg)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[var(--accent-cyan)] shadow-[0_0_12px_rgba(0,229,255,0.4)] group-hover:scale-105 transition-transform">
              <Image
                src="/assets/logo/exovet-logo.png"
                alt="ExoVet Logo"
                fill
                sizes="36px"
                className="object-cover"
                priority
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold tracking-wider text-lg text-[var(--text-primary)]">
                  EXO<span className="text-[var(--accent-cyan)]">VET</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)] font-semibold border border-[var(--accent-cyan)]/30">
                  KEPLER AI
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] tracking-tight hidden sm:block">
                Exoplanet Vetting Platform
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 shadow-[0_0_8px_rgba(0,229,255,0.2)] border border-[var(--accent-cyan)]/30"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Three-Way Theme Switcher */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-0.5 shadow-inner">
              <button
                type="button"
                onClick={() => setTheme("light")}
                title="Light Mode (Observatory Daylight)"
                className={`p-1.5 rounded-md text-xs transition-colors flex items-center space-x-1 ${
                  theme === "light"
                    ? "bg-[var(--accent-cyan)] text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden xl:inline">Light</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("twilight")}
                title="Twilight Mode (Dusk Observatory)"
                className={`p-1.5 rounded-md text-xs transition-colors flex items-center space-x-1 ${
                  theme === "twilight"
                    ? "bg-[var(--accent-cyan)] text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden xl:inline">Twilight</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                title="Dark Mode (Deep Space Midnight)"
                className={`p-1.5 rounded-md text-xs transition-colors flex items-center space-x-1 ${
                  theme === "dark"
                    ? "bg-[var(--accent-cyan)] text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden xl:inline">Dark</span>
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 pt-2 pb-4 space-y-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? "text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/15 border border-[var(--accent-cyan)]/30"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

