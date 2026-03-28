import type { QuizResult } from '../types';

interface Props {
  results: QuizResult[];
  onReview: () => void;
  onNew: () => void;
}

function getMessage(pct: number) {
  if (pct >= 90) return { emoji: '🏆', text: 'Excelente! Você está pronto para a prova!' };
  if (pct >= 70) return { emoji: '💪', text: 'Muito bem! Continue praticando!' };
  if (pct >= 50) return { emoji: '📚', text: 'Na metade! Revise os erros e tente novamente.' };
  return { emoji: '🔄', text: 'Continue estudando! A prática leva à perfeição.' };
}

export default function ResultScreen({ results, onReview, onNew }: Props) {
  const correct = results.filter(r => r.is_correct).length;
  const total = results.length;
  const pct = Math.round((correct / total) * 100);
  const msg = getMessage(pct);
  const hasErrors = correct < total;

  // Circle ring
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;

  const ringColor = pct >= 70 ? '#22c55e' : pct >= 50 ? '#eab308' : '#ef4444';

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-[680px] animate-slide-in">
        <h1 className="text-2xl font-bold text-white text-center mb-8" style={{ fontFamily: 'Sora, sans-serif' }}>
          Resultado
        </h1>

        {/* Score Ring */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="#1e293b" strokeWidth="8" />
              <circle
                cx="50" cy="50" r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 1.2s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-white" style={{ fontFamily: 'Sora' }}>{pct}%</span>
            </div>
          </div>
          <p className="text-slate-300 mt-3 font-medium">
            <span className="text-white font-bold">{correct}</span> de{' '}
            <span className="text-white font-bold">{total}</span> questões corretas
          </p>
          <div className="mt-3 flex items-center gap-2 text-lg">
            <span>{msg.emoji}</span>
            <span className="text-slate-300 text-base text-center">{msg.text}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-8">
          {hasErrors && (
            <button
              onClick={onReview}
              className="w-full py-3.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl border border-slate-600 transition-all"
            >
              🔍 Revisar Erros ({total - correct})
            </button>
          )}
          <button
            onClick={onNew}
            className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-all"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            ▶ Novo Simulado
          </button>
        </div>

        {/* Questions List */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
          <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wide mb-4">
            Todas as Questões
          </h2>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div
                key={r.question_id}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-xl text-sm ${
                  r.is_correct
                    ? 'bg-green-900/20 border border-green-800/40'
                    : 'bg-red-900/20 border border-red-800/40'
                }`}
              >
                <span className={`shrink-0 font-bold mt-0.5 ${r.is_correct ? 'text-green-400' : 'text-red-400'}`}>
                  {r.is_correct ? '✓' : '✗'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 truncate">
                    <span className="text-slate-500 text-xs mr-1">{i + 1}.</span>
                    {r.question.question}
                  </p>
                  {!r.is_correct && (
                    <p className="text-green-400 text-xs mt-0.5 truncate">
                      ✓ {r.question.correct_answer}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
