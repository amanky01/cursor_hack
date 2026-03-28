"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";

/**
 * @param {import('framer-motion').UseInViewOptions} [options]
 * @returns {{ ref: React.RefObject<HTMLElement | null>, isInView: boolean }}
 */
export function useScrollAnimation(options = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-80px",
    ...options,
  });
  return { ref, isInView };
}
