import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Stethoscope, Home, Users, Calendar } from 'lucide-react';

const itemStyle: React.CSSProperties = { display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', borderRadius: 8, color: '#0f172a', textDecoration: 'none' };
const activeStyle: React.CSSProperties = { background: '#ecfeff', color: '#0891b2' };

const CounsellorSidebar: React.FC = () => {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <aside style={{ width: 260, padding: 16, borderRight: '1px solid #eaeef2', background: '#ffffff', borderRadius: 12, height: 'fit-content', position: 'sticky', top: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Stethoscope size={18} />
        <strong>Counsellor</strong>
      </div>
      <nav style={{ display: 'grid', gap: 6 }}>
        <Link href="/counsellor" style={{ ...itemStyle, ...(isActive('/counsellor') ? activeStyle : {}) }}>
          <Home size={16} /> Dashboard
        </Link>
        <a href="#" style={itemStyle} onClick={(e) => e.preventDefault()}>
          <Users size={16} /> My Students (coming soon)
        </a>
        <a href="#" style={itemStyle} onClick={(e) => e.preventDefault()}>
          <Calendar size={16} /> Appointments (coming soon)
        </a>
      </nav>
    </aside>
  );
};

export default CounsellorSidebar;
