import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Session, SessionTimelineLog } from '../types/rpg.types';

export function useSessions(campaignId: string) {
  const sessionsQuery = useLiveQuery(() => campaignId ? db.sessions.where('campaignId').equals(campaignId).toArray() : Promise.resolve<Session[]>([]), [campaignId]);
  const logsQuery = useLiveQuery(() => db.timelineLogs.toArray());
  const sessions = sessionsQuery ?? [];
  const logs = logsQuery ?? [];

  const createSession = async (targetCampaignId: string, name: string) => { const session: Session = { id: crypto.randomUUID(), campaignId: targetCampaignId, name, isActive: false, createdAt: Date.now() }; await db.sessions.add(session); return session; };
  const toggleSessionActive = async (targetCampaignId: string, sessionId: string, active: boolean) => { await db.transaction('rw', db.sessions, async () => { if (active) { const campaignSessions = await db.sessions.where('campaignId').equals(targetCampaignId).toArray(); await Promise.all(campaignSessions.map((session) => db.sessions.update(session.id, { isActive: false }))); } await db.sessions.update(sessionId, { isActive: active }); }); };
  const deleteSession = async (sessionId: string) => { await db.transaction('rw', db.sessions, db.timelineLogs, async () => { await db.sessions.delete(sessionId); await db.timelineLogs.where('sessionId').equals(sessionId).delete(); }); };
  const addSessionLog = async (sessionId: string, content: string, isHighlight = false) => { const log: SessionTimelineLog = { id: crypto.randomUUID(), sessionId, content, isHighlight, timestamp: Date.now() }; await db.timelineLogs.add(log); return log; };

  return { sessions, loading: sessionsQuery === undefined || logsQuery === undefined, getSessionsByCampaign: (id: string) => sessions.filter((session) => session.campaignId === id), getSessionLogs: (id: string) => logs.filter((log) => log.sessionId === id).sort((left, right) => right.timestamp - left.timestamp), createSession, toggleSessionActive, deleteSession, addSessionLog, toggleLogHighlight: (id: string, isHighlight: boolean) => db.timelineLogs.update(id, { isHighlight }), deleteSessionLog: (id: string) => db.timelineLogs.delete(id) };
}
