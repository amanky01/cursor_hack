import React, { useState } from 'react';
import { CounsellorPayload } from '../../services/admin_service';

interface Props {
  onSubmit: (values: CounsellorPayload) => Promise<void> | void;
  submitting?: boolean;
}

const defaultState: CounsellorPayload = {
  firstName: '',
  lastName: '',
  contactNo: 0,
  email: '',
  password: '',
  qualifications: '',
  specialization: [],
  availability: '',
};

const fieldStyle: React.CSSProperties = { display: 'grid', gap: 6 };
const labelStyle: React.CSSProperties = { fontWeight: 600 };
const inputStyle: React.CSSProperties = { padding: '8px 10px', borderRadius: 6, border: '1px solid #d0d7de' };
const sectionStyle: React.CSSProperties = { background: '#fff', border: '1px solid #eaeef2', borderRadius: 10, padding: 16 };

const CounsellorForm: React.FC<Props> = ({ onSubmit, submitting }) => {
  const [form, setForm] = useState<CounsellorPayload>(defaultState);
  const [error, setError] = useState<string>('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'contactNo') {
      setForm({ ...form, contactNo: Number(value) });
    } else if (name === 'specialization') {
      const arr = value.split(',').map(s => s.trim()).filter(Boolean);
      setForm({ ...form, specialization: arr });
    } else {
      setForm({ ...form, [name]: value } as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Please fill all required fields');
      return;
    }
    try {
      await onSubmit(form);
      setForm(defaultState);
    } catch (e: any) {
      setError(e?.message || 'Failed to submit');
    }
  };

  return (
    <section style={sectionStyle}>
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>Add New Counsellor</h3>
      {error ? <p style={{ color: 'red' }}>{error}</p> : null}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>First name*</label>
            <input name="firstName" value={form.firstName} onChange={onChange} style={inputStyle} required />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Last name*</label>
            <input name="lastName" value={form.lastName} onChange={onChange} style={inputStyle} required />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Email*</label>
            <input name="email" type="email" value={form.email} onChange={onChange} style={inputStyle} required />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Contact No*</label>
            <input name="contactNo" type="number" value={form.contactNo || ''} onChange={onChange} style={inputStyle} required />
          </div>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Password*</label>
          <input name="password" type="password" value={form.password} onChange={onChange} style={inputStyle} required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Qualifications*</label>
            <input name="qualifications" value={form.qualifications} onChange={onChange} style={inputStyle} required />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Availability*</label>
            <input name="availability" value={form.availability} onChange={onChange} style={inputStyle} required />
          </div>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Specializations (comma separated)</label>
          <input name="specialization" onChange={onChange} style={inputStyle} placeholder="Stress, Career Guidance" />
        </div>
        <div>
          <button type="submit" disabled={submitting} style={{ background: '#0d6efd', color: '#fff', padding: '10px 14px', border: 'none', borderRadius: 6 }}>
            {submitting ? 'Creating...' : 'Create Counsellor'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CounsellorForm;
