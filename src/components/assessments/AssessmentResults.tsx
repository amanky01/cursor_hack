import React from 'react';
import { ArrowLeft, Download, Share2, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import styles from '../../styles/components/assessments/AssessmentResults.module.css';

interface AssessmentResult {
  testName: string;
  score: number;
  severity: string;
  interpretation: string;
  recommendations: string[];
  maxScore: number;
  questions: number;
}

interface AssessmentResultsProps {
  results: AssessmentResult[];
  onBack: () => void;
  onStartNew: () => void;
}

const AssessmentResults: React.FC<AssessmentResultsProps> = ({ results, onBack, onStartNew }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'minimal':
      case 'low distress':
        return 'var(--success-500)';
      case 'mild':
      case 'mild distress':
        return 'var(--secondary-500)';
      case 'moderate':
      case 'moderate distress':
        return 'var(--warning-500)';
      case 'moderately severe':
      case 'severe':
      case 'high distress':
        return 'var(--error-500)';
      default:
        return 'var(--gray-500)';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'minimal':
      case 'low distress':
        return <CheckCircle size={20} />;
      case 'mild':
      case 'mild distress':
        return <TrendingUp size={20} />;
      case 'moderate':
      case 'moderate distress':
        return <AlertCircle size={20} />;
      case 'moderately severe':
      case 'severe':
      case 'high distress':
        return <AlertCircle size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  const handleDownloadResults = () => {
    const resultsText = results.map(result => 
      `${result.testName}\n` +
      `Score: ${result.score}/${result.maxScore}\n` +
      `Severity: ${result.severity}\n` +
      `Interpretation: ${result.interpretation}\n` +
      `Recommendations:\n${result.recommendations.map(rec => `- ${rec}`).join('\n')}\n\n`
    ).join('');

    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mental-health-assessment-results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareResults = () => {
    if (navigator.share) {
      const resultsText = results.map(result => 
        `${result.testName}: ${result.score}/${result.maxScore} (${result.severity})`
      ).join('\n');
      
      navigator.share({
        title: 'Mental Health Assessment Results',
        text: resultsText,
      });
    } else {
      // Fallback: copy to clipboard
      const resultsText = results.map(result => 
        `${result.testName}: ${result.score}/${result.maxScore} (${result.severity})`
      ).join('\n');
      
      navigator.clipboard.writeText(resultsText).then(() => {
        alert('Results copied to clipboard!');
      });
    }
  };

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.resultsHeader}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft size={20} />
          Back to Assessments
        </button>
        <h1>Your Assessment Results</h1>
        <p>Here are your completed mental health assessments and personalized recommendations.</p>
      </div>

      <div className={styles.resultsActions}>
        <button className={styles.actionButton} onClick={handleDownloadResults}>
          <Download size={16} />
          Download Results
        </button>
        <button className={styles.actionButton} onClick={handleShareResults}>
          <Share2 size={16} />
          Share Results
        </button>
      </div>

      <div className={styles.resultsList}>
        {results.map((result, index) => (
          <div key={index} className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <div className={styles.resultTitle}>
                <h3>{result.testName}</h3>
                <div 
                  className={styles.severityBadge}
                  style={{ backgroundColor: getSeverityColor(result.severity) }}
                >
                  {getSeverityIcon(result.severity)}
                  <span>{result.severity}</span>
                </div>
              </div>
              <div className={styles.resultScore}>
                <span className={styles.scoreValue}>{result.score}</span>
                <span className={styles.scoreMax}>/ {result.maxScore}</span>
              </div>
            </div>

            <div className={styles.resultContent}>
              <div className={styles.interpretation}>
                <h4>Interpretation</h4>
                <p>{result.interpretation}</p>
              </div>

              <div className={styles.recommendations}>
                <h4>Recommendations</h4>
                <ul>
                  {result.recommendations.map((recommendation, recIndex) => (
                    <li key={recIndex}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.resultsFooter}>
        <div className={styles.disclaimer}>
          <AlertCircle size={20} />
          <div>
            <strong>Important Disclaimer:</strong> These assessments are for informational purposes only 
            and do not replace professional medical advice, diagnosis, or treatment. If you're experiencing 
            significant distress or have concerns about your mental health, please consult with a qualified 
            healthcare provider or mental health professional.
          </div>
        </div>

        <div className={styles.footerActions}>
          <button className={styles.primaryButton} onClick={onStartNew}>
            Take Another Assessment
          </button>
          <button className={styles.secondaryButton} onClick={onBack}>
            Back to Resources
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResults;

