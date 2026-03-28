import type { ShuffledQuestion } from '../types';
import DifficultyBadge from './DifficultyBadge';
import ProgressBar from './ProgressBar';

interface Props {
  question: ShuffledQuestion;
  currentIndex: number;
  total: number;
  chosenIndex: number | null;
  isLast: boolean;
  onAnswer: (idx: number) => void;
  onNext: () => void;
  onFinish: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];

function moduleShort(module: string) {
  const m = module.match(/MÓDULO\s+(\d)/i);
  return m ? `Módulo ${m[1]}` : module;
}

export default function QuizScreen({
  question,
  currentIndex,
  total,
  chosenIndex,
  isLast,
  onAnswer,
  onNext,
  onFinish,
}: Props) {
  const isAnswered = chosenIndex !== null;

  function btnStyle(idx: number) {
    if (!isAnswered) {
      return 'bg-slate-800 border-slate-600 text-slate-200 hover:border-cyan-500 hover:bg-slate-700';
    }
    if (idx === question.correct_index) {
      return 'bg-green-900/40 border-green-500 text-green-200';
    }
    if (idx === chosenIndex) {
      return 'bg-red-900/40 border-red-500 text-red-200';
    }
    return 'bg-slate-800/40 border-slate-700 text-slate-500';
  }

  function btnIcon(idx: number) {
    if (!isAnswered) return null;
    if (idx === question.correct_index) return <span className="ml-auto text-green-400 font-bold">✓</span>;
    if (idx === chosenIndex) return <span className="ml-auto text-red-400 font-bold">✗</span>;
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-[680px] flex flex-col gap-4 animate-slide-in">
        {/* Progress Bar */}
        <ProgressBar current={currentIndex + 1} total={total} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm font-medium">
            Questão <span className="text-white font-semibold">{currentIndex + 1}</span> de{' '}
            <span className="text-white font-semibold">{total}</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs hidden sm:block">{moduleShort(question.module)}</span>
            <DifficultyBadge difficulty={question.difficulty} />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
          {question.plate_code && (
            <div className="mb-3 inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-700/40 rounded-lg px-3 py-1 text-cyan-300 text-xs font-semibold">
              🪧 Código da placa: <span className="font-bold">{question.plate_code}</span>
            </div>
          )}
          <p className="text-white text-lg leading-relaxed font-medium">
            {question.question}
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => onAnswer(idx)}
              className={`flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${btnStyle(idx)}`}
            >
              <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border ${
                isAnswered
                  ? idx === question.correct_index
                    ? 'bg-green-600 border-green-500 text-white'
                    : idx === chosenIndex
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-400'
                  : 'bg-slate-700 border-slate-600 text-slate-300'
              }`}>
                {LETTERS[idx]}
              </span>
              <span className="flex-1">{opt}</span>
              {btnIcon(idx)}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {isAnswered && question.comment && (
          <div className="bg-slate-800/60 border border-slate-600 rounded-2xl px-5 py-4 animate-slide-in">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Comentário</p>
            <p className="text-slate-300 text-sm leading-relaxed">{question.comment}</p>
          </div>
        )}

        {/* Next Button */}
        {isAnswered && (
          <button
            onClick={isLast ? onFinish : onNext}
            className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-all active:scale-[0.98] animate-slide-in"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            {isLast ? '📊 Ver Resultado' : 'Próxima Questão →'}
          </button>
        )}
      </div>
    </div>
  );
}
