"use client";

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import NatureBackground from '../ui/NatureBackground';
import ChatButton from '../ui/ChatButton';
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
  return (
    <>
      <div className={styles.layout}>
        <NatureBackground />
        {header ? header : <Header />}
        <main className={styles.main}>
          {children}
        </main>
        <Footer />
        <ChatButton />
      </div>
    </>
  );
};

export default Layout;
