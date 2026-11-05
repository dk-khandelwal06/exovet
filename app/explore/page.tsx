"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Radar,
  Info,
  X,
  Sparkles,
  Flame,
  Globe,
  Radio,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Loader2,
} from "lucide-react";

interface CandidateItem {
  kepid: number;
  kepoi_name: string;
  kepler_name: string | null;
  koi_disposition: string;
  koi_period: number | null;
  koi_duration: number | null;
  koi_depth: number | null;
  koi_prad: number | null;
  koi_model_snr: number | null;
  koi_impact: number | null;
  koi_teq: number | null;
  koi_insol: number | null;
  koi_steff: number | null;
  koi_slogg: number | null;
  koi_srad: number | null;
  koi_kepmag: number | null;
  ra: number | null;
  dec: number | null;
}

export default function ExplorePage() {
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [disposition, setDisposition] = useState("ALL");
  const [sortBy, setSortBy] = useState("koi_period");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateItem | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch candidates from API
  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (disposition !== "ALL") params.append("disposition", disposition);

      const res = await fetch(`/api/candidates?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch candidates");
      const data = await res.json();
      setCandidates(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, disposition, sortBy, sortOrder]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const totalPages = Math.ceil(total / limit) || 1;

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const getDispositionBadge = (disp: string) => {
    switch (disp) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>CONFIRMED</span>
          </span>
        );
      case "FALSE POSITIVE":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>FALSE POSITIVE</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <HelpCircle className="w-3 h-3" />
            <span>CANDIDATE</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[var(--accent-cyan)] uppercase tracking-wider mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>NASA Exoplanet Archive • Cumulative KOI Catalog</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">
            Explore Kepler Candidates
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Browse 9,564 Kepler Objects of Interest. Filter by disposition, inspect photometric measurements, and send candidates to the Planet Detector.
          </p>
        </div>

        {/* Global Catalog Stats */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg glass-panel border border-[var(--border-color)]">
            <span className="text-[var(--text-muted)]">Showing: </span>
            <span className="text-[var(--accent-cyan)] font-bold">{total.toLocaleString()}</span> objects
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search Bar */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by KOI (e.g. K00752.01), Kepler ID, or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-panel text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-cyan)] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Disposition Filter Tabs */}
        <div className="md:col-span-4 flex items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-1 text-xs">
          {["ALL", "CONFIRMED", "FALSE POSITIVE", "CANDIDATE"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setDisposition(tab);
                setPage(1);
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-colors ${
                disposition === tab
                  ? "bg-[var(--accent-cyan)] text-space-950 font-bold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab === "FALSE POSITIVE" ? "FALSE POS." : tab}
            </button>
          ))}
        </div>

        {/* Sort Field Selector */}
        <div className="md:col-span-3 flex items-center space-x-2">
          <span className="text-xs text-[var(--text-muted)] shrink-0">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="flex-grow py-2 px-3 rounded-xl glass-panel text-xs text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-[var(--accent-cyan)]"
          >
            <option value="koi_period">Orbital Period</option>
            <option value="koi_depth">Transit Depth</option>
            <option value="koi_prad">Planet Radius</option>
            <option value="koi_model_snr">Signal-to-Noise (SNR)</option>
            <option value="koi_steff">Stellar Temp</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="p-2 rounded-xl glass-panel text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] border border-[var(--border-color)]"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Candidate Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-[var(--border-color)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-[var(--text-muted)] font-mono uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">KOI Identifier</th>
                <th className="py-3 px-4">Disposition</th>
                <th
                  onClick={() => handleSort("koi_period")}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--accent-cyan)]"
                >
                  Period (days)
                </th>
                <th
                  onClick={() => handleSort("koi_duration")}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--accent-cyan)]"
                >
                  Duration (hrs)
                </th>
                <th
                  onClick={() => handleSort("koi_depth")}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--accent-cyan)]"
                >
                  Depth (ppm)
                </th>
                <th
                  onClick={() => handleSort("koi_prad")}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--accent-cyan)]"
                >
                  Radius (R⊕)
                </th>
                <th
                  onClick={() => handleSort("koi_model_snr")}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--accent-cyan)]"
                >
                  SNR
                </th>
                <th className="py-3 px-4">Stellar Temp (K)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-[var(--text-muted)]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--accent-cyan)]" />
                    <span>Querying NASA Kepler catalog...</span>
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-[var(--text-muted)]">
                    No candidates matched the current search and filter criteria.
                  </td>
                </tr>
              ) : (
                candidates.map((cand) => (
                  <tr
                    key={cand.kepoi_name}
                    onClick={() => setSelectedCandidate(cand)}
                    className="hover:bg-[var(--accent-cyan)]/5 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-[var(--text-primary)]">
                      <div>{cand.kepoi_name}</div>
                      {cand.kepler_name && (
                        <span className="text-[10px] text-[var(--accent-cyan)] font-normal">
                          {cand.kepler_name}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{getDispositionBadge(cand.koi_disposition)}</td>
                    <td className="py-3.5 px-4 font-mono text-[var(--text-secondary)]">
                      {cand.koi_period != null ? cand.koi_period.toFixed(2) : "—"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[var(--text-secondary)]">
                      {cand.koi_duration != null ? cand.koi_duration.toFixed(2) : "—"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[var(--text-secondary)]">
                      {cand.koi_depth != null ? cand.koi_depth.toFixed(1) : "—"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[var(--text-primary)] font-semibold">
                      {cand.koi_prad != null ? cand.koi_prad.toFixed(2) : "—"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[var(--text-secondary)]">
                      {cand.koi_model_snr != null ? cand.koi_model_snr.toFixed(1) : "—"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[var(--text-secondary)]">
                      {cand.koi_steff != null ? `${cand.koi_steff.toFixed(0)} K` : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/detector?koi=${encodeURIComponent(cand.kepoi_name)}`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)] hover:text-space-950 transition-colors border border-[var(--accent-cyan)]/30"
                      >
                        <Radar className="w-3 h-3" />
                        <span>Vet</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-[var(--text-muted)] font-mono">
            Page {page} of {totalPages} ({total.toLocaleString()} total objects)
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-[var(--border-color)] glass-panel text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono px-2 text-[var(--text-primary)] font-bold">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-[var(--border-color)] glass-panel text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl rounded-2xl border border-[var(--border-color)] p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[var(--border-color)] pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold font-mono text-[var(--text-primary)]">
                    {selectedCandidate.kepoi_name}
                  </h3>
                  {getDispositionBadge(selectedCandidate.koi_disposition)}
                </div>
                {selectedCandidate.kepler_name && (
                  <p className="text-xs text-[var(--accent-cyan)] font-mono mt-0.5">
                    Official Confirmation: {selectedCandidate.kepler_name}
                  </p>
                )}
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Host Kepler Star: KIC {selectedCandidate.kepid}
                </p>
              </div>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual banner */}
            <div className="relative h-28 rounded-xl overflow-hidden border border-[var(--border-color)]">
              <Image
                src="/assets/images/exoplanet-atmosphere.png"
                alt="Exoplanet Atmosphere"
                fill
                sizes="600px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-2 left-3 text-[11px] font-mono text-[var(--text-secondary)]">
                RA: {selectedCandidate.ra?.toFixed(3)}° • Dec: {selectedCandidate.dec?.toFixed(3)}°
              </div>
            </div>

            {/* Parameter Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] block text-[10px]">Orbital Period</span>
                <span className="font-bold text-[var(--text-primary)] text-sm">
                  {selectedCandidate.koi_period != null ? `${selectedCandidate.koi_period.toFixed(3)} d` : "—"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] block text-[10px]">Transit Depth</span>
                <span className="font-bold text-[var(--text-primary)] text-sm">
                  {selectedCandidate.koi_depth != null ? `${selectedCandidate.koi_depth.toFixed(1)} ppm` : "—"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] block text-[10px]">Planet Radius</span>
                <span className="font-bold text-[var(--accent-cyan)] text-sm">
                  {selectedCandidate.koi_prad != null ? `${selectedCandidate.koi_prad.toFixed(2)} R⊕` : "—"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] block text-[10px]">Transit Duration</span>
                <span className="font-bold text-[var(--text-primary)] text-sm">
                  {selectedCandidate.koi_duration != null ? `${selectedCandidate.koi_duration.toFixed(2)} hrs` : "—"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] block text-[10px]">Transit SNR</span>
                <span className="font-bold text-[var(--text-primary)] text-sm">
                  {selectedCandidate.koi_model_snr != null ? selectedCandidate.koi_model_snr.toFixed(1) : "—"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] block text-[10px]">Impact Parameter</span>
                <span className="font-bold text-[var(--text-primary)] text-sm">
                  {selectedCandidate.koi_impact != null ? selectedCandidate.koi_impact.toFixed(2) : "—"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] block text-[10px]">Equilibrium Temp</span>
                <span className="font-bold text-[var(--text-primary)] text-sm">
                  {selectedCandidate.koi_teq != null ? `${selectedCandidate.koi_teq.toFixed(0)} K` : "—"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] block text-[10px]">Stellar Temp</span>
                <span className="font-bold text-[var(--text-primary)] text-sm">
                  {selectedCandidate.koi_steff != null ? `${selectedCandidate.koi_steff.toFixed(0)} K` : "—"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] block text-[10px]">Stellar Radius</span>
                <span className="font-bold text-[var(--text-primary)] text-sm">
                  {selectedCandidate.koi_srad != null ? `${selectedCandidate.koi_srad.toFixed(2)} R☉` : "—"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[var(--border-color)]">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Close
              </button>
              <Link
                href={`/detector?koi=${encodeURIComponent(selectedCandidate.kepoi_name)}`}
                className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-[var(--accent-cyan)] text-space-950 text-xs font-semibold hover:brightness-110 shadow-[0_0_12px_rgba(0,229,255,0.4)]"
              >
                <Radar className="w-3.5 h-3.5" />
                <span>Test in Planet Detector</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
