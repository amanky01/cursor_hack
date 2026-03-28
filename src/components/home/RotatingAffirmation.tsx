import React, { useState, useEffect } from 'react';
import styles from '../../styles/components/home/RotatingAffirmation.module.css';

const RotatingAffirmation: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const affirmations = [
    "It's okay to take it slow 🌸",
    "One step at a time 💚",
    "You're stronger than you know 🌱",
    "Small steps count 💙",
    "You're not alone in this 🤗",
    "Every moment of self-care matters 🌿",
    "Your feelings are valid 💜",
    "Progress, not perfection 🌺"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % affirmations.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [affirmations.length]);

  return (
    <div className={styles.affirmationContainer}>
      <div className={styles.affirmationText}>
        {affirmations[currentIndex]}
      </div>
    </div>
  );
};

export default RotatingAffirmation;
