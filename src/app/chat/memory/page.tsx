"use client";

import Layout from "@/components/layout/Layout";
import MemorySaathiPanel from "@/components/saathi/MemorySaathiPanel";
import styles from "@/styles/components/saathi-chat.module.css";

export default function MemoryChatPage() {
  return (
    <Layout
      title="Saathi Memory - Sehat-Saathi"
      description="Signed-in mental health companion with conversation memory."
      hideFooter
    >
      <div className={styles.saathiLayoutHost}>
        <MemorySaathiPanel variant="full" layoutEmbedded />
      </div>
    </Layout>
  );
}
