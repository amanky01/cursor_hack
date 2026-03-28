import React, { useState } from 'react';
import { Heart, Smile, Meh, Frown, Droplets } from 'lucide-react';
import styles from '../../styles/components/home/MoodCheckInWidget.module.css';

interface MoodCheckInWidgetProps {
  onMoodSelect?: (mood: string) => void;
}

const MoodCheckInWidget: React.FC<MoodCheckInWidgetProps> = ({ onMoodSelect }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const moodOptions = [
    { emoji: '😊', value: 'happy', label: 'Great!', icon: Smile, color: '#4ade80' },
    { emoji: '😐', value: 'neutral', label: 'Okay', icon: Meh, color: '#fbbf24' },
    { emoji: '😞', value: 'sad', label: 'Tough day', icon: Frown, color: '#f87171' },
    { emoji: '😔', value: 'down', label: 'Feeling low', icon: Droplets, color: '#a78bfa' },
    { emoji: '😍', value: 'amazing', label: 'Amazing!', icon: Heart, color: '#f472b6' },
  ];

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    onMoodSelect?.(mood);
    setIsSubmitted(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setSelectedMood(null);
    }, 3000);
  };

  const getEncouragementMessage = (mood: string) => {
    switch (mood) {
      case 'happy':
        return "That's wonderful! Your positive energy is beautiful 💚";
      case 'amazing':
        return "You're radiating joy! Keep shining ✨";
      case 'neutral':
        return "That's perfectly okay. Sometimes we just need to be where we are 🌱";
      case 'sad':
        return "I'm here with you. You're stronger than you know 💙";
      case 'down':
        return "It's okay to feel this way. You're not alone 🤗";
      default:
        return "";
    }
  };

  if (isSubmitted && selectedMood) {
    return (
      <div className={styles.widget}>
        <div className={styles.submittedContent}>
          <div className={styles.encouragementMessage}>
            {getEncouragementMessage(selectedMood)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <Heart className={styles.heartIcon} />
        <h3>How are you feeling today?</h3>
      </div>
      
      <div className={styles.moodOptions}>
        {moodOptions.map((mood) => {
          return (
            <button
              key={mood.value}
              className={styles.moodButton}
              onClick={() => handleMoodSelect(mood.value)}
              style={{ '--mood-color': mood.color } as React.CSSProperties}
            >
              <span className={styles.moodEmoji}>{mood.emoji}</span>
              <span className={styles.moodLabel}>{mood.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodCheckInWidget;
