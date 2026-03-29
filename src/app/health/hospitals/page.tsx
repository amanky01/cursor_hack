"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { fetchHospitals, type AppointmentHospitalOption } from "@/lib/apifyHospitals";
import { buildAppointmentsHref } from "@/lib/appointmentLinks";
import { INDIAN_STATES_AND_UTS } from "@/lib/indianStates";
import {
  Search, MapPin, Star, ChevronDown, ChevronUp,
  Stethoscope, Clock, Phone, Globe, Calendar,
  AlertCircle, Building2, X,
} from "lucide-react";

type Doctor = { id: string; name: string; specialty: string; department?: string };

const ACCENT = "#7c3aed";
const ACCENT_LIGHT = "#f5f3ff";
const ACCENT_BORDER = "#ddd6fe";

const card: React.CSSProperties = {
  background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20,
};
const inp: React.CSSProperties = {
  width: "100%", padding: "10px 14px", border: "1.5px solid #d1d5db",
  borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff",
};
const selStyle: React.CSSProperties = { ...inp, cursor: "pointer" };

function chip(active: boolean): React.CSSProperties {
  return {
    padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
    cursor: "pointer", border: `1.5px solid ${active ? ACCENT : "#e5e7eb"}`,
    background: active ? ACCENT_LIGHT : "#fff",
    color: active ? ACCENT : "#6b7280",
    whiteSpace: "nowrap",
  };
}

export default function HospitalFinderPage() {
  const [state, setState] = useState("");
  const [hospitals, setHospitals] = useState<AppointmentHospitalOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadRef = useRef(0);

  /* filters (client-side after fetch) */
  const [cityFilter, setCityFilter] = useState("");
  const [specialityFilter, setSpecialityFilter] = useState("");
  const [search, setSearch] = useState("");

  /* expand & doctors */
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Record<string, Doctor[]>>({});
  const [loadingDoctors, setLoadingDoctors] = useState<Record<string, boolean>>({});

  /* ── derived filter options from current results ── */
  const cities = useMemo(() => {
    const s = new Set(hospitals.map((h) => h.city).filter(Boolean));
    return [...s].sort();
  }, [hospitals]);

  const specialities = useMemo(() => {
    const s = new Set(hospitals.map((h) => h.speciality).filter(Boolean));
    return [...s].sort();
  }, [hospitals]);

  /* ── fetch on state change ── */
  async function loadForState(selectedState: string) {
    setState(selectedState);
    setCityFilter("");
    setSpecialityFilter("");
    setSearch("");
    setExpandedId(null);
    setHospitals([]);
    setLoaded(false);
    if (!selectedState) return;

    const id = ++loadRef.current;
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchHospitals(selectedState);
      if (id !== loadRef.current) return;
      setHospitals(rows);
      setLoaded(true);
    } catch {
      if (id !== loadRef.current) return;
      setError("Failed to load hospitals. Please try again.");
    } finally {
      if (id === loadRef.current) setLoading(false);
    }
  }

  /* ── doctor lazy-load ── */
  async function loadDoctors(hospitalId: string) {
    if (doctors[hospitalId] !== undefined) return;
    setLoadingDoctors((p) => ({ ...p, [hospitalId]: true }));
    try {
      const res = await fetch(`/api/appointments/doctors?hospitalId=${encodeURIComponent(hospitalId)}`);
      const data = (await res.json()) as { doctors?: Doctor[] };
      setDoctors((p) => ({ ...p, [hospitalId]: Array.isArray(data.doctors) ? data.doctors : [] }));
    } catch {
      setDoctors((p) => ({ ...p, [hospitalId]: [] }));
    } finally {
      setLoadingDoctors((p) => ({ ...p, [hospitalId]: false }));
    }
  }

  function toggleHospital(id: string) {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    loadDoctors(id);
  }

  /* ── filtered results ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return hospitals.filter((h) => {
      if (cityFilter && h.city !== cityFilter) return false;
      if (specialityFilter && h.speciality !== specialityFilter) return false;
      if (q) {
        return (
          h.name.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.speciality.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [hospitals, cityFilter, specialityFilter, search]);

  const activeFilters = [
    cityFilter && { label: cityFilter, clear: () => setCityFilter("") },
    specialityFilter && { label: specialityFilter, clear: () => setSpecialityFilter("") },
    search && { label: `"${search}"`, clear: () => setSearch("") },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <Layout title="Hospital Finder — Sehat-Saathi" description="Find hospitals by state and city.">
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>

        {/* Header */}
        <Link href="/health" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>
          ← Back to Health Tools
        </Link>
        <div style={{ margin: "12px 0 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: ACCENT_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Building2 size={24} color={ACCENT} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800 }}>Hospital Finder</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Search by state, filter by city and speciality</p>
          </div>
        </div>

        <div style={{ padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, fontSize: 13, color: "#92400e", marginBottom: 24 }}>
          <AlertCircle size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
          <strong>Informational only.</strong> To book with a verified counsellor,{" "}
          <Link href="/appointments" style={{ color: "#1d4ed8", fontWeight: 700 }}>use our portal →</Link>
        </div>

        {/* ── Step 1: State ── */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ width: 22, height: 22, background: ACCENT, color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>1</span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Select State / Union Territory</span>
          </div>
          <div style={{ position: "relative" }}>
            <MapPin size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
            <select
              value={state}
              onChange={(e) => loadForState(e.target.value)}
              style={{ ...selStyle, paddingLeft: 34 }}
            >
              <option value="">— Choose a state to search hospitals —</option>
              {INDIAN_STATES_AND_UTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          {state && (
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#6b7280" }}>
              Searching: <strong>hospitals in {state}, India</strong> via Apify Google Maps
              {loading && " · Loading…"}
              {loaded && ` · ${hospitals.length} found`}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ ...card, textAlign: "center", padding: "40px 0", color: "#6b7280", marginBottom: 16 }}>
            <Building2 size={32} color="#d1d5db" style={{ marginBottom: 10 }} />
            <p style={{ margin: 0 }}>Fetching hospitals in {state}…</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>First load may take up to 2 minutes via Apify.</p>
          </div>
        )}

        {error && (
          <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 13, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {error}
            <button onClick={() => loadForState(state)} style={{ border: "none", background: "none", color: "#dc2626", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Retry</button>
          </div>
        )}

        {/* ── Step 2 & 3: City + Speciality filters (shown after results load) ── */}
        {loaded && hospitals.length > 0 && (
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: cities.length > 0 ? 14 : 0 }}>
              {/* City filter */}
              {cities.length > 0 && (
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <span style={{ width: 22, height: 22, background: "#0891b2", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>2</span>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>Filter by City</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button onClick={() => setCityFilter("")} style={chip(cityFilter === "")}>All cities</button>
                    {cities.slice(0, 12).map((c) => (
                      <button key={c} onClick={() => setCityFilter(c === cityFilter ? "" : c)} style={chip(cityFilter === c)}>{c}</button>
                    ))}
                    {cities.length > 12 && (
                      <select
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        style={{ ...selStyle, width: "auto", fontSize: 12, padding: "5px 10px" }}
                      >
                        <option value="">More cities…</option>
                        {cities.slice(12).map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              )}

              {/* Speciality filter */}
              {specialities.length > 0 && (
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <span style={{ width: 22, height: 22, background: "#059669", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>3</span>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>Filter by Speciality</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button onClick={() => setSpecialityFilter("")} style={chip(specialityFilter === "")}>All types</button>
                    {specialities.slice(0, 8).map((s) => (
                      <button key={s} onClick={() => setSpecialityFilter(s === specialityFilter ? "" : s)} style={chip(specialityFilter === s)}>{s}</button>
                    ))}
                    {specialities.length > 8 && (
                      <select
                        value={specialityFilter}
                        onChange={(e) => setSpecialityFilter(e.target.value)}
                        style={{ ...selStyle, width: "auto", fontSize: 12, padding: "5px 10px" }}
                      >
                        <option value="">More…</option>
                        {specialities.slice(8).map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: text search */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ width: 22, height: 22, background: "#f59e0b", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>4</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>Search by name or address</span>
              </div>
              <div style={{ position: "relative" }}>
                <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. Apollo, AIIMS, cancer, ortho…"
                  style={{ ...inp, paddingLeft: 36 }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Active filter pills */}
        {activeFilters.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>Active filters:</span>
            {activeFilters.map((f) => (
              <button
                key={f.label}
                onClick={f.clear}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", background: ACCENT_LIGHT, border: `1px solid ${ACCENT_BORDER}`, borderRadius: 12, fontSize: 12, fontWeight: 700, color: ACCENT, cursor: "pointer" }}
              >
                {f.label} <X size={10} />
              </button>
            ))}
            <button
              onClick={() => { setCityFilter(""); setSpecialityFilter(""); setSearch(""); }}
              style={{ fontSize: 12, color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results count */}
        {loaded && !loading && (
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "#9ca3af" }}>
            {filtered.length} of {hospitals.length} hospital{hospitals.length !== 1 ? "s" : ""} shown
          </p>
        )}

        {/* No state selected yet */}
        {!state && !loading && (
          <div style={{ ...card, textAlign: "center", padding: "56px 0", color: "#9ca3af" }}>
            <MapPin size={40} color="#d1d5db" style={{ marginBottom: 12 }} />
            <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#6b7280" }}>Select a state to get started</p>
            <p style={{ margin: 0, fontSize: 13 }}>Hospitals are fetched from Google Maps via Apify for the selected state.</p>
          </div>
        )}

        {/* Hospital cards */}
        {filtered.map((h) => {
          const isOpen = expandedId === h.id;
          const hDoctors = doctors[h.id] ?? [];
          const isLoadingDoc = loadingDoctors[h.id] ?? false;

          return (
            <div
              key={h.id}
              style={{ ...card, marginBottom: 12, borderColor: isOpen ? ACCENT_BORDER : "#e5e7eb", borderWidth: isOpen ? 2 : 1, transition: "border-color 0.15s" }}
            >
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }}
                onClick={() => toggleHospital(h.id)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 4 }}>{h.name}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                    <MapPin size={12} />
                    <span>{h.city || "—"}{h.address ? ` · ${h.address}` : ""}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                    {h.rating && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700, color: "#ca8a04", background: "#fefce8", padding: "2px 8px", borderRadius: 8 }}>
                        <Star size={11} /> {h.rating}
                      </span>
                    )}
                    {h.speciality && (
                      <span style={{ fontSize: 11, color: ACCENT, background: ACCENT_LIGHT, padding: "2px 8px", borderRadius: 8, fontWeight: 700 }}>{h.speciality}</span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 12 }}>
                  <Link
                    href={buildAppointmentsHref({ hospitalName: h.name, city: h.city ?? "" })}
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", background: "#2563eb", color: "#fff", borderRadius: 7, fontSize: 12, fontWeight: 700, textDecoration: "none" }}
                  >
                    <Calendar size={12} /> Book
                  </Link>
                  <div style={{ color: "#9ca3af" }}>{isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
                </div>
              </div>

              {isOpen && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8, marginBottom: 16 }}>
                    {[
                      { icon: Phone, label: "Contact", value: "Call hospital directly" },
                      { icon: Clock, label: "Hours", value: "Check with hospital" },
                      { icon: Globe, label: "Walk-in", value: "Available anytime" },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} style={{ padding: "10px 14px", background: "#f9fafb", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                        <Icon size={14} color="#6b7280" />
                        <div>
                          <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
                          <div style={{ fontSize: 13, color: "#374151" }}>{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                      <Stethoscope size={11} style={{ verticalAlign: "middle", marginRight: 4 }} />Doctors & Specialists
                    </div>
                    {isLoadingDoc ? (
                      <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Loading…</p>
                    ) : hDoctors.length > 0 ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 8 }}>
                        {hDoctors.map((d) => (
                          <div key={d.id} style={{ padding: "10px 12px", background: ACCENT_LIGHT, border: `1px solid ${ACCENT_BORDER}`, borderRadius: 8 }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{d.name}</div>
                            <div style={{ fontSize: 11, color: ACCENT, marginTop: 2, fontWeight: 600 }}>{d.specialty}</div>
                            {d.department && <div style={{ fontSize: 11, color: "#6b7280" }}>{d.department}</div>}
                            <Link
                              href={buildAppointmentsHref({ hospitalName: h.name, city: h.city ?? "", doctor: d.name, specialty: d.specialty })}
                              onClick={(e) => e.stopPropagation()}
                              style={{ display: "inline-flex", alignItems: "center", gap: 3, marginTop: 7, fontSize: 11, fontWeight: 700, color: "#1d4ed8", textDecoration: "none" }}
                            >
                              <Calendar size={10} /> Portal booking
                            </Link>
                            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}>
                              <Clock size={10} /> Contact hospital for availability
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>No doctor info available. Visit the hospital directly.</p>
                    )}
                  </div>

                  <div style={{ padding: "12px 16px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 13 }}>
                      <strong style={{ color: "#1d4ed8" }}>Want an online appointment?</strong>
                      <span style={{ color: "#6b7280", marginLeft: 6 }}>Book with our verified portal counsellors.</span>
                    </div>
                    <Link href="/appointments" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", background: "#2563eb", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                      <Calendar size={13} /> Book Now
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {loaded && filtered.length === 0 && !loading && hospitals.length > 0 && (
          <div style={{ ...card, textAlign: "center", color: "#9ca3af", padding: 40 }}>
            <Search size={32} color="#d1d5db" style={{ marginBottom: 10 }} />
            <p style={{ margin: "0 0 8px" }}>No hospitals match the current filters.</p>
            <button onClick={() => { setCityFilter(""); setSpecialityFilter(""); setSearch(""); }} style={{ border: "none", background: "none", color: "#7c3aed", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
              Clear filters
            </button>
          </div>
        )}

        {loaded && hospitals.length === 0 && !loading && (
          <div style={{ ...card, textAlign: "center", color: "#9ca3af", padding: 40 }}>
            <Building2 size={32} color="#d1d5db" style={{ marginBottom: 10 }} />
            <p style={{ margin: 0 }}>No hospitals found for <strong>{state}</strong>. Apify may still be running — wait 1–2 min and retry.</p>
            <button onClick={() => loadForState(state)} style={{ marginTop: 12, padding: "8px 20px", background: ACCENT, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Retry
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
