"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { Shield, LogOut, Users, LayoutDashboard, UserCheck, Calendar } from "lucide-react";

const bar: React.CSSProperties = {
  background: "#1e3a5f",
  borderBottom: "1px solid #1d4ed8",
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
  color: "#bfdbfe",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 500,
  transition: "color 0.15s",
};
const logoutBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 14px",
  borderRadius: 8,
  background: "#1d4ed8",
  color: "#fff",
  border: "none",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const AdminHeader: React.FC = () => {
  const { logout, user } = useAuth();
  return (
    <header style={bar}>
      <div style={inner}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/admin" style={{ ...link, color: "#fff", fontWeight: 800, fontSize: 15 }}>
            <Shield size={18} color="#60a5fa" /> Admin Portal
          </Link>
          <nav style={{ display: "flex", gap: 4 }}>
            <Link href="/admin" style={link}><LayoutDashboard size={15} /> Dashboard</Link>
            <Link href="/admin/patients" style={link}><UserCheck size={15} /> Patients</Link>
            <Link href="/admin/counsellors" style={link}><Users size={15} /> Counsellors</Link>
            <Link href="/admin/appointments" style={link}><Calendar size={15} /> Appointments</Link>
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#93c5fd", fontSize: 13 }}>{user?.firstName || "Admin"}</span>
          <button onClick={logout} style={logoutBtn}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
