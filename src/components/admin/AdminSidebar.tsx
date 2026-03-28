"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Users, Home, UserCheck, Calendar } from "lucide-react";

const itemStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  padding: "10px 12px",
  borderRadius: 8,
  color: "#1e3a5f",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 500,
  transition: "background 0.15s",
};
const activeStyle: React.CSSProperties = {
  background: "#dbeafe",
  color: "#1d4ed8",
  fontWeight: 700,
};

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}
const NavItem: React.FC<NavItemProps> = ({ href, icon, label, active }) => (
  <Link href={href} style={{ ...itemStyle, ...(active ? activeStyle : {}) }}>
    {icon} {label}
  </Link>
);

const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const is = (href: string) => pathname === href;

  return (
    <aside
      style={{
        width: 260,
        padding: 16,
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        borderRadius: 12,
        height: "fit-content",
        position: "sticky",
        top: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: "1px solid #bfdbfe",
        }}
      >
        <Shield size={18} color="#1d4ed8" />
        <strong style={{ color: "#1d4ed8", fontSize: 15 }}>Admin Panel</strong>
      </div>

      <nav style={{ display: "grid", gap: 4 }}>
        <NavItem href="/admin" icon={<Home size={16} />} label="Dashboard" active={is("/admin")} />
        <NavItem href="/admin/patients" icon={<UserCheck size={16} />} label="Patients" active={is("/admin/patients")} />
        <NavItem href="/admin/counsellors" icon={<Users size={16} />} label="Counsellors" active={is("/admin/counsellors")} />
        <NavItem href="/admin/appointments" icon={<Calendar size={16} />} label="Appointments" active={is("/admin/appointments")} />
      </nav>
    </aside>
  );
};

export default AdminSidebar;
