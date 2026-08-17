import { db } from '../db/database';
import type { Campaign, CharacterEntity, NoteEntity, RollTable, Session, SessionTimelineLog } from '../types/rpg.types';

export interface CampaignBackup {
  format: 'bookmaster-campaign-backup';
  formatVersion: 1;
  exportedAt: string;
  campaign: Campaign;
  data: {
    notes: NoteEntity[];
    characters: CharacterEntity[];
    rollTables: RollTable[];
    sessions: Session[];
    timelineLogs: SessionTimelineLog[];
  };
}

export async function createCampaignBackup(campaignId: string): Promise<CampaignBackup> {
  const campaign = await db.campaigns.get(campaignId);
  if (!campaign) throw new Error('A campanha ativa não foi encontrada.');
  const [notes, characters, rollTables, sessions] = await Promise.all([
    db.notes.where('campaignId').equals(campaignId).toArray(),
    db.characters.where('campaignId').equals(campaignId).toArray(),
    db.rollTables.where('campaignId').equals(campaignId).toArray(),
    db.sessions.where('campaignId').equals(campaignId).toArray(),
  ]);
  const sessionIds = sessions.map((session) => session.id);
  const timelineLogs = sessionIds.length ? await db.timelineLogs.where('sessionId').anyOf(sessionIds).toArray() : [];
  return { format: 'bookmaster-campaign-backup', formatVersion: 1, exportedAt: new Date().toISOString(), campaign, data: { notes, characters, rollTables, sessions, timelineLogs } };
}

function validateBackup(value: unknown): CampaignBackup {
  if (!value || typeof value !== 'object') throw new Error('O arquivo não contém um backup válido.');
  const backup = value as Partial<CampaignBackup>;
  if (backup.format !== 'bookmaster-campaign-backup') throw new Error('Este JSON não é um backup de campanha do BookMaster.');
  if (backup.formatVersion !== 1) throw new Error(`Versão de backup não suportada: ${String(backup.formatVersion)}.`);
  if (!backup.campaign || typeof backup.campaign.name !== 'string' || !backup.data) throw new Error('O backup está incompleto ou corrompido.');
  for (const key of ['notes', 'characters', 'rollTables', 'sessions', 'timelineLogs'] as const) {
    if (!Array.isArray(backup.data[key])) throw new Error(`O backup não possui a coleção obrigatória “${key}”.`);
  }
  return backup as CampaignBackup;
}

function remapDeep<T>(value: T, ids: Map<string, string>): T {
  if (typeof value === 'string') return (ids.get(value) ?? value) as T;
  if (Array.isArray(value)) return value.map((item) => remapDeep(item, ids)) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, remapDeep(child, ids)])) as T;
  return value;
}

export async function restoreCampaignBackup(content: string): Promise<Campaign> {
  let parsed: unknown;
  try { parsed = JSON.parse(content); } catch { throw new Error('O arquivo selecionado não contém um JSON válido.'); }
  const backup = validateBackup(parsed);
  const existingCampaigns = await db.campaigns.toArray();
  const baseName = `${backup.campaign.name} (Restaurada)`;
  let name = baseName;
  let number = 2;
  while (existingCampaigns.some((campaign) => campaign.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase())) {
    name = `${baseName} ${number}`;
    number += 1;
  }

  const allEntities = [backup.campaign, ...backup.data.notes, ...backup.data.characters, ...backup.data.rollTables, ...backup.data.sessions, ...backup.data.timelineLogs];
  const ids = new Map(allEntities.map((entity) => [entity.id, crypto.randomUUID()]));
  const campaign: Campaign = { ...remapDeep(backup.campaign, ids), id: ids.get(backup.campaign.id)!, name, createdAt: Date.now() };
  const withCampaign = <T extends { id: string; campaignId: string }>(items: T[]) => items.map((item) => ({ ...remapDeep(item, ids), id: ids.get(item.id)!, campaignId: campaign.id }));
  const notes = withCampaign(backup.data.notes);
  const characters = withCampaign(backup.data.characters);
  const rollTables = withCampaign(backup.data.rollTables);
  const sessions = withCampaign(backup.data.sessions);
  const timelineLogs = backup.data.timelineLogs.map((log) => ({ ...remapDeep(log, ids), id: ids.get(log.id)!, sessionId: ids.get(log.sessionId) ?? log.sessionId }));

  await db.transaction('rw', [db.campaigns, db.notes, db.characters, db.rollTables, db.sessions, db.timelineLogs], async () => {
    await db.campaigns.add(campaign);
    if (notes.length) await db.notes.bulkAdd(notes);
    if (characters.length) await db.characters.bulkAdd(characters);
    if (rollTables.length) await db.rollTables.bulkAdd(rollTables);
    if (sessions.length) await db.sessions.bulkAdd(sessions);
    if (timelineLogs.length) await db.timelineLogs.bulkAdd(timelineLogs);
  });
  return campaign;
}

export function backupFileName(campaignName: string) {
  const safeName = campaignName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '') || 'campanha';
  return `BookMaster-Backup-${safeName}-${new Date().toISOString().slice(0, 10)}.json`;
}
