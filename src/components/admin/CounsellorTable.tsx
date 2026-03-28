import React, { useState } from 'react';
import { Counsellor, CounsellorPayload } from '../../services/admin_service';

interface Props {
  items: Counsellor[];
  loading?: boolean;
  onDelete: (id: string) => Promise<void> | void;
  onUpdate: (id: string, updates: Partial<CounsellorPayload>) => Promise<void> | void;
}

const th: React.CSSProperties = { textAlign: 'left', borderBottom: '1px solid #eaeef2', padding: 10, background: '#f8fafc' };
const td: React.CSSProperties = { padding: 10, borderBottom: '1px solid #f2f4f7' };
const iconBtn: React.CSSProperties = { padding: '6px 10px', borderRadius: 6, border: '1px solid #d0d7de', background: '#fff', cursor: 'pointer' };

const CounsellorTable: React.FC<Props> = ({ items, loading, onDelete, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Partial<CounsellorPayload>>({});
  const [saving, setSaving] = useState(false);

  const startEdit = (c: Counsellor) => {
    setEditingId(c._id);
    setEdit({
      firstName: c.firstName,
      lastName: c.lastName,
      contactNo: c.contactNo,
      email: c.email,
      qualifications: c.qualifications,
      specialization: c.specialization || [],
      availability: c.availability,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEdit({});
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      const payload = { ...edit } as Partial<CounsellorPayload>;
      if (typeof payload.contactNo === 'string') {
        payload.contactNo = Number(payload.contactNo);
      }
      await onUpdate(id, payload);
      cancelEdit();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ overflowX: 'auto', border: '1px solid #eaeef2', borderRadius: 10, background: '#fff' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Name</th>
            <th style={th}>Email</th>
            <th style={th}>Contact</th>
            <th style={th}>Qualifications</th>
            <th style={th}>Availability</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={6} style={td}>Loading...</td>
            </tr>
          )}
          {!loading && items.length === 0 && (
            <tr>
              <td colSpan={6} style={td}>No counsellors found.</td>
            </tr>
          )}
          {items.map((c) => {
            const isEditing = editingId === c._id;
            return (
              <tr key={c._id}>
                <td style={td}>
                  {isEditing ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      <input
                        value={edit.firstName ?? ''}
                        onChange={(e) => setEdit({ ...edit, firstName: e.target.value })}
                      />
                      <input
                        value={edit.lastName ?? ''}
                        onChange={(e) => setEdit({ ...edit, lastName: e.target.value })}
                      />
                    </div>
                  ) : (
                    <>{c.firstName} {c.lastName}</>
                  )}
                </td>
                <td style={td}>
                  {isEditing ? (
                    <input
                      value={edit.email ?? ''}
                      onChange={(e) => setEdit({ ...edit, email: e.target.value })}
                    />
                  ) : (
                    c.email
                  )}
                </td>
                <td style={td}>
                  {isEditing ? (
                    <input
                      type="number"
                      value={edit.contactNo as any ?? ''}
                      onChange={(e) => setEdit({ ...edit, contactNo: Number(e.target.value) })}
                    />
                  ) : (
                    c.contactNo
                  )}
                </td>
                <td style={td}>
                  {isEditing ? (
                    <input
                      value={edit.qualifications ?? ''}
                      onChange={(e) => setEdit({ ...edit, qualifications: e.target.value })}
                    />
                  ) : (
                    c.qualifications
                  )}
                </td>
                <td style={td}>
                  {isEditing ? (
                    <input
                      value={edit.availability ?? ''}
                      onChange={(e) => setEdit({ ...edit, availability: e.target.value })}
                    />
                  ) : (
                    c.availability
                  )}
                </td>
                <td style={td}>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ ...iconBtn, background: '#0d6efd', color: '#fff', borderColor: '#0d6efd' }} disabled={saving} onClick={() => saveEdit(c._id)}>
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button style={iconBtn} onClick={cancelEdit}>Cancel</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={iconBtn} onClick={() => startEdit(c)}>Edit</button>
                      <button style={{ ...iconBtn, background: '#d9534f', color: '#fff', borderColor: '#d9534f' }} onClick={() => onDelete(c._id)}>Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CounsellorTable;
