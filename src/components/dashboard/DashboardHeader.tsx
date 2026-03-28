import React, { useState, useEffect } from 'react';
import { Calendar, Bell, Settings, User } from 'lucide-react';
import styles from '../../styles/components/dashboard/DashboardHeader.module.css';
import { useAuth } from '../../context/AuthContext';

const DashboardHeader: React.FC = () => {
  const [currentDate, setCurrentDate] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }));
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.title}>
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className={styles.subtitle}>
            <Calendar size={16} />
            {currentDate}
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.actionButton}>
            <Bell size={20} />
            <span className={styles.notificationBadge}>3</span>
          </button>
          <button className={styles.actionButton}>
            <Settings size={20} />
          </button>
          <button className={styles.profileButton}>
            <User size={20} />
            <span>{user?.firstName || 'Profile'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
