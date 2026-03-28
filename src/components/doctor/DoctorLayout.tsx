"use client";

import React from "react";
import Layout from "../layout/Layout";
import DoctorSidebar from "./DoctorSidebar";
import DoctorHeader from "./DoctorHeader";
import { DoctorJwtGate } from "../staff/DoctorJwtGate";

interface Props {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

const containerStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "260px 1fr",
  gap: 16,
  padding: "1rem 0",
  minHeight: "100%",
};

const mainCard: React.CSSProperties = {
  background: "#f0fdf9",
  border: "1px solid #a7f3d0",
  borderRadius: 12,
  padding: 20,
  minHeight: "100%",
};

const DoctorLayout: React.FC<Props> = ({ title, description, children }) => {
  return (
    <DoctorJwtGate>
      <Layout title={title} description={description} header={<DoctorHeader />}>
        <div style={containerStyle}>
          <DoctorSidebar />
          <div style={mainCard}>{children}</div>
        </div>
      </Layout>
    </DoctorJwtGate>
  );
};

export default DoctorLayout;
