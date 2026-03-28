"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Users, Heart, TrendingUp, Award } from "lucide-react";
import MotionSection from "@/components/ui/MotionSection";
import { useCountUp } from "@/hooks/useCountUp";
import { fadeUpItem, staggerContainer } from "@/animations/variants";
import styles from "../../styles/components/home/Stats.module.css";

function parseStat(raw: string): {
  target: number;
  decimals: number;
  format: (n: number) => string;
} {
  if (raw.includes("/")) {
    return {
      target: 4.9,
      decimals: 1,
      format: (n) => `${n.toFixed(1)}/5`,
    };
  }
  if (raw.endsWith("%")) {
    const n = parseFloat(raw.replace("%", ""));
    return {
      target: n,
      decimals: 0,
      format: (v) => `${Math.round(v)}%`,
    };
  }
  if (raw.endsWith("+")) {
    const digits = raw.replace(/[^0-9]/g, "");
    return {
      target: parseInt(digits, 10) || 0,
      decimals: 0,
      format: (v) => `${Math.round(v).toLocaleString()}+`,
    };
  }
  return { target: 0, decimals: 0, format: () => raw };
}

function StatCard({
  icon: Icon,
  value,
  label,
  description,
}: {
  icon: typeof Users;
  value: string;
  label: string;
  description: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px", amount: 0.3 });
  const reduce = useReducedMotion();
  const { target, decimals, format } = parseStat(value);
  const count = useCountUp(target, reduce ? 80 : 1800, inView, decimals);

  return (
    <motion.div
      ref={ref}
      className={styles.statCard}
      variants={reduce ? undefined : fadeUpItem}
      whileHover={
        reduce
          ? undefined
          : {
              y: -6,
              transition: { duration: 0.25 },
            }
      }
    >
      <div className={styles.iconContainer}>
        <Icon size={40} />
      </div>
      <div className={styles.statValue}>{format(count)}</div>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statDescription}>{description}</div>
    </motion.div>
  );
}

const Stats: React.FC = () => {
  const reduce = useReducedMotion();
  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: "People Helped",
      description: "Individuals and families across multiple communities",
    },
    {
      icon: Heart,
      value: "95%",
      label: "Satisfaction Rate",
      description: "Users report improved well-being and peace of mind",
    },
    {
      icon: TrendingUp,
      value: "85%",
      label: "Success Rate",
      description: "Complete intervention programs",
    },
    {
      icon: Award,
      value: "4.9/5",
      label: "Platform Rating",
      description: "Based on user reviews and feedback",
    },
  ];

  return (
    <MotionSection className={styles.stats}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <h2 className={styles.title}>Trusted by People Nationwide</h2>
          <p className={styles.subtitle}>
            Join thousands of people improving their health and well-being with Sehat-Saathi.
          </p>
        </motion.div>

        <motion.div
          className={styles.grid}
          variants={reduce ? undefined : staggerContainer}
          initial={reduce ? undefined : "hidden"}
          whileInView={reduce ? undefined : "visible"}
          viewport={{ once: true, margin: "-60px" }}
        >
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </motion.div>
      </div>
    </MotionSection>
  );
};

export default Stats;
