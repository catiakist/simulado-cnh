import type { Difficulty } from '../types';

const styles: Record<Difficulty, string> = {
  'Fácil': 'bg-green-900/60 text-green-300 border border-green-700/50',
  'Intermediário': 'bg-yellow-900/60 text-yellow-300 border border-yellow-700/50',
  'Difícil': 'bg-red-900/60 text-red-300 border border-red-700/50',
};

export default function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[difficulty]}`}>
      {difficulty}
    </span>
  );
}
