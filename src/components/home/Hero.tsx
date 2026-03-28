import React from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Shield, Users, Brain } from 'lucide-react';
import RotatingAffirmation from './RotatingAffirmation';
import StickyNotesManager from '../ui/StickyNotesManager';
import styles from '../../styles/components/home/Hero.module.css';

const Hero: React.FC = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.textContent}>
            <h1 className={styles.title}>
              Your Safe Space for
              <span className={styles.highlight}> Healing & Growth</span>
            </h1>
            <p className={styles.subtitle}>
              A gentle, supportive place where college students can find peace, build resilience, 
              and discover their inner strength. You're not alone in this journey - we're here 
              to walk alongside you with compassion and care.
            </p>
            <RotatingAffirmation />
            <div className={styles.buttons}>
              <Link href="/register" className={styles.primaryButton}>
                Start Feeling Better
                <ArrowRight size={20} />
              </Link>
              <button className={styles.secondaryButton}>
                <Play size={20} />
                See How It Helps
              </button>
            </div>
            <div className={styles.trustIndicators}>
              <div className={styles.trustItem}>
                <Shield size={20} />
                <span>Your Privacy Matters</span>
              </div>
              <div className={styles.trustItem}>
                <Users size={20} />
                <span>10,000+ Students Supported</span>
              </div>
              <div className={styles.trustItem}>
                <Brain size={20} />
                <span>Gentle, Proven Methods</span>
              </div>
            </div>
          </div>
          <div className={styles.visualContent}>
            <div className={styles.heroImage}>
              {/* Background Glow and Organic Shapes */}
              <div className={styles.backgroundGlow}></div>
              <div className={styles.organicShape}></div>
              
              {/* Animated Nature Elements */}
              <div className={styles.natureElements}>
                <div className={styles.floatingLeaf}></div>
                <div className={styles.floatingLeaf}></div>
                <div className={styles.floatingLeaf}></div>
                <div className={styles.glowOrb}></div>
                <div className={styles.glowOrb}></div>
                <div className={styles.waveShape}></div>
              </div>

              {/* Meditation Illustration */}
              <div className={styles.meditationIllustration}>
                <svg viewBox="0 0 200 200" className={styles.meditationSvg}>
                  {/* Tree silhouette */}
                  <path d="M100 180 L100 120 Q100 100 80 100 Q60 100 60 80 Q60 60 80 60 Q100 60 100 40 Q100 20 120 20 Q140 20 140 40 Q140 60 160 60 Q180 60 180 80 Q180 100 160 100 Q140 100 140 120 L140 180" 
                        fill="rgba(168, 195, 160, 0.15)" 
                        className={styles.treeSilhouette} />
                  
                  {/* Person meditating */}
                  <circle cx="100" cy="160" r="8" fill="rgba(191, 227, 192, 0.2)" className={styles.personHead} />
                  <ellipse cx="100" cy="175" rx="12" ry="8" fill="rgba(191, 227, 192, 0.15)" className={styles.personBody} />
                  
                  {/* Peaceful aura */}
                  <circle cx="100" cy="160" r="25" fill="none" stroke="rgba(168, 195, 160, 0.1)" strokeWidth="1" className={styles.peacefulAura} />
                  <circle cx="100" cy="160" r="35" fill="none" stroke="rgba(191, 227, 192, 0.08)" strokeWidth="1" className={styles.peacefulAura} />
                </svg>
              </div>

              <div className={styles.imagePlaceholder}>
                {/* Network Connection Lines */}
                <div className={styles.networkConnections}>
                  <svg className={styles.connectionSvg} viewBox="0 0 400 300">
                    <path d="M80,80 Q200,120 320,100" stroke="rgba(191, 227, 192, 0.2)" strokeWidth="2" fill="none" className={styles.connectionLine1} />
                    <path d="M100,200 Q200,150 300,180" stroke="rgba(168, 195, 160, 0.15)" strokeWidth="1.5" fill="none" className={styles.connectionLine2} />
                    <path d="M120,120 Q200,200 280,140" stroke="rgba(184, 198, 219, 0.18)" strokeWidth="1" fill="none" className={styles.connectionLine3} />
                  </svg>
                </div>

                {/* Floating Bubbles */}
                <div className={`${styles.floatingBubble} ${styles.bubble1}`}>
                  <div className={styles.bubbleGlow}></div>
                  <div className={styles.bubbleContent}>
                    <div className={styles.bubbleIcon}>🌱</div>
                    <div className={styles.bubbleText}>
                      <div className={styles.bubbleTitle}>Find Your Calm</div>
                      <div className={styles.bubbleSubtitle}>Gentle breathing exercises</div>
                    </div>
                  </div>
                </div>
                
                <div className={`${styles.floatingBubble} ${styles.bubble2}`}>
                  <div className={styles.bubbleGlow}></div>
                  <div className={styles.bubbleContent}>
                    <div className={styles.bubbleIcon}>💚</div>
                    <div className={styles.bubbleText}>
                      <div className={styles.bubbleTitle}>Track Your Growth</div>
                      <div className={styles.bubbleSubtitle}>Celebrate small wins</div>
                    </div>
                  </div>
                </div>
                
                <div className={`${styles.floatingBubble} ${styles.bubble3}`}>
                  <div className={styles.bubbleGlow}></div>
                  <div className={styles.bubbleContent}>
                    <div className={styles.bubbleIcon}>🤗</div>
                    <div className={styles.bubbleText}>
                      <div className={styles.bubbleTitle}>You're Not Alone</div>
                      <div className={styles.bubbleSubtitle}>Support whenever you need it</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sticky Notes Manager - positioned behind floating bubbles */}
      <StickyNotesManager />
    </section>
  );
};

export default Hero;
