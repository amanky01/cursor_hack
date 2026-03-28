import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import styles from '../../styles/components/assessments/Assessment.module.css';

interface GHQAssessmentProps {
  onComplete: (result: any) => void;
}

const GHQAssessment: React.FC<GHQAssessmentProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(12).fill(-1));

  const questions = [
    {
      id: 0,
      text: "Able to concentrate on whatever you're doing",
      question: "Have you recently been able to concentrate on whatever you're doing?"
    },
    {
      id: 1,
      text: "Lost much sleep over worry",
      question: "Have you recently lost much sleep over worry?"
    },
    {
      id: 2,
      text: "Felt that you are playing a useful part in things",
      question: "Have you recently felt that you are playing a useful part in things?"
    },
    {
      id: 3,
      text: "Felt capable of making decisions about things",
      question: "Have you recently felt capable of making decisions about things?"
    },
    {
      id: 4,
      text: "Felt constantly under strain",
      question: "Have you recently felt constantly under strain?"
    },
    {
      id: 5,
      text: "Felt you couldn't overcome your difficulties",
      question: "Have you recently felt you couldn't overcome your difficulties?"
    },
    {
      id: 6,
      text: "Been able to enjoy your normal day-to-day activities",
      question: "Have you recently been able to enjoy your normal day-to-day activities?"
    },
    {
      id: 7,
      text: "Been able to face up to your problems",
      question: "Have you recently been able to face up to your problems?"
    },
    {
      id: 8,
      text: "Been feeling unhappy and depressed",
      question: "Have you recently been feeling unhappy and depressed?"
    },
    {
      id: 9,
      text: "Been losing confidence in yourself",
      question: "Have you recently been losing confidence in yourself?"
    },
    {
      id: 10,
      text: "Been thinking of yourself as a worthless person",
      question: "Have you recently been thinking of yourself as a worthless person?"
    },
    {
      id: 11,
      text: "Been feeling reasonably happy, all things considered",
      question: "Have you recently been feeling reasonably happy, all things considered?"
    }
  ];

  const responseOptions = [
    { value: 0, label: "Better than usual" },
    { value: 1, label: "Same as usual" },
    { value: 2, label: "Less than usual" },
    { value: 3, label: "Much less than usual" }
  ];

  const handleAnswerSelect = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = () => {
    // GHQ-12 scoring: 0-1 for each item, then sum
    const scoredAnswers = answers.map(answer => answer >= 2 ? 1 : 0);
    const totalScore = scoredAnswers.reduce<number>(
      (sum, answer) => sum + answer,
      0
    );
    
    let severity: string;
    let interpretation: string;
    let recommendations: string[];

    if (totalScore <= 2) {
      severity = "Low Distress";
      interpretation = "Your responses suggest low psychological distress and good overall mental health.";
      recommendations = [
        "Continue maintaining healthy lifestyle habits",
        "Keep up positive coping strategies",
        "Stay connected with supportive relationships",
        "Consider periodic mental health check-ins"
      ];
    } else if (totalScore <= 4) {
      severity = "Mild Distress";
      interpretation = "Your responses suggest mild psychological distress. Some stress management could be helpful.";
      recommendations = [
        "Practice regular stress management techniques",
        "Consider talking to a counselor or therapist",
        "Maintain regular self-care activities",
        "Focus on building resilience and coping skills"
      ];
    } else if (totalScore <= 6) {
      severity = "Moderate Distress";
      interpretation = "Your responses suggest moderate psychological distress. Professional support could be beneficial.";
      recommendations = [
        "Consider seeking professional mental health support",
        "Engage in regular therapy or counseling",
        "Practice stress reduction and relaxation techniques",
        "Talk to a healthcare provider about your well-being"
      ];
    } else {
      severity = "High Distress";
      interpretation = "Your responses suggest high psychological distress. Professional help is strongly recommended.";
      recommendations = [
        "Seek professional mental health support immediately",
        "Consider therapy and possibly medication evaluation",
        "Reach out to trusted support systems",
        "Consider crisis support resources if needed"
      ];
    }

    onComplete({
      testName: "GHQ-12 General Health",
      score: totalScore,
      severity,
      interpretation,
      recommendations,
      maxScore: 12,
      questions: questions.length
    });
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const canProceed = answers[currentQuestion] !== -1;

  return (
    <div className={styles.assessment}>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className={styles.questionContainer}>
        <div className={styles.questionHeader}>
          <span className={styles.questionNumber}>
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <h3 className={styles.questionText}>
            {questions[currentQuestion].question}
          </h3>
        </div>

        <div className={styles.optionsContainer}>
          {responseOptions.map((option) => (
            <button
              key={option.value}
              className={`${styles.optionButton} ${
                answers[currentQuestion] === option.value ? styles.selected : ''
              }`}
              onClick={() => handleAnswerSelect(option.value)}
            >
              <span className={styles.optionValue}>{option.value}</span>
              <span className={styles.optionLabel}>{option.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.navigation}>
          <button
            className={styles.navButton}
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          
          <button
            className={`${styles.navButton} ${styles.primary}`}
            onClick={handleNext}
            disabled={!canProceed}
          >
            {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GHQAssessment;

