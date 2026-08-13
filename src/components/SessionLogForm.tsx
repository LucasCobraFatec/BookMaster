import React from 'react';
import { Star } from 'lucide-react';

interface SessionLogFormProps {
  logInput: string;
  isImportant: boolean;
  onLogInputChange: (value: string) => void;
  onIsImportantChange: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const SessionLogForm: React.FC<SessionLogFormProps> = ({
  logInput,
  isImportant,
  onLogInputChange,
  onIsImportantChange,
  onSubmit,
}) => (
  <form onSubmit={onSubmit} className="p-3 border-b border-rpg-card/60 bg-rpg-card/20 flex flex-col gap-2">
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="O que aconteceu agora na mesa?..."
        value={logInput}
        onChange={(e) => onLogInputChange(e.target.value)}
        className="flex-1 bg-rpg-card border border-rpg-card text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-rpg-accent text-white"
      />
      <button
        type="submit"
        className="bg-rpg-accent hover:bg-rpg-accent/90 text-white font-bold px-3 py-1.5 rounded text-xs transition-colors flex-shrink-0"
      >
        Log
      </button>
    </div>
    <label className="flex items-center gap-1.5 select-none cursor-pointer">
      <input
        type="checkbox"
        checked={isImportant}
        onChange={(e) => onIsImportantChange(e.target.checked)}
        className="accent-rpg-accent rounded border-rpg-card w-3.5 h-3.5 bg-rpg-card focus:ring-0"
      />
      <span className="text-[10px] text-rpg-muted flex items-center gap-1 hover:text-white transition-colors">
        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500/20" />
        Marcar como Evento Importante / Destaque
      </span>
    </label>
  </form>
);
