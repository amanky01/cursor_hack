import React, { useState } from 'react';
import { ArrowLeft, Brain, Heart, Shield } from 'lucide-react';
import PHQ9Assessment from './PHQ9Assessment';
import GAD7Assessment from './GAD7Assessment';
import GHQAssessment from './GHQAssessment';
import AssessmentResults from './AssessmentResults';
import styles from '../../styles/components/assessments/AssessmentSelector.module.css';

interface AssessmentResult {
  testName: string;
  score: number;
  severity: string;
  interpretation: string;
  recommendations: string[];
  maxScore: number;
  questions: number;
}

const AssessmentSelector: React.FC = () => {
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const [completedAssessments, setCompletedAssessments] = useState<AssessmentResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const assessments = [
    {
      id: 'phq9',
      title: 'PHQ-9 Depression Screening',
      description: 'Patient Health Questionnaire-9 is a validated screening tool for depression severity.',
      icon: Heart,
      color: 'var(--primary-500)',
      questions: 9,
      timeEstimate: '3-5 minutes',
      purpose: 'Assess depression symptoms over the past 2 weeks'
    },
    {
      id: 'gad7',
      title: 'GAD-7 Anxiety Screening',
      description: 'Generalized Anxiety Disorder 7-item scale for anxiety severity assessment.',
      icon: Brain,
      color: 'var(--secondary-500)',
      questions: 7,
      timeEstimate: '2-3 minutes',
      purpose: 'Evaluate anxiety symptoms over the past 2 weeks'
    },
    {
      id: 'ghq',
      title: 'GHQ-12 General Health',
      description: 'General Health Questionnaire-12 for overall psychological well-being assessment.',
      icon: Shield,
      color: 'var(--accent-teal)',
      questions: 12,
      timeEstimate: '4-6 minutes',
      purpose: 'Measure general psychological distress and well-being'
    }
  ];

  const handleAssessmentComplete = (result: AssessmentResult) => {
    setCompletedAssessments(prev => [...prev, result]);
    setSelectedAssessment(null);
    setShowResults(true);
  };

  const handleBackToSelector = () => {
    setSelectedAssessment(null);
    setShowResults(false);
  };

  const handleStartNewAssessment = () => {
    setShowResults(false);
  };

  if (showResults) {
    return (
      <AssessmentResults 
        results={completedAssessments}
        onBack={handleBackToSelector}
        onStartNew={handleStartNewAssessment}
      />
    );
  }

  if (selectedAssessment) {
    const assessment = assessments.find(a => a.id === selectedAssessment);
    if (!assessment) return null;

    return (
      <div className={styles.assessmentContainer}>
        <div className={styles.assessmentHeader}>
          <button className={styles.backButton} onClick={handleBackToSelector}>
            <ArrowLeft size={20} />
            Back to Assessments
          </button>
          <div className={styles.assessmentInfo}>
            <h2>{assessment.title}</h2>
            <p>{assessment.description}</p>
          </div>
        </div>

        {selectedAssessment === 'phq9' && (
          <PHQ9Assessment onComplete={handleAssessmentComplete} />
        )}
        {selectedAssessment === 'gad7' && (
          <GAD7Assessment onComplete={handleAssessmentComplete} />
        )}
        {selectedAssessment === 'ghq' && (
          <GHQAssessment onComplete={handleAssessmentComplete} />
        )}
      </div>
    );
  }

  return (
    <div className={styles.selectorContainer}>
      <div className={styles.selectorHeader}>
        <h1>Mental Health Self-Assessment</h1>
        <p>
          Take a validated psychological assessment to better understand your mental health. 
          These tools are widely used by healthcare professionals and can help identify areas 
          where you might benefit from additional support.
        </p>
        <div className={styles.disclaimer}>
          <strong>Important:</strong> These assessments are for informational purposes only 
          and do not replace professional medical advice. If you're experiencing significant 
          distress, please consult with a healthcare provider.
        </div>
      </div>

      <div className={styles.assessmentsGrid}>
        {assessments.map((assessment) => {
          const Icon = assessment.icon;
          return (
            <div 
              key={assessment.id} 
              className={styles.assessmentCard}
              onClick={() => setSelectedAssessment(assessment.id)}
            >
              <div className={styles.cardHeader}>
                <div 
                  className={styles.cardIcon} 
                  style={{ backgroundColor: `${assessment.color}15` }}
                >
                  <Icon size={32} style={{ color: assessment.color }} />
                </div>
                <div className={styles.cardInfo}>
                  <h3>{assessment.title}</h3>
                  <p>{assessment.description}</p>
                </div>
              </div>
              
              <div className={styles.cardDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Questions:</span>
                  <span className={styles.detailValue}>{assessment.questions}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Time:</span>
                  <span className={styles.detailValue}>{assessment.timeEstimate}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Purpose:</span>
                  <span className={styles.detailValue}>{assessment.purpose}</span>
                </div>
              </div>

              <button className={styles.startButton}>
                Start Assessment
              </button>
            </div>
          );
        })}
      </div>

      {completedAssessments.length > 0 && (
        <div className={styles.completedSection}>
          <h3>Your Completed Assessments</h3>
          <div className={styles.completedList}>
            {completedAssessments.map((result, index) => (
              <div key={index} className={styles.completedItem}>
                <span className={styles.completedTest}>{result.testName}</span>
                <span className={styles.completedScore}>Score: {result.score}</span>
                <span className={styles.completedSeverity}>{result.severity}</span>
              </div>
            ))}
          </div>
          <button 
            className={styles.viewResultsButton}
            onClick={() => setShowResults(true)}
          >
            View All Results
          </button>
        </div>
      )}
    </div>
  );
};

export default AssessmentSelector;

