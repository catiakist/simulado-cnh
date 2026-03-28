import type { QuizConfig } from '../types';
import { useState } from 'react';
import allQuestions from '../data/questions.json';

const MODULES = [
  { value: 'all', label: 'Todos os Módulos' },
  { value: 'MÓDULO 1', label: 'Módulo 1 – Placas, Cores e Caminhos' },
  { value: 'MÓDULO 2', label: 'Módulo 2 – Escolhas e Consequências' },
  { value: 'MÓDULO 3', label: 'Módulo 3 – Na Direção da Segurança' },
  { value: 'MÓDULO 4', label: 'Módulo 4 – Cuidar, Agir e Preservar' },
];

const DIFFICULTIES = [
  { value: 'all', label: 'Todas as Dificuldades' },
  { value: 'Fácil', label: '🟢 Fácil' },
  { value: 'Intermediário', label: '🟡 Intermediário' },
  { value: 'Difícil', label: '🔴 Difícil' },
];

const COUNTS = [
  { value: 10, label: '10 questões' },
  { value: 20, label: '20 questões' },
  { value: 30, label: '30 questões' },
  { value: 50, label: '50 questões' },
  { value: 'all', label: 'Todas' },
];

interface Props {
  onStart: (config: QuizConfig) => void;
  onHistory: () => void;
}

export default function HomeScreen({ onStart, onHistory }: Props) {
  const [moduleFilter, setModuleFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [questionCount, setQuestionCount] = useState<number | 'all'>(30);

  // Count available questions with current filters
  const available = (allQuestions as { module: string; difficulty: string }[]).filter(q => {
    const modOk = moduleFilter === 'all' || q.module.includes(moduleFilter);
    const diffOk = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    return modOk && diffOk;
  }).length;

  const effectiveCount = questionCount === 'all'
    ? available
    : Math.min(questionCount, available);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[680px]">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🛞</div>
          <h1 className="text-4xl font-extrabold text-white mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
            Simulado CNH
          </h1>
          <p className="text-slate-400 text-base">Banco Nacional de Questões</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-4 py-1.5 text-sm text-cyan-400 font-medium">
            <span>📚</span>
            <span>1.500 questões disponíveis</span>
          </div>
        </div>

        {/* Filter Card */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-6 space-y-5">
          <h2 className="text-white font-semibold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Configurar Simulado
          </h2>

          {/* Module */}
          <div>
            <label className="block text-slate-400 text-sm mb-2 font-medium">Módulo</label>
            <select
              value={moduleFilter}
              onChange={e => setModuleFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {MODULES.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-slate-400 text-sm mb-2 font-medium">Dificuldade</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DIFFICULTIES.map(d => (
                <button
                  key={d.value}
                  onClick={() => setDifficultyFilter(d.value)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                    difficultyFilter === d.value
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div>
            <label className="block text-slate-400 text-sm mb-2 font-medium">Número de Questões</label>
            <div className="flex flex-wrap gap-2">
              {COUNTS.map(c => (
                <button
                  key={String(c.value)}
                  onClick={() => setQuestionCount(c.value as number | 'all')}
                  className={`py-1.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                    questionCount === c.value
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-900/60 rounded-xl px-4 py-3 text-sm text-slate-400">
            Serão sorteadas{' '}
            <span className="text-cyan-400 font-semibold">{effectiveCount}</span>{' '}
            questões de{' '}
            <span className="text-slate-300">{available} disponíveis</span>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={() => onStart({ moduleFilter, difficultyFilter, questionCount })}
          disabled={available === 0}
          className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold text-lg rounded-2xl transition-all active:scale-[0.98]"
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          Iniciar Simulado →
        </button>

        {/* History Link */}
        <button
          onClick={onHistory}
          className="w-full mt-3 py-3 text-slate-400 hover:text-slate-300 text-sm transition-colors"
        >
          📋 Ver Histórico de Simulados
        </button>
      </div>
    </div>
  );
}
