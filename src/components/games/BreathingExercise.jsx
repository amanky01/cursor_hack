"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import styles from "@/styles/components/games/BreathingExercise.module.css";

const PHASES = [
  { label: "Breathe in...", duration: 4, scale: 1.22 },
  { label: "Hold...", duration: 4, scale: 1.22 },
  { label: "Breathe out...", duration: 6, scale: 0.82 },
];

/**
 * Simple breathing circle: 4s inhale, 4s hold, 6s exhale.
 */
export default function BreathingExercise() {
  const reduceMotion = useReducedMotion();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const phase = PHASES[phaseIndex];

  useEffect(() => {
    if (reduceMotion) return undefined;
    const t = window.setTimeout(() => {
      setPhaseIndex((i) => (i + 1) % PHASES.length);
    }, phase.duration * 1000);
    return () => window.clearTimeout(t);
  }, [phase.duration, phaseIndex, reduceMotion]);

  const scale = reduceMotion ? 1 : phase.scale;

  return (
    <div className={styles.wrap} role="region" aria-label="Breathing exercise">
      <p className={styles.phase} key={phase.label}>
        {phase.label}
      </p>
      <div className={styles.ringOuter}>
        <motion.div
          className={styles.ring}
          animate={{ scale }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: phase.duration, ease: [0.45, 0, 0.55, 1] }
          }
        />
        <div className={styles.core} aria-hidden />
      </div>
      <p className={styles.hint}>Follow the circle at your own pace. Pause anytime.</p>
    </div>
  );
}
