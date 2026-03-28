"use client";

import React, { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@cvx/_generated/api";
import AdminLayout from "@/components/admin/AdminLayout";
import CounsellorForm from "@/components/admin/CounsellorForm";
import CounsellorTable from "@/components/admin/CounsellorTable";
import type { Counsellor, CounsellorPayload } from "@/services/admin_service";

const CounsellorAdminPage: React.FC = () => {
  const counsellors = useQuery(api.adminCounsellors.listForAdmin, {});
  const deleteCounsellor = useMutation(api.adminCounsellors.deleteAsAdmin);
  const createCounsellor = useAction(api.adminCounsellors.createAsAdmin);
  const updateCounsellor = useAction(api.adminCounsellors.updateAsAdmin);

  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loading = counsellors === undefined;
  const list: Counsellor[] = (counsellors ?? []) as Counsellor[];

  const onCreate = async (values: CounsellorPayload) => {
    setSubmitting(true);
    setError("");
    try {
      await createCounsellor({
        firstName: values.firstName,
        lastName: values.lastName,
        contactNo: values.contactNo,
        email: values.email,
        password: values.password,
        qualifications: values.qualifications,
        specialization: values.specialization,
        availability: values.availability,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create counsellor");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this counsellor?")) return;
    try {
      await deleteCounsellor({ counsellorId: id as Counsellor["_id"] });
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  const onUpdate = async (id: string, updates: Partial<CounsellorPayload>) => {
    try {
      await updateCounsellor({
        counsellorId: id as Counsellor["_id"],
        firstName: updates.firstName,
        lastName: updates.lastName,
        contactNo: updates.contactNo,
        email: updates.email,
        qualifications: updates.qualifications,
        specialization: updates.specialization,
        availability: updates.availability,
        password:
          updates.password && updates.password.length > 0
            ? updates.password
            : undefined,
      });
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to update");
    }
  };

  return (
    <AdminLayout
      title="Manage Counsellors - Admin"
      description="Admin can manage counsellors"
    >
      <div style={{ display: "grid", gap: "2rem" }}>
        <section style={{ display: "grid", gap: 16 }}>
          <h1 style={{ margin: 0 }}>Manage Counsellors</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
            Uses Clerk + Convex. Set Clerk JWT template &quot;convex&quot; with
            claim{" "}
            <code>role: {'{{user.public_metadata.role}}'}</code> and Convex
            env <code>CLERK_JWT_ISSUER_DOMAIN</code>.
          </p>
          {error ? <p style={{ color: "red" }}>{error}</p> : null}
          <CounsellorTable
            items={list}
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
