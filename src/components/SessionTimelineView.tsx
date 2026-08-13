import React from 'react';
import type { SessionTimelineLog } from '../types/rpg.types';
import { Clock, Star, Trash2 } from 'lucide-react';

interface SessionTimelineProps {
  sessionLogs: SessionTimelineLog[];
  onToggleHighlight: (logId: string, current: boolean) => Promise<void>;
  onDeleteLog: (logId: string) => Promise<void>;
}

const formatTime = (timestamp: number) => {
  const d = new Date(timestamp);
  return d.toTimeString().split(' ')[0];
};

export const SessionTimelineView: React.FC<SessionTimelineProps> = ({
  sessionLogs,
  onToggleHighlight,
  onDeleteLog,
}) => (
  <div className="flex-1 overflow-hidden p-4 space-y-3.5">
    {sessionLogs.length === 0 ? (
      <div className="text-center py-16 text-rpg-muted">
        <Clock className="w-8 h-8 text-rpg-muted/40 mx-auto mb-2" />
        <p className="text-xs">A linha do tempo está limpa.</p>
        <p className="text-[10px] mt-1">
          Insira seu primeiro log ou cause dano a um monstro no Grimório lateral!
        </p>
      </div>
    ) : (
      sessionLogs.map((log) => (
        <div
          key={log.id}
          className={`relative p-3 rounded border text-xs leading-relaxed transition-all group ${
            log.isHighlight
              ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-100 shadow-md shadow-yellow-500/5'
              : 'bg-rpg-card/25 border-rpg-card/50 text-rpg-text'
          }`}
        >
          <div className="flex justify-between items-center mb-1 text-[10px]">
            <span className="text-rpg-muted font-mono flex items-center gap-1 font-bold">
              <Clock className="w-3 h-3 text-rpg-muted/60" />
              {formatTime(log.timestamp)}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button
                onClick={() => onToggleHighlight(log.id, !log.isHighlight)}
                className={`p-0.5 rounded hover:bg-rpg-card transition-all ${
                  log.isHighlight ? 'text-yellow-400' : 'text-rpg-muted hover:text-yellow-400'
                }`}
                title="Destaque"
              >
                <Star className={`w-3.5 h-3.5 ${log.isHighlight ? 'fill-yellow-400' : ''}`} />
              </button>
              <button
                onClick={() => onDeleteLog(log.id)}
                className="p-0.5 text-rpg-muted hover:text-red-400 rounded hover:bg-rpg-card transition-all"
                title="Excluir Log"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="whitespace-pre-wrap">{log.content}</p>
        </div>
      ))
    )}
  </div>
);
