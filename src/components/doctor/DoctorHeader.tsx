"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { Stethoscope, LogOut, LayoutDashboard, Users, Calendar } from "lucide-react";

const bar: React.CSSProperties = {
  background: "#064e3b",
  borderBottom: "1px solid #059669",
  position: "sticky",
  top: 0,
  zIndex: 40,
};
const inner: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "10px 16px",
  display: "flex",
  alignItems: "center",
  gap: 12,
  justifyContent: "space-between",
};
const link: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px",
  borderRadius: 8,
  color: "#a7f3d0",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 500,
};
const logoutBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 14px",
  borderRadius: 8,
  background: "#059669",
  color: "#fff",
  border: "none",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const DoctorHeader: React.FC = () => {
  const { logout, user } = useAuth();
  return (
    <header style={bar}>
      <div style={inner}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/doctor" style={{ ...link, color: "#fff", fontWeight: 800, fontSize: 15 }}>
            <Stethoscope size={18} color="#6ee7b7" /> Doctor Portal
          </Link>
          <nav style={{ display: "flex", gap: 4 }}>
            <Link href="/doctor" style={link}><LayoutDashboard size={15} /> Dashboard</Link>
            <Link href="/doctor/patients" style={link}><Users size={15} /> Patients</Link>
            <Link href="/doctor/appointments" style={link}><Calendar size={15} /> Appointments</Link>
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#6ee7b7", fontSize: 13 }}>Dr. {user?.firstName || "Doctor"}</span>
          <button onClick={logout} style={logoutBtn}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default DoctorHeader;
