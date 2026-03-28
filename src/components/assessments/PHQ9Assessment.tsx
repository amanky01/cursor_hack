import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import styles from '../../styles/components/assessments/Assessment.module.css';

interface PHQ9AssessmentProps {
  onComplete: (result: any) => void;
}

const PHQ9Assessment: React.FC<PHQ9AssessmentProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(9).fill(-1));

  const questions = [
    {
      id: 0,
      text: "Little interest or pleasure in doing things",
      question: "Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?"
    },
    {
      id: 1,
      text: "Feeling down, depressed, or hopeless",
      question: "Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?"
    },
    {
      id: 2,
      text: "Trouble falling or staying asleep, or sleeping too much",
      question: "Over the last 2 weeks, how often have you been bothered by trouble falling or staying asleep, or sleeping too much?"
    },
    {
      id: 3,
      text: "Feeling tired or having little energy",
      question: "Over the last 2 weeks, how often have you been bothered by feeling tired or having little energy?"
    },
    {
      id: 4,
      text: "Poor appetite or overeating",
      question: "Over the last 2 weeks, how often have you been bothered by poor appetite or overeating?"
    },
    {
      id: 5,
      text: "Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
      question: "Over the last 2 weeks, how often have you been bothered by feeling bad about yourself - or that you are a failure or have let yourself or your family down?"
    },
    {
      id: 6,
      text: "Trouble concentrating on things, such as reading the newspaper or watching television",
      question: "Over the last 2 weeks, how often have you been bothered by trouble concentrating on things, such as reading the newspaper or watching television?"
    },
    {
      id: 7,
      text: "Moving or speaking so slowly that other people could have noticed, or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
      question: "Over the last 2 weeks, how often have you been bothered by moving or speaking so slowly that other people could have noticed, or the opposite - being so fidgety or restless that you have been moving around a lot more than usual?"
    },
    {
      id: 8,
      text: "Thoughts that you would be better off dead, or of hurting yourself",
      question: "Over the last 2 weeks, how often have you been bothered by thoughts that you would be better off dead, or of hurting yourself?"
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
      interpretation = "Your responses suggest minimal depression symptoms. This is a positive sign for your mental health.";
      recommendations = [
        "Continue maintaining healthy lifestyle habits",
        "Practice regular self-care activities",
        "Stay connected with supportive friends and family",
        "Consider periodic check-ins with your mental health"
      ];
    } else if (totalScore <= 9) {
      severity = "Mild";
      interpretation = "Your responses suggest mild depression symptoms. While not severe, it's worth paying attention to your mental health.";
      recommendations = [
        "Increase self-care activities and stress management",
        "Consider talking to a counselor or therapist",
        "Maintain regular sleep and exercise routines",
        "Practice mindfulness or relaxation techniques"
      ];
    } else if (totalScore <= 14) {
      severity = "Moderate";
      interpretation = "Your responses suggest moderate depression symptoms. Professional support could be very helpful at this time.";
      recommendations = [
        "Consider seeking professional mental health support",
        "Talk to a healthcare provider about your symptoms",
        "Engage in regular therapy or counseling",
        "Consider medication evaluation if recommended by a professional"
      ];
    } else if (totalScore <= 19) {
      severity = "Moderately Severe";
      interpretation = "Your responses suggest moderately severe depression symptoms. Professional help is strongly recommended.";
      recommendations = [
        "Seek professional mental health support immediately",
        "Consider therapy and medication evaluation",
        "Reach out to trusted friends and family for support",
        "Consider crisis support resources if needed"
      ];
    } else {
      severity = "Severe";
      interpretation = "Your responses suggest severe depression symptoms. Please seek professional help as soon as possible.";
      recommendations = [
        "Seek immediate professional mental health support",
        "Contact a mental health crisis line if you're in distress",
        "Consider emergency mental health services",
        "Reach out to trusted support systems immediately"
      ];
    }

    onComplete({
      testName: "PHQ-9 Depression Screening",
      score: totalScore,
      severity,
      interpretation,
      recommendations,
      maxScore: 27,
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

export default PHQ9Assessment;

