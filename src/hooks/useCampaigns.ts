import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Campaign } from '../types/rpg.types';
import { createCampaignBackup, restoreCampaignBackup } from '../lib/campaignBackup';

export function useCampaigns() {
  const query = useLiveQuery(() => db.campaigns.orderBy('createdAt').toArray());
  const campaigns = query ?? [];

  const createCampaign = async (name: string, system: Campaign['system'] = 'D&D 5e') => {
    const campaign: Campaign = { id: crypto.randomUUID(), name, system, progressionType: 'milestone', createdAt: Date.now() };
    await db.campaigns.add(campaign);
    return campaign;
  };

  const deleteCampaign = async (campaignId: string) => {
    await db.transaction('rw', [db.campaigns, db.notes, db.rollTables, db.characters, db.sessions, db.timelineLogs], async () => {
      const sessions = await db.sessions.where('campaignId').equals(campaignId).toArray();
      await Promise.all([
        db.campaigns.delete(campaignId), db.notes.where('campaignId').equals(campaignId).delete(),
        db.rollTables.where('campaignId').equals(campaignId).delete(), db.characters.where('campaignId').equals(campaignId).delete(),
        db.sessions.where('campaignId').equals(campaignId).delete(),
        ...sessions.map((session) => db.timelineLogs.where('sessionId').equals(session.id).delete()),
      ]);
    });
  };

  return { campaigns, loading: query === undefined, createCampaign, deleteCampaign, createCampaignBackup, restoreCampaignBackup };
}
