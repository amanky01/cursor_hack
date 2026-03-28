"use client";

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import NatureBackground from '../ui/NatureBackground';
import SaathiChatDock from '../saathi/SaathiChatDock';
import { pageEnter } from '@/animations/variants';
import styles from '../../styles/components/layout/Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  header?: React.ReactNode; // allow custom header override
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title: _title = 'Sehat-Saathi - Digital Psychological Intervention Platform',
  description: _description = 'A comprehensive digital platform for health and wellness—supportive care for people and families of all ages.',
  keywords: _keywords = 'mental health, psychological intervention, college students, therapy, counseling, mindfulness, CBT',
  header,
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
        <Footer />
        <SaathiChatDock />
      </div>
    </>
  );
};

export default Layout;
