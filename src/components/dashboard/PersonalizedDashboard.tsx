import React, { useState } from 'react';
import { Heart, Smile, Meh, Frown, TrendingUp, Calendar, MessageCircle } from 'lucide-react';
import styles from '../../styles/components/dashboard/PersonalizedDashboard.module.css';

interface PersonalizedDashboardProps {
  userName?: string;
}

const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({ userName = "Friend" }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showMoodSelector, setShowMoodSelector] = useState(true);

  const moodOptions = [
    { emoji: '😊', value: 'happy', label: 'Feeling Good', color: '#4ade80' },
    { emoji: '😐', value: 'neutral', label: 'Okay', color: '#fbbf24' },
    { emoji: '😞', value: 'sad', label: 'Having a Tough Day', color: '#f87171' },
  ];

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    setShowMoodSelector(false);
    // Here you would typically save to backend
    setTimeout(() => setShowMoodSelector(true), 5000); // Reset after 5 seconds
  };

  const getMoodMessage = (mood: string) => {
    switch (mood) {
      case 'happy':
        return "That's wonderful! Let's keep this positive energy flowing 💚";
      case 'neutral':
        return "That's perfectly okay. Sometimes we just need to be where we are 🌱";
      case 'sad':
        return "I'm here with you. You're not alone in this 💙";
      default:
        return "";
    }
  };

  return (
    <div className={styles.dashboard}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>
            Hi {userName}, how are you feeling today?
          </h1>
          <p className={styles.welcomeSubtitle}>
            Take a moment to check in with yourself. Your feelings matter.
          </p>
        </div>
        <div className={styles.welcomeIcon}>
          <Heart className={styles.heartIcon} />
        </div>
      </div>

      {/* Mood Selector */}
      {showMoodSelector && (
        <div className={styles.moodSelector}>
          <h3 className={styles.moodTitle}>How's your day going?</h3>
          <div className={styles.moodOptions}>
            {moodOptions.map((mood) => (
              <button
                key={mood.value}
                className={`${styles.moodButton} ${selectedMood === mood.value ? styles.selected : ''}`}
                onClick={() => handleMoodSelect(mood.value)}
                style={{ '--mood-color': mood.color } as React.CSSProperties}
              >
                <span className={styles.moodEmoji}>{mood.emoji}</span>
                <span className={styles.moodLabel}>{mood.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mood Response */}
      {selectedMood && (
        <div className={styles.moodResponse}>
          <div className={styles.moodMessage}>
            {getMoodMessage(selectedMood)}
          </div>
          <div className={styles.moodActions}>
            <button className={styles.actionButton}>
              <MessageCircle size={16} />
              Talk to Someone
            </button>
            <button className={styles.actionButton}>
              <TrendingUp size={16} />
              Track Progress
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h3 className={styles.actionsTitle}>What would help you right now?</h3>
        <div className={styles.actionGrid}>
          <div className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <Heart size={24} />
            </div>
            <h4>Calm Down</h4>
            <p>Breathing exercises and mindfulness</p>
          </div>
          <div className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <TrendingUp size={24} />
            </div>
            <h4>Boost Mood</h4>
            <p>Uplifting activities and journaling</p>
          </div>
          <div className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <MessageCircle size={24} />
            </div>
            <h4>Talk to Someone</h4>
            <p>24/7 support and peer chat</p>
          </div>
          <div className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <Calendar size={24} />
            </div>
            <h4>Track My Progress</h4>
            <p>Mood insights and growth journal</p>
          </div>
        </div>
      </div>

      {/* Affirmation Banner */}
      <div className={styles.affirmationBanner}>
        <div className={styles.affirmationContent}>
          <span className={styles.affirmationText}>
            You're not alone here 💚
          </span>
          <span className={styles.affirmationSubtext}>
            Small steps count, and every moment of self-care matters.
          </span>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedDashboard;
