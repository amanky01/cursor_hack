"use client";

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import adminService, { Counsellor, CounsellorPayload } from '@/services/admin_service';
import CounsellorForm from '@/components/admin/CounsellorForm';
import CounsellorTable from '@/components/admin/CounsellorTable';

const CounsellorAdminPage: React.FC = () => {
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.listCounsellors();
      if (res.success) setCounsellors(res.counsellors);
    } catch (e: any) {
      setError(e?.message || 'Failed to load counsellors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (values: CounsellorPayload) => {
    setSubmitting(true);
    setError('');
    try {
      await adminService.createCounsellor(values);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to create counsellor');
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this counsellor?')) return;
    try {
      await adminService.deleteCounsellor(id);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Failed to delete');
    }
  };

  const onUpdate = async (id: string, updates: Partial<CounsellorPayload>) => {
    try {
      await adminService.updateCounsellor(id, updates);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Failed to update');
    }
  };

  return (
    <AdminLayout title="Manage Counsellors - Admin" description="Admin can manage counsellors">
      <div style={{ display: 'grid', gap: '2rem' }}>
        <section style={{ display: 'grid', gap: 16 }}>
          <h1 style={{ margin: 0 }}>Manage Counsellors</h1>
          {error ? <p style={{ color: 'red' }}>{error}</p> : null}
          <CounsellorTable
            items={counsellors}
            loading={loading}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        </section>

        <CounsellorForm onSubmit={onCreate} submitting={submitting} />
      </div>
    </AdminLayout>
  );
};

export default CounsellorAdminPage;
