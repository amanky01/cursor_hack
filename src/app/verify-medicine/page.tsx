"use client";

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { Pill, Upload, AlertTriangle, ImageIcon } from "lucide-react";
import styles from "@/styles/pages/VerifyMedicine.module.css";

export default function VerifyMedicinePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detected, setDetected] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [info, setInfo] = useState<Record<string, string> | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearPreview = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const setFile = useCallback(
    (file: File | null) => {
      clearPreview();
      setSelectedFile(file);
      if (file && file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      }
      setDetected(null);
      setName(null);
      setInfo(null);
      setDisclaimer(null);
      setError(null);
    },
    [clearPreview]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) setFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => setDragActive(false);

  async function analyze() {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setDetected(null);
    setName(null);
    setInfo(null);
    setDisclaimer(null);
    try {
      const fd = new FormData();
      fd.append("image", selectedFile);
      const res = await fetch("/api/verify-medicine", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setDetected(typeof data.detected_text === "string" ? data.detected_text : "");
      setName(typeof data.medicine_name === "string" ? data.medicine_name : null);
      setInfo(
        data.basic_info && typeof data.basic_info === "object"
          ? (data.basic_info as Record<string, string>)
          : null
      );
      setDisclaimer(typeof data.disclaimer === "string" ? data.disclaimer : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout title="Verify medicine - Sehat-Saathi" description="Upload a medicine package to identify it.">
      <div className={styles.page}>
        <div className={styles.topBar}>
          <Link href="/health" className={styles.backLink}>
            ← Back to Health tools
          </Link>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconBox} aria-hidden>
              <Pill size={26} strokeWidth={2} />
            </div>
            <div className={styles.titleBlock}>
              <h1 className={styles.cardTitle}>Verify Your Medicine</h1>
              <p className={styles.cardSubtitle}>Upload a medicine package to identify it</p>
            </div>
          </div>

          <div className={styles.warningBanner} role="status">
            <AlertTriangle className={styles.warningIcon} size={18} aria-hidden />
            <span>
              ⚠️ This is AI-generated information. Please consult a doctor. This platform provides
              general medical information and is not a substitute for professional medical advice.
            </span>
          </div>

          <div className={styles.split}>
            <div
              className={`${styles.uploadZone} ${dragActive ? styles.dragActive : ""}`}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                className={styles.hiddenInput}
                onChange={onInputChange}
                aria-label="Choose medicine image"
              />
              <div className={styles.uploadCircle}>
                <Upload size={28} strokeWidth={2} />
              </div>
              <div className={styles.uploadTitle}>Drag &amp; drop an image here</div>
              <p className={styles.uploadHint}>JPG or PNG — or tap to browse</p>
              <button
                type="button"
                className={styles.chooseBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                <ImageIcon size={18} />
                Choose file
              </button>
            </div>

            <div className={styles.previewBox}>
              {previewUrl ? (
                <img src={previewUrl} alt="Selected package preview" className={styles.previewImg} />
              ) : (
                <span className={styles.previewPlaceholder}>Preview will appear here</span>
              )}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.analyzeBtn}
              disabled={!selectedFile || loading}
              onClick={analyze}
            >
              {loading ? "Analyzing…" : "Analyze Medicine"}
            </button>
          </div>
        </div>

        <div className={styles.results}>
          {error && <p className={`${styles.errorText} ${styles.resultText}`}>{error}</p>}

          {detected !== null && !loading && (
            <div className={styles.resultCard}>
              <h2 className={styles.resultTitle}>Detected text</h2>
              <pre className={styles.resultText}>{detected}</pre>
            </div>
          )}

          {name && !loading && (
            <div className={styles.resultCard}>
              <h2 className={styles.resultTitle}>Matched medicine</h2>
              <p className={styles.resultText}>{name}</p>
            </div>
          )}

          {info && !loading && (
            <div className={styles.resultCard}>
              <p className={styles.resultText}>
                <strong>Uses:</strong> {info.uses}
              </p>
              <p className={styles.resultText}>
                <strong>Dosage:</strong> {info.dosage}
              </p>
              <p className={styles.resultText}>
                <strong>Side effects:</strong> {info.sideEffects}
              </p>
              <p className={styles.resultText}>
                <strong>Precautions:</strong> {info.precautions}
              </p>
            </div>
          )}

          {disclaimer && !loading && (
            <div className={styles.resultCard}>
              <p className={styles.resultText}>{disclaimer}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
