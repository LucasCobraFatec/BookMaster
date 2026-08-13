import React from 'react';
import type { Session } from '../types/rpg.types';
import { Square } from 'lucide-react';

interface ActiveSessionBannerProps {
  activeSession: Session;
  onToggleActive: (sessionId: string, active: boolean) => Promise<void>;
}

export const ActiveSessionBanner: React.FC<ActiveSessionBannerProps> = ({
  activeSession,
  onToggleActive,
}) => (
  <div className="p-3 bg-emerald-500/5 border-b border-emerald-500/10 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
      <div>
        <p className="text-xs font-bold text-white leading-none">{activeSession.name}</p>
        <p className="text-[10px] text-emerald-400/80 mt-0.5">Sessão em Andamento... 🎲</p>
      </div>
    </div>
    <button
      onClick={() => onToggleActive(activeSession.id, false)}
      className="text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-2 py-1 rounded flex items-center gap-1 transition-all"
      title="Encerrar Sessão"
    >
      <Square className="w-3 h-3 fill-red-400/20" />
      Finalizar
    </button>
  </div>
);
