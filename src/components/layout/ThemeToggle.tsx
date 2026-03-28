"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import styles from "../../styles/components/layout/Header.module.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <span className={styles.themeToggleIcon} aria-hidden>
        {isDark ? "☀️" : "🌙"}
      </span>
    </button>
  );
}
