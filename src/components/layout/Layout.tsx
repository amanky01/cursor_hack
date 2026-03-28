"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import NatureBackground from '../ui/NatureBackground';
import { pageEnter } from '@/animations/variants';
import styles from '../../styles/components/layout/Layout.module.css';

/** Client-only: uses Convex `useMutation` — skip SSR when Convex URL is absent at build time. */
const SaathiChatDock = dynamic(() => import('../saathi/SaathiChatDock'), {
  ssr: false,
});

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  header?: React.ReactNode; // allow custom header override
  /** Hide the marketing site footer (e.g. full-page Saathi chat). */
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title: _title = 'Sehat-Saathi - Digital Psychological Intervention Platform',
  description: _description = 'A comprehensive digital platform for health and wellness—supportive care for people and families of all ages.',
  keywords: _keywords = 'mental health, psychological intervention, college students, therapy, counseling, mindfulness, CBT',
  header,
  hideFooter = false,
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <div className={styles.layout}>
        <NatureBackground />
        {header ? header : <Header />}
        <motion.main
          className={styles.main}
          initial={reduceMotion ? false : pageEnter.initial}
          animate={reduceMotion ? undefined : pageEnter.animate}
        >
          {children}
        </motion.main>
        {!hideFooter ? <Footer /> : null}
        <SaathiChatDock />
      </div>
    </>
  );
};

export default Layout;
