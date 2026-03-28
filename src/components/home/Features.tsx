import React from 'react';
import { Heart, Shield, Users, TrendingUp, Clock, Smartphone } from 'lucide-react';
import styles from '../../styles/components/home/Features.module.css';

const Features: React.FC = () => {
  const features = [
    {
      icon: Heart,
      title: 'Gentle Healing Tools',
      description: 'Discover calming practices like mindfulness, breathing exercises, and gentle stress relief techniques that feel right for you.',
      color: 'var(--primary-500)',
    },
    {
      icon: Shield,
      title: 'Your Privacy Matters',
      description: 'We protect your personal journey with the highest security standards. Your story stays safe with us.',
      color: 'var(--success-500)',
    },
    {
      icon: Users,
      title: 'Supportive Community',
      description: 'Connect with understanding peers who truly get it. You\'ll find kindness and encouragement here.',
      color: 'var(--secondary-500)',
    },
    {
      icon: TrendingUp,
      title: 'Celebrate Your Growth',
      description: 'Track your progress and celebrate every small win. You\'re stronger than you know.',
      color: 'var(--warning-500)',
    },
    {
      icon: Clock,
      title: 'Always Here for You',
      description: 'Whenever you need support, day or night, we\'re here. You never have to face tough moments alone.',
      color: 'var(--error-500)',
    },
    {
      icon: Smartphone,
      title: 'Easy Access, Anywhere',
      description: 'Take your healing journey with you. Our gentle platform works beautifully on any device.',
      color: 'var(--primary-600)',
    },
  ];

  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>How We Support Your Journey</h2>
          <p className={styles.subtitle}>
            We believe in gentle, compassionate care that meets you where you are. 
            Every feature is designed with your wellbeing and comfort in mind.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className={styles.featureCard}>
                <div className={styles.iconContainer} style={{ backgroundColor: `${feature.color}15` }}>
                  <Icon size={32} style={{ color: feature.color }} />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
