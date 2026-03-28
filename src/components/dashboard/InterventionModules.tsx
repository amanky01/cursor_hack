import React from 'react';
import Link from 'next/link';
import { Brain, Heart, Users, BookOpen, ArrowRight } from 'lucide-react';
import styles from '../../styles/components/dashboard/InterventionModules.module.css';

const InterventionModules: React.FC = () => {
  const modules = [
    {
      id: 'saathi',
      title: 'Talk with Saathi',
      description:
        'Explore thoughts and feelings in a private chat. Not a substitute for therapy, but a supportive space.',
      icon: Brain,
      href: '/saathi',
      cta: 'Open Saathi',
      color: 'var(--primary-500)',
    },
    {
      id: 'wellbeing-tools',
      title: 'Calm & body tools',
      description:
        'Breathing exercises and on-device wellness tools to ease stress in the moment.',
      icon: Heart,
      href: '/health',
      cta: 'Go to health tools',
      color: 'var(--primary-600)',
    },
    {
      id: 'human-support',
      title: 'Reach someone',
      description:
        'Contact the team or book care when you want a real person in the loop.',
      icon: Users,
      href: '/contact',
      cta: 'Contact & help',
      color: 'var(--success-500)',
    },
    {
      id: 'learn-screen',
      title: 'Learn & screen',
      description:
        'Curated reads plus optional PHQ-9, GAD-7, and GHQ-12 self-checks (informational only).',
      icon: BookOpen,
      href: '/resources?assessments=1',
      cta: 'Resources & assessments',
      color: 'var(--warning-500)',
    },
  ];

  return (
    <div className={styles.interventionModules}>
      <div className={styles.header}>
        <h2 className={styles.title}>Ways to support your mental health</h2>
        <p className={styles.subtitle}>
          Pick what fits today — each link goes to a real feature in Sehat-Saathi
        </p>
      </div>

      <div className={styles.grid}>
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <div key={module.id} className={styles.moduleCard}>
              <div className={styles.cardHeader}>
                <div
                  className={styles.iconContainer}
                  style={{ backgroundColor: `${module.color}15` }}
                >
                  <Icon size={28} style={{ color: module.color }} />
                </div>
                <div className={styles.moduleInfo}>
                  <h3 className={styles.moduleTitle}>{module.title}</h3>
                  <p className={styles.moduleDescription}>{module.description}</p>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <Link
                  href={module.href}
                  className={styles.ctaLink}
                  style={{ color: module.color }}
                >
                  {module.cta}
                  <ArrowRight size={18} aria-hidden />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InterventionModules;
