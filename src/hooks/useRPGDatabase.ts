import { useCampaigns } from './useCampaigns';
import { useEntities } from './useEntities';
import { useNotes } from './useNotes';
import { useRollTables } from './useRollTables';
import { useSessions } from './useSessions';

/** Fachada de compatibilidade que combina os hooks do domínio do BookMaster. */
export function useRPGDatabase(campaignId: string) {
  const campaigns = useCampaigns();
  const notes = useNotes(campaignId);
  const sessions = useSessions(campaignId);
  const rollTables = useRollTables(campaignId);
  const entities = useEntities(campaignId);

  return {
    ...campaigns, ...notes, ...sessions, ...rollTables, ...entities,
    loading: campaigns.loading || notes.loading || sessions.loading || rollTables.loading || entities.loading,
    error: null as Error | null,
    getNotesByCampaignRaw: notes.getNotesByCampaign,
  };
}
