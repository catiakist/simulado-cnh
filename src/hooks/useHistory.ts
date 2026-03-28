import { useState, useCallback } from 'react';
import type { SimuladoHistory, QuizResult } from '../types';

const STORAGE_KEY = 'simulado_cnh_history';

function loadHistory(): SimuladoHistory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: SimuladoHistory[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function useHistory() {
  const [history, setHistory] = useState<SimuladoHistory[]>(loadHistory);

  const addResult = useCallback((
    results: QuizResult[],
    moduleFilter: string,
    difficultyFilter: string
  ) => {
    const entry: SimuladoHistory = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('pt-BR'),
      module_filter: moduleFilter,
      difficulty_filter: difficultyFilter,
      total: results.length,
      correct: results.filter(r => r.is_correct).length,
      results,
    };
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, 50);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  return { history, addResult, clearHistory };
}
