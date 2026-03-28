import { useState, useCallback } from 'react';
import type { Question, ShuffledQuestion, QuizResult, QuizConfig } from '../types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function prepareQuestion(q: Question): ShuffledQuestion {
  const all = shuffle([q.correct_answer, ...q.wrong_answers]);
  return {
    ...q,
    options: all,
    correct_index: all.indexOf(q.correct_answer),
  };
}

export function useQuiz(allQuestions: Question[], config: QuizConfig) {
  const [questions] = useState<ShuffledQuestion[]>(() => {
    let filtered = allQuestions;

    if (config.moduleFilter !== 'all') {
      filtered = filtered.filter(q =>
        q.module.includes(config.moduleFilter)
      );
    }

    if (config.difficultyFilter !== 'all') {
      filtered = filtered.filter(q => q.difficulty === config.difficultyFilter);
    }

    const shuffled = shuffle(filtered);
    const count = config.questionCount === 'all'
      ? shuffled.length
      : Math.min(config.questionCount, shuffled.length);

    return shuffled.slice(0, count).map(prepareQuestion);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [chosenIndex, setChosenIndex] = useState<number | null>(null);

  const currentQuestion = questions[currentIndex];
  const isAnswered = chosenIndex !== null;
  const isLast = currentIndex === questions.length - 1;

  const answer = useCallback((idx: number) => {
    if (chosenIndex !== null) return;
    setChosenIndex(idx);
    setResults(prev => [...prev, {
      question_id: currentQuestion.id,
      chosen_index: idx,
      is_correct: idx === currentQuestion.correct_index,
      question: currentQuestion,
    }]);
  }, [chosenIndex, currentQuestion]);

  const next = useCallback(() => {
    if (!isLast) {
      setCurrentIndex(i => i + 1);
      setChosenIndex(null);
    }
  }, [isLast]);

  return {
    questions,
    currentQuestion,
    currentIndex,
    results,
    chosenIndex,
    isAnswered,
    isLast,
    answer,
    next,
    total: questions.length,
  };
}
