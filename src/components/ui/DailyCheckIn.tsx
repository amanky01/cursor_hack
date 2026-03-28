import React, { useState } from 'react';
import { Heart, Smile, Meh, Frown, CheckCircle, X } from 'lucide-react';
import styles from '../../styles/components/ui/DailyCheckIn.module.css';

interface DailyCheckInProps {
  onClose?: () => void;
  onMoodSubmit?: (mood: string, note?: string) => void;
}

const DailyCheckIn: React.FC<DailyCheckInProps> = ({ onClose, onMoodSubmit }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const moodOptions = [
    { emoji: '😊', value: 'happy', label: 'Great!', color: '#4ade80' },
    { emoji: '😐', value: 'neutral', label: 'Okay', color: '#fbbf24' },
    { emoji: '😞', value: 'sad', label: 'Tough day', color: '#f87171' },
  ];

  const handleSubmit = () => {
    if (selectedMood) {
      onMoodSubmit?.(selectedMood, note);
      setIsSubmitted(true);
      setTimeout(() => {
        onClose?.();
      }, 2000);
    }
  };

  const getEncouragementMessage = (mood: string) => {
    switch (mood) {
      case 'happy':
        return "That's wonderful! Your positive energy is beautiful 💚";
      case 'neutral':
        return "That's perfectly okay. Sometimes we just need to be where we are 🌱";
      case 'sad':
        return "I'm here with you. You're stronger than you know 💙";
      default:
        return "";
    }
  };

  if (isSubmitted) {
    return (
      <div className={styles.checkInWidget}>
        <div className={styles.submittedContent}>
          <CheckCircle className={styles.successIcon} />
          <h3>Thank you for sharing</h3>
          <p>{getEncouragementMessage(selectedMood!)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkInWidget}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Heart className={styles.heartIcon} />
          <h3>How's your day going?</h3>
        </div>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose}>
            <X size={16} />
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.moodSelector}>
          {moodOptions.map((mood) => (
            <button
              key={mood.value}
              className={`${styles.moodButton} ${selectedMood === mood.value ? styles.selected : ''}`}
              onClick={() => setSelectedMood(mood.value)}
              style={{ '--mood-color': mood.color } as React.CSSProperties}
            >
              <span className={styles.moodEmoji}>{mood.emoji}</span>
              <span className={styles.moodLabel}>{mood.label}</span>
            </button>
          ))}
        </div>

        {selectedMood && (
          <div className={styles.noteSection}>
            <label htmlFor="mood-note" className={styles.noteLabel}>
              Want to share more? (optional)
            </label>
            <textarea
              id="mood-note"
              className={styles.noteInput}
              placeholder="How are you feeling? What's on your mind?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <div className={styles.actions}>
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={!selectedMood}
          >
            <Heart size={16} />
            Share How I'm Feeling
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyCheckIn;
