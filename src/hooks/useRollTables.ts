import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { RollTable } from '../types/rpg.types';

export function useRollTables(campaignId: string) {
  const query = useLiveQuery(() => campaignId ? db.rollTables.where('campaignId').equals(campaignId).toArray() : Promise.resolve<RollTable[]>([]), [campaignId]);
  const rollTables = query ?? [];
  const createRollTable = async (targetCampaignId: string, name: string, formula = '1d20') => { const table: RollTable = { id: crypto.randomUUID(), campaignId: targetCampaignId, name, formula, results: [] }; await db.rollTables.add(table); return table; };
  const updateRollTable = async (id: string, updates: Partial<RollTable>): Promise<void> => { await db.rollTables.update(id, updates); };
  const deleteRollTable = async (id: string): Promise<void> => { await db.rollTables.delete(id); };
  return { rollTables, loading: query === undefined, getRollTablesByCampaign: (id: string) => rollTables.filter((table) => table.campaignId === id), createRollTable, updateRollTable, deleteRollTable };
}
