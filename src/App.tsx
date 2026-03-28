import { useState, useCallback, useEffect } from 'react';
import type { Screen, QuizConfig, QuizResult } from './types';
import { useHistory } from './hooks/useHistory';
import { useQuiz } from './hooks/useQuiz';
import HomeScreen from './components/HomeScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import ReviewScreen from './components/ReviewScreen';
import HistoryScreen from './components/HistoryScreen';
import allQuestionsRaw from './data/questions.json';
import type { Question } from './types';

const allQuestions = allQuestionsRaw as Question[];

function QuizWrapper({
  config,
  onFinish,
}: {
  config: QuizConfig;
  onFinish: (results: QuizResult[], config: QuizConfig) => void;
}) {
  const quiz = useQuiz(allQuestions, config);

  if (quiz.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Nenhuma questão encontrada com esse filtro.
      </div>
    );
  }

  return (
    <QuizScreen
      question={quiz.currentQuestion}
      currentIndex={quiz.currentIndex}
      total={quiz.total}
      chosenIndex={quiz.chosenIndex}
      isLast={quiz.isLast}
      onAnswer={quiz.answer}
      onNext={quiz.next}
      onFinish={() => onFinish(quiz.results, config)}
    />
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [quizKey, setQuizKey] = useState(0);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const { history, addResult, clearHistory } = useHistory();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const handleStart = useCallback((config: QuizConfig) => {
    setQuizConfig(config);
    setQuizKey(k => k + 1);
    setScreen('quiz');
  }, []);

  const handleFinish = useCallback((results: QuizResult[], config: QuizConfig) => {
    setQuizResults(results);
    addResult(results, config.moduleFilter, config.difficultyFilter);
    setScreen('result');
  }, [addResult]);

  if (screen === 'home') {
    return <HomeScreen onStart={handleStart} onHistory={() => setScreen('history')} />;
  }

  if (screen === 'quiz' && quizConfig) {
    return (
      <QuizWrapper
        key={quizKey}
        config={quizConfig}
        onFinish={handleFinish}
      />
    );
  }

  if (screen === 'result') {
    return (
      <ResultScreen
        results={quizResults}
        onReview={() => setScreen('review')}
        onNew={() => setScreen('home')}
      />
    );
  }

  if (screen === 'review') {
    return (
      <ReviewScreen
        results={quizResults}
        onBack={() => setScreen('result')}
      />
    );
  }

  if (screen === 'history') {
    return (
      <HistoryScreen
        history={history}
        onClear={clearHistory}
        onBack={() => setScreen('home')}
      />
    );
  }

  return null;
}
