"use client";

import React, { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import MotionSection from "@/components/ui/MotionSection";
import styles from "../../styles/components/home/Testimonials.module.css";

const testimonials = [
  {
    name: "Sarah Chen",
    university: "Bay Area",
    program: "Parent & professional",
    rating: 5,
    text: "Sehat-Saathi helped me manage my anxiety during a stressful time. The mindfulness exercises and CBT techniques were incredibly effective. I feel more confident and in control of my well-being.",
    avatar: "SC",
  },
  {
    name: "Michael Rodriguez",
    university: "Southern California",
    program: "Wellness seeker",
    rating: 5,
    text: "I was skeptical about digital health tools at first. Sehat-Saathi exceeded my expectations—the evidence-based approach and personalized tracking made a real difference in my stress levels.",
    avatar: "MR",
  },
  {
    name: "Emily Johnson",
    university: "New England",
    program: "Caregiver",
    rating: 5,
    text: "The supportive community on Sehat-Saathi has been invaluable. Connecting with others who understand has helped me feel less alone in my journey.",
    avatar: "EJ",
  },
  {
    name: "David Kim",
    university: "Midwest",
    program: "Retiree & volunteer",
    rating: 5,
    text: "The progress tracking feature helped me see real improvements in my mood and stress levels over time. The data-driven approach gave me confidence that the interventions were working.",
    avatar: "DK",
  },
];

const AUTO_MS = 5500;

const Testimonials: React.FC = () => {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return undefined;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [reduce]);

  const t = testimonials[index];

  return (
    <MotionSection className={styles.testimonials}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>What People Are Saying</h2>
          <p className={styles.subtitle}>
            Real stories from individuals and families who have found support with Sehat-Saathi.
          </p>
        </div>

        <div className={styles.carouselViewport}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={t.name + index}
              className={styles.testimonialCard}
              initial={reduce ? false : { opacity: 0, x: 28 }}
              animate={reduce ? undefined : { opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -28 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.quoteIcon}>
                <Quote size={24} />
              </div>
              <div className={styles.rating} aria-label={`${t.rating} out of 5 stars`}>
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={18} className={styles.star} fill="currentColor" />
                ))}
              </div>
              <p className={styles.testimonialText}>{t.text}</p>
              <div className={styles.author}>
                <div className={styles.avatar} aria-hidden>
                  {t.avatar}
                </div>
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>{t.name}</div>
                  <div className={styles.authorDetails}>
                    {t.program} • {t.university}
                  </div>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        <div className={styles.dots} aria-label="Testimonial slides">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
              aria-current={i === index ? "true" : undefined}
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </MotionSection>
  );
};

export default Testimonials;
