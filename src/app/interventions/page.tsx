"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import { Brain, Heart, Users, BookOpen, Clock, CheckCircle } from 'lucide-react';
import styles from '@/styles/pages/Interventions.module.css';

const InterventionsPage: React.FC = () => {
  const interventions = [
    {
      id: 'cbt',
      title: 'Cognitive Behavioral Therapy (CBT)',
      description: 'Learn to identify and change negative thought patterns that contribute to anxiety and depression.',
      icon: Brain,
      duration: '6 weeks',
      sessions: '12 sessions',
      difficulty: 'Beginner',
      color: 'var(--primary-500)',
    },
    {
      id: 'mindfulness',
      title: 'Mindfulness & Meditation',
      description: 'Develop present-moment awareness and stress reduction techniques through guided practices.',
      icon: Heart,
      duration: '4 weeks',
      sessions: '8 sessions',
      difficulty: 'Beginner',
      color: 'var(--secondary-500)',
    },
    {
      id: 'social-support',
      title: 'Social Support Network',
      description: 'Build connections and peer support relationships in a safe, moderated environment.',
      icon: Users,
      duration: '8 weeks',
      sessions: '16 sessions',
      difficulty: 'Beginner',
      color: 'var(--accent-teal)',
    },
    {
      id: 'stress-management',
      title: 'Stress Management',
      description: 'Learn evidence-based techniques for managing academic and personal stress.',
      icon: BookOpen,
      duration: '3 weeks',
      sessions: '6 sessions',
      difficulty: 'Beginner',
      color: 'var(--accent-lavender)',
    },
  ];

  const features = [
    {
      icon: Clock,
      title: 'Self-Paced Learning',
      description: 'Complete sessions at your own pace, whenever it works for you.',
    },
    {
      icon: CheckCircle,
      title: 'Evidence-Based',
      description: 'All interventions are based on scientific research and proven methodologies.',
    },
    {
      icon: Users,
      title: 'Peer Support',
      description: 'Connect with other students on similar mental health journeys.',
    },
  ];

  return (
    <Layout
      title="Interventions - Sehat-Saathi"
      description="Explore our evidence-based psychological interventions designed specifically for college students."
    >
      <div className={styles.interventions}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.container}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>Evidence-Based Interventions</h1>
              <p className={styles.heroSubtitle}>
                Discover our comprehensive collection of psychological interventions 
                designed to support your mental health journey.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <div className={styles.container}>
            <div className={styles.featuresGrid}>
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className={styles.featureCard}>
                    <div className={styles.featureIcon}>
                      <Icon size={32} />
                    </div>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureDescription}>{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Interventions Grid */}
        <section className={styles.interventionsSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Available Interventions</h2>
              <p className={styles.sectionSubtitle}>
                Choose from our carefully curated selection of evidence-based programs
              </p>
            </div>

            <div className={styles.interventionsGrid}>
              {interventions.map((intervention) => {
                const Icon = intervention.icon;
                return (
                  <div key={intervention.id} className={styles.interventionCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.iconContainer} style={{ backgroundColor: `${intervention.color}15` }}>
                        <Icon size={40} style={{ color: intervention.color }} />
                      </div>
                      <div className={styles.cardInfo}>
                        <h3 className={styles.cardTitle}>{intervention.title}</h3>
                        <p className={styles.cardDescription}>{intervention.description}</p>
                      </div>
                    </div>

                    <div className={styles.cardDetails}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Duration:</span>
                        <span className={styles.detailValue}>{intervention.duration}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Sessions:</span>
                        <span className={styles.detailValue}>{intervention.sessions}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Level:</span>
                        <span className={styles.detailValue}>{intervention.difficulty}</span>
                      </div>
                    </div>

                    <button className={styles.startButton}>
                      Start Intervention
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default InterventionsPage;
