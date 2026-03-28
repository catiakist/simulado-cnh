import type { SimuladoHistory } from '../types';

interface Props {
  history: SimuladoHistory[];
  onClear: () => void;
  onBack: () => void;
}

export default function HistoryScreen({ history, onClear, onBack }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-[680px]">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
          >
            ← Voltar
          </button>
          <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
            Histórico
          </h1>
          <button
            onClick={onClear}
            className="text-red-400 hover:text-red-300 text-sm transition-colors"
          >
            Limpar
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center text-slate-500 py-20">
            <div className="text-5xl mb-4">📋</div>
            <p>Nenhum simulado realizado ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(h => {
              const pct = Math.round((h.correct / h.total) * 100);
              const color = pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500';
              const textColor = pct >= 70 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400';
              return (
                <div
                  key={h.id}
                  className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {h.module_filter === 'all' ? 'Todos os Módulos' : h.module_filter}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {h.difficulty_filter === 'all' ? 'Todas as dificuldades' : h.difficulty_filter} · {h.date}
                      </p>
                    </div>
                    <span className={`text-lg font-extrabold ${textColor}`} style={{ fontFamily: 'Sora' }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-slate-400 text-xs mt-2">
                    {h.correct} / {h.total} corretas
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
