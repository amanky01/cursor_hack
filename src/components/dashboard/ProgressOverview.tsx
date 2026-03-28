import React from 'react';
import { TrendingUp, Calendar, Target, Award } from 'lucide-react';
import styles from '../../styles/components/dashboard/ProgressOverview.module.css';

const ProgressOverview: React.FC = () => {
  const progressData = [
    {
      title: 'Mood Score',
      value: '8.2',
      change: '+0.5',
      trend: 'up',
      icon: TrendingUp,
      color: 'var(--success-500)',
    },
    {
      title: 'Sessions Completed',
      value: '12',
      change: '+3 this week',
      trend: 'up',
      icon: Calendar,
      color: 'var(--primary-500)',
    },
    {
      title: 'Goals Achieved',
      value: '8/10',
      change: '80%',
      trend: 'up',
      icon: Target,
      color: 'var(--secondary-500)',
    },
    {
      title: 'Streak',
      value: '7 days',
      change: 'Keep it up!',
      trend: 'up',
      icon: Award,
      color: 'var(--warning-500)',
    },
  ];

  return (
    <div className={styles.progressOverview}>
      <div className={styles.header}>
        <h2 className={styles.title}>Your Progress</h2>
        <p className={styles.subtitle}>Track your mental health journey</p>
      </div>

      <div className={styles.grid}>
        {progressData.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className={styles.progressCard}>
              <div className={styles.cardHeader}>
                <div className={styles.iconContainer} style={{ backgroundColor: `${item.color}15` }}>
                  <Icon size={24} style={{ color: item.color }} />
                </div>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <div className={styles.cardValue}>{item.value}</div>
                </div>
              </div>
              <div className={styles.cardFooter}>
                <span className={`${styles.change} ${styles[item.trend]}`}>
                  {item.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressOverview;
