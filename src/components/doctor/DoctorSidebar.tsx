"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope, Home, Users, Calendar } from "lucide-react";

const itemStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  padding: "10px 12px",
  borderRadius: 8,
  color: "#064e3b",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 500,
  transition: "background 0.15s",
};
const activeStyle: React.CSSProperties = {
  background: "#d1fae5",
  color: "#059669",
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

const DoctorSidebar: React.FC = () => {
  const pathname = usePathname();
  const is = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      style={{
        width: 260,
        padding: 16,
        background: "#ecfdf5",
        border: "1px solid #a7f3d0",
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
          borderBottom: "1px solid #a7f3d0",
        }}
      >
        <Stethoscope size={18} color="#059669" />
        <strong style={{ color: "#059669", fontSize: 15 }}>Doctor Portal</strong>
      </div>

      <nav style={{ display: "grid", gap: 4 }}>
        <NavItem href="/doctor" icon={<Home size={16} />} label="Dashboard" active={pathname === "/doctor"} />
        <NavItem href="/doctor/patients" icon={<Users size={16} />} label="My Patients" active={is("/doctor/patients")} />
        <NavItem href="/doctor/appointments" icon={<Calendar size={16} />} label="Appointments" active={is("/doctor/appointments")} />
      </nav>
    </aside>
  );
};

export default DoctorSidebar;
