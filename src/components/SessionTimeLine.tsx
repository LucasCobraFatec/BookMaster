import React, { useState } from 'react';
import type { Session, SessionTimelineLog } from '../types/rpg.types';
import { Plus, Clock } from 'lucide-react';
import { SessionList } from './SessionList';
import { ActiveSessionBanner } from './ActiveSessionBanner';
import { SessionLogForm } from './SessionLogForm';
import { SessionTimelineView } from './SessionTimelineView';

interface SessionTimelineProps {
  campaignId: string;
  sessions: Session[];
  activeSession: Session | null;
  sessionLogs: SessionTimelineLog[];
  onCreateSession: (name: string) => Promise<void>;
  onToggleActive: (sessionId: string, active: boolean) => Promise<void>;
  onDeleteSession: (sessionId: string) => Promise<void>;
  onAddLog: (content: string, isHighlight: boolean) => Promise<void>;
  onToggleHighlight: (logId: string, current: boolean) => Promise<void>;
  onDeleteLog: (logId: string) => Promise<void>;
}

export const SessionTimeline: React.FC<SessionTimelineProps> = ({
  campaignId,
  sessions,
  activeSession,
  sessionLogs,
  onCreateSession,
  onToggleActive,
  onDeleteSession,
  onAddLog,
  onToggleHighlight,
  onDeleteLog,
}) => {
  const [newSessionName, setNewSessionName] = useState('');
  const [logInput, setLogInput] = useState('');
  const [isImportant, setIsHighlight] = useState(false);

  const campaignSessions = sessions.filter(s => s.campaignId === campaignId);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;
    onCreateSession(newSessionName.trim());
    setNewSessionName('');
  };

  const handleSendLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logInput.trim()) return;
    onAddLog(logInput.trim(), isImportant);
    setLogInput('');
    setIsHighlight(false);
  };

  return (
    <div className="flex flex-col h-full min-w-0 w-full bg-rpg-panel">
      <div className="p-4 border-b border-rpg-card/60 bg-rpg-panel/50">
        <h3 className="text-md font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-rpg-accent" />
          Sessões & Diário de Bordo
        </h3>
        <p className="text-xs text-rpg-muted mt-1">
          Registre eventos e cronometre o combate da mesa em tempo real.
        </p>
      </div>

      {!activeSession ? (
        <div className="flex-1 flex flex-col p-4 overflow-y-auto gap-4">
          <form onSubmit={handleCreate} className="flex min-w-0 gap-2">
            <input
              type="text"
              placeholder="Nome da Sessão..."
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              className="min-w-0 flex-1 bg-rpg-card border border-rpg-card text-white text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-rpg-accent"
            />
            <button
              type="submit"
              className="bg-rpg-accent hover:bg-rpg-accent/80 text-white p-1.5 rounded transition-colors"
              title="Nova Sessão"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <SessionList
            campaignSessions={campaignSessions}
            onSelectSession={onToggleActive}
            onDeleteSession={onDeleteSession}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <ActiveSessionBanner
            activeSession={activeSession}
            onToggleActive={onToggleActive}
          />

          <SessionLogForm
            logInput={logInput}
            isImportant={isImportant}
            onLogInputChange={setLogInput}
            onIsImportantChange={setIsHighlight}
            onSubmit={handleSendLog}
          />

          <SessionTimelineView
            sessionLogs={sessionLogs}
            onToggleHighlight={onToggleHighlight}
            onDeleteLog={onDeleteLog}
          />
        </div>
      )}
    </div>
  );
};
