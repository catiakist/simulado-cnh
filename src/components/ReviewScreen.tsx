import type { QuizResult } from '../types';
import DifficultyBadge from './DifficultyBadge';
import { useState } from 'react';

interface Props {
  results: QuizResult[];
  onBack: () => void;
}

export default function ReviewScreen({ results, onBack }: Props) {
  const errors = results.filter(r => !r.is_correct);
  const [current, setCurrent] = useState(0);
  const q = errors[current].question;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-[680px]">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
          >
            ← Voltar ao Resultado
          </button>
          <span className="text-slate-400 text-sm">
            {current + 1} / {errors.length} erros
          </span>
        </div>

        <div className="animate-slide-in space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <DifficultyBadge difficulty={q.difficulty} />
            <span className="text-slate-500 text-xs">{q.module}</span>
          </div>

          {/* Question */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
            {q.plate_code && (
              <div className="mb-3 inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-700/40 rounded-lg px-3 py-1 text-cyan-300 text-xs font-semibold">
                🪧 Código: <span className="font-bold">{q.plate_code}</span>
              </div>
            )}
            <p className="text-white text-lg leading-relaxed font-medium">{q.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {q.options.map((opt, idx) => {
              const isCorrect = idx === q.correct_index;
              const wasChosen = idx === errors[current].chosen_index;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
                    isCorrect
                      ? 'bg-green-900/40 border-green-500 text-green-200'
                      : wasChosen
                      ? 'bg-red-900/40 border-red-500 text-red-200'
                      : 'bg-slate-800/40 border-slate-700 text-slate-500'
                  }`}
                >
                  <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border ${
                    isCorrect
                      ? 'bg-green-600 border-green-500 text-white'
                      : wasChosen
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-400'
                  }`}>
                    {['A','B','C','D'][idx]}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {isCorrect && <span className="text-green-400 font-bold">✓</span>}
                  {wasChosen && !isCorrect && <span className="text-red-400 font-bold">✗</span>}
                </div>
              );
            })}
          </div>

          {/* Comment */}
          {q.comment && (
            <div className="bg-slate-800/60 border border-slate-600 rounded-2xl px-5 py-4">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Comentário</p>
              <p className="text-slate-300 text-sm leading-relaxed">{q.comment}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              disabled={current === 0}
              onClick={() => setCurrent(c => c - 1)}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded-xl font-semibold transition-all"
            >
              ← Anterior
            </button>
            {current < errors.length - 1 ? (
              <button
                onClick={() => setCurrent(c => c + 1)}
                className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl font-bold transition-all"
              >
                Próximo →
              </button>
            ) : (
              <button
                onClick={onBack}
                className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl font-bold transition-all"
              >
                Concluir ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
