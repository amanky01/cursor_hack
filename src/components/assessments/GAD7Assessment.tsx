import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import styles from '../../styles/components/assessments/Assessment.module.css';

interface GAD7AssessmentProps {
  onComplete: (result: any) => void;
}

const GAD7Assessment: React.FC<GAD7AssessmentProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(7).fill(-1));

  const questions = [
    {
      id: 0,
      text: "Feeling nervous, anxious, or on edge",
      question: "Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?"
    },
    {
      id: 1,
      text: "Not being able to stop or control worrying",
      question: "Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?"
    },
    {
      id: 2,
      text: "Worrying too much about different things",
      question: "Over the last 2 weeks, how often have you been bothered by worrying too much about different things?"
    },
    {
      id: 3,
      text: "Trouble relaxing",
      question: "Over the last 2 weeks, how often have you been bothered by trouble relaxing?"
    },
    {
      id: 4,
      text: "Being so restless that it's hard to sit still",
      question: "Over the last 2 weeks, how often have you been bothered by being so restless that it's hard to sit still?"
    },
    {
      id: 5,
      text: "Becoming easily annoyed or irritable",
      question: "Over the last 2 weeks, how often have you been bothered by becoming easily annoyed or irritable?"
    },
    {
      id: 6,
      text: "Feeling afraid as if something awful might happen",
      question: "Over the last 2 weeks, how often have you been bothered by feeling afraid as if something awful might happen?"
    }
  ];

  const responseOptions = [
    { value: 0, label: "Not at all" },
    { value: 1, label: "Several days" },
    { value: 2, label: "More than half the days" },
    { value: 3, label: "Nearly every day" }
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
    const totalScore = answers.reduce((sum, answer) => sum + answer, 0);
    
    let severity: string;
    let interpretation: string;
    let recommendations: string[];

    if (totalScore <= 4) {
      severity = "Minimal";
      interpretation = "Your responses suggest minimal anxiety symptoms. This indicates good anxiety management.";
      recommendations = [
        "Continue practicing stress management techniques",
        "Maintain regular relaxation practices",
        "Keep up healthy lifestyle habits",
        "Stay aware of stress levels during busy periods"
      ];
    } else if (totalScore <= 9) {
      severity = "Mild";
      interpretation = "Your responses suggest mild anxiety symptoms. Some anxiety management strategies could be helpful.";
      recommendations = [
        "Practice relaxation techniques like deep breathing",
        "Consider mindfulness or meditation practices",
        "Maintain regular exercise and sleep routines",
        "Consider talking to a counselor about anxiety management"
      ];
    } else if (totalScore <= 14) {
      severity = "Moderate";
      interpretation = "Your responses suggest moderate anxiety symptoms. Professional support could be very beneficial.";
      recommendations = [
        "Consider seeking professional mental health support",
        "Learn and practice anxiety management techniques",
        "Consider therapy focused on anxiety management",
        "Talk to a healthcare provider about your symptoms"
      ];
    } else {
      severity = "Severe";
      interpretation = "Your responses suggest severe anxiety symptoms. Professional help is strongly recommended.";
      recommendations = [
        "Seek professional mental health support immediately",
        "Consider therapy and possibly medication evaluation",
        "Practice immediate anxiety relief techniques",
        "Consider crisis support if anxiety becomes overwhelming"
      ];
    }

    onComplete({
      testName: "GAD-7 Anxiety Screening",
      score: totalScore,
      severity,
      interpretation,
      recommendations,
      maxScore: 21,
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

export default GAD7Assessment;

