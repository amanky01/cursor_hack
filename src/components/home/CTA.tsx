import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import styles from '../../styles/components/home/CTA.module.css';

const CTA: React.FC = () => {
  const benefits = [
    'Start your healing journey today',
    'No pressure, no commitment',
    'Gentle, proven methods that work',
    'Support whenever you need it',
  ];

  return (
    <section className={styles.cta}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.textContent}>
            <h2 className={styles.title}>
              Ready to Begin Your Healing Journey?
            </h2>
            <p className={styles.subtitle}>
              You don't have to do this alone. Join thousands of students who've found peace, 
              strength, and support in their mental health journey. Take the first gentle step today.
            </p>
            
            <div className={styles.benefits}>
              {benefits.map((benefit, index) => (
                <div key={index} className={styles.benefit}>
                  <CheckCircle size={20} className={styles.checkIcon} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className={styles.buttons}>
              <Link href="/register" className={styles.primaryButton}>
                Take the First Step
                <ArrowRight size={20} />
              </Link>
              <Link href="/about" className={styles.secondaryButton}>
                Learn How We Help
              </Link>
            </div>
          </div>

          <div className={styles.visualContent}>
            <div className={styles.ctaImage}>
              <div className={styles.imagePlaceholder}>
                <div className={styles.floatingElement}>
                  <div className={styles.elementIcon}>🌱</div>
                  <div className={styles.elementText}>Gentle Practices</div>
                </div>
                <div className={styles.floatingElement}>
                  <div className={styles.elementIcon}>💚</div>
                  <div className={styles.elementText}>Always With You</div>
                </div>
                <div className={styles.floatingElement}>
                  <div className={styles.elementIcon}>📈</div>
                  <div className={styles.elementText}>Celebrate Growth</div>
                </div>
                <div className={styles.floatingElement}>
                  <div className={styles.elementIcon}>🤗</div>
                  <div className={styles.elementText}>Supportive Community</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
