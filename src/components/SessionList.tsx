import React from 'react';
import type { Session } from '../types/rpg.types';
import { Play, Trash2 } from 'lucide-react';

interface SessionListProps {
  campaignSessions: Session[];
  onSelectSession: (sessionId: string, active: boolean) => Promise<void>;
  onDeleteSession: (sessionId: string) => Promise<void>;
}

export const SessionList: React.FC<SessionListProps> = ({
  campaignSessions,
  onSelectSession,
  onDeleteSession,
}) => {
  return (
    <div className="flex-1 space-y-2.5">
      <p className="text-xs font-semibold text-rpg-muted uppercase tracking-wider">
        Histórico de Sessões
      </p>
      {campaignSessions.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-rpg-card rounded p-4">
          <p className="text-xs text-rpg-muted">Nenhuma sessão criada nesta campanha.</p>
        </div>
      ) : (
        campaignSessions.map((sess) => (
          <div
            key={sess.id}
            className="bg-rpg-card/50 border border-rpg-card/40 rounded p-3 flex justify-between items-center group hover:border-rpg-accent/35 transition-colors"
          >
            <div>
              <h4 className="text-xs font-bold text-white leading-none">{sess.name}</h4>
              <span className="text-[10px] text-rpg-muted">
                {new Date(sess.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onSelectSession(sess.id, true)}
                className="text-emerald-400 hover:text-emerald-300 p-1 hover:bg-emerald-500/10 rounded transition-all"
                title="Iniciar Sessão"
              >
                <Play className="w-3.5 h-3.5 fill-emerald-400/20" />
              </button>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'Isso excluirá a sessão e todos os seus logs permanentes. Confirmar?'
                    )
                  ) {
                    onDeleteSession(sess.id);
                  }
                }}
                className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded transition-all"
                title="Deletar Sessão"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
