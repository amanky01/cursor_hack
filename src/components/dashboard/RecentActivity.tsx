import React from 'react';
import { Clock, CheckCircle, Play, BookOpen } from 'lucide-react';
import styles from '../../styles/components/dashboard/RecentActivity.module.css';

const RecentActivity: React.FC = () => {
  const activities = [
    {
      id: 1,
      type: 'session',
      title: 'Completed CBT Session 3',
      description: 'Thought challenging exercise',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'var(--success-500)',
    },
    {
      id: 2,
      type: 'meditation',
      title: 'Mindfulness Meditation',
      description: '10-minute breathing exercise',
      time: '1 day ago',
      icon: Play,
      color: 'var(--primary-500)',
    },
    {
      id: 3,
      type: 'reading',
      title: 'Read Article: Stress Management',
      description: 'Understanding stress triggers',
      time: '2 days ago',
      icon: BookOpen,
      color: 'var(--secondary-500)',
    },
    {
      id: 4,
      type: 'session',
      title: 'Completed CBT Session 2',
      description: 'Cognitive restructuring',
      time: '3 days ago',
      icon: CheckCircle,
      color: 'var(--success-500)',
    },
  ];

  return (
    <div className={styles.recentActivity}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Activity</h2>
        <p className={styles.subtitle}>Your latest mental health activities</p>
      </div>

      <div className={styles.activityList}>
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className={styles.activityItem}>
              <div className={styles.activityIcon} style={{ backgroundColor: `${activity.color}15` }}>
                <Icon size={20} style={{ color: activity.color }} />
              </div>
              <div className={styles.activityContent}>
                <h3 className={styles.activityTitle}>{activity.title}</h3>
                <p className={styles.activityDescription}>{activity.description}</p>
                <div className={styles.activityTime}>
                  <Clock size={14} />
                  <span>{activity.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
