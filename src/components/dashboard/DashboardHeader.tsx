import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, LifeBuoy, User } from 'lucide-react';
import styles from '../../styles/components/dashboard/DashboardHeader.module.css';
import { useAuth } from '../../context/AuthContext';

const DashboardHeader: React.FC = () => {
  const [currentDate, setCurrentDate] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.title}>
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className={styles.subtitle}>
            <Calendar size={16} aria-hidden />
            {currentDate}
          </p>
        </div>

        <div className={styles.actions}>
          <Link
            href="/contact"
            className={styles.iconLink}
            title="Help and contact"
            aria-label="Help and contact"
          >
            <LifeBuoy size={20} aria-hidden />
          </Link>
          <Link
            href="/dashboard/profile"
            className={styles.profileLink}
            aria-label="Your profile"
          >
            <User size={20} aria-hidden />
            <span>{user?.firstName || 'Profile'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
