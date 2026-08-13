import React from 'react';
import { Award } from 'lucide-react';

interface RollResultProps {
  rolledNumber: number;
  rollingResult: string;
  isVisible: boolean;
}

export const RollResult: React.FC<RollResultProps> = ({
  rolledNumber,
  rollingResult,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="bg-rpg-panel border border-rpg-accent/30 rounded-lg p-4 text-center relative overflow-hidden animate-pulse">
      <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] text-rpg-muted">
        <Award className="w-3 h-3 text-rpg-accent" />
        Resultado da Rolagem
      </div>
      <div className="text-3xl font-extrabold text-white font-mono mt-1">
        {rolledNumber}
      </div>
      <div className="text-sm font-bold text-rpg-accent mt-2 max-w-md mx-auto">
        {rollingResult || 'Rolando os dados mágicos...'}
      </div>
    </div>
  );
};
