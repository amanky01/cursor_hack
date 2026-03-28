"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp } from "@/animations/variants";

type MotionSectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export default function MotionSection({ children, className, id }: MotionSectionProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px", amount: 0.2 }}
      variants={fadeUp}
    >
      {children}
    </motion.section>
  );
}
