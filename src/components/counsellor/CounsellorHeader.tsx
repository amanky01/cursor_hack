import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, LogOut, LayoutDashboard, Users } from 'lucide-react';

const bar: React.CSSProperties = { background: '#ffffffcc', backdropFilter: 'saturate(180%) blur(8px)', borderBottom: '1px solid #eaeef2', position: 'sticky', top: 0, zIndex: 40 };
const inner: React.CSSProperties = { maxWidth: 1200, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' };
const left: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10 };
const right: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10 };
const link: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, color: '#0f172a', textDecoration: 'none' };
const primary: React.CSSProperties = { background: '#059669', color: '#fff' };

const CounsellorHeader: React.FC = () => {
  const { logout, user } = useAuth();
  return (
    <header style={bar}>
      <div style={inner}>
        <div style={left}>
          <Link href="/counsellor" style={{ ...link, fontWeight: 700 }}>
            <Stethoscope size={18} /> Counsellor
          </Link>
          <nav style={{ display: 'flex', gap: 8 }}>
            <Link href="/counsellor" style={link}><LayoutDashboard size={16} /> Dashboard</Link>
            <a href="#" style={link} onClick={(e) => e.preventDefault()}><Users size={16} /> My Students</a>
          </nav>
        </div>
        <div style={right}>
          <span style={{ opacity: 0.7, marginRight: 6 }}>{user?.firstName || 'counsellor'}</span>
          <button onClick={logout} style={{ ...link, ...primary, border: 'none' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default CounsellorHeader;
