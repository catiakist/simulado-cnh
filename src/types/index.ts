export type Difficulty = 'Fácil' | 'Intermediário' | 'Difícil';

export interface Question {
  id: number;
  number: number;
  part: string;
  module: string;
  difficulty: Difficulty;
  question: string;
  correct_answer: string;
  comment: string;
  wrong_answers: string[];
  plate_code?: string | null;
}

export interface ShuffledQuestion extends Question {
  options: string[];
  correct_index: number;
}

export interface QuizResult {
  question_id: number;
  chosen_index: number;
  is_correct: boolean;
  question: ShuffledQuestion;
}

export interface SimuladoHistory {
  id: string;
  date: string;
  module_filter: string;
  difficulty_filter: string;
  total: number;
  correct: number;
  results: QuizResult[];
}

export type Screen = 'home' | 'quiz' | 'result' | 'review' | 'history';

export interface QuizConfig {
  moduleFilter: string;
  difficultyFilter: string;
  questionCount: number | 'all';
}
