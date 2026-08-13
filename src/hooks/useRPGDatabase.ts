import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { 
  NoteEntity, 
  Campaign, 
  Session, 
  SessionTimelineLog, 
  RollTable, 
  CharacterEntity 
} from '../types/rpg.types';

/**
 * Hook customizado totalmente integrado para o BookMaster (Versão 3).
 * Reúne todas as operações de Campanhas, Notas (Grimório), Sessões (Timeline),
 * Tabelas de Rolagem (Passo 7) e Fichas/Bestiário (Passo 9) com suporte completo a exclusão e campos adicionais.
 */
export function useRPGDatabase() {
  // --- LEITURAS REATIVAS GLOBAIS ---

  const campaignsQuery = useLiveQuery(() => 
    db.campaigns.orderBy('createdAt').toArray()
  );

  const notesQuery = useLiveQuery(() => 
    db.notes.toArray()
  );

  const sessionsQuery = useLiveQuery(() =>
    db.sessions.toArray()
  );

  const logsQuery = useLiveQuery(() =>
    db.timelineLogs.toArray()
  );

  const rollTablesQuery = useLiveQuery(() =>
    db.rollTables.toArray()
  );

  const charactersQuery = useLiveQuery(() => 
    db.characters.toArray()
  );

  const campaigns = campaignsQuery || [];
  const notes = notesQuery || [];
  const sessions = sessionsQuery || [];
  const logs = logsQuery || [];
  const rollTables = rollTablesQuery || [];
  const characters = charactersQuery || [];

  const loading = 
    campaignsQuery === undefined || 
    notesQuery === undefined || 
    sessionsQuery === undefined || 
    logsQuery === undefined ||
    rollTablesQuery === undefined ||
    charactersQuery === undefined;

  const error: Error | null = null;

  // --- FUNÇÕES AUXILIARES DE LEITURA ---

  const getNotesByCampaign = (campaignId: string) => {
    return notes.filter(note => note.campaignId === campaignId);
  };

  const getSessionsByCampaign = (campaignId: string) => {
    return sessions.filter(sess => sess.campaignId === campaignId);
  };

  const getSessionLogs = (sessionId: string) => {
    return logs
      .filter(log => log.sessionId === sessionId)
      .sort((a, b) => b.timestamp - a.timestamp);
  };

  const getRollTablesByCampaign = (campaignId: string) => {
    return rollTables.filter(table => table.campaignId === campaignId);
  };

  const getCharactersByCampaign = (campaignId: string) => {
    return characters.filter(char => char.campaignId === campaignId);
  };

  // --- MUTADORES / ESCRITA ---

  // 1. CAMPANHAS (Com suporte a exclusão em cascata)
  const createCampaign = async (name: string, system: 'D&D 5e' | 'Pathfinder 2e' | 'Tormenta20' | 'Outro' = 'D&D 5e') => {
    const newCampaign: Campaign = {
      id: crypto.randomUUID(),
      name,
      system,
      progressionType: 'milestone',
      createdAt: Date.now(),
    };
    await db.campaigns.add(newCampaign);
    return newCampaign;
  };

  const deleteCampaign = async (campaignId: string) => {
    // Apaga a campanha
    await db.campaigns.delete(campaignId);
    // Apaga todas as notas da campanha
    await db.notes.where('campaignId').equals(campaignId).delete();
    // Apaga todas as tabelas de rolagem da campanha
    await db.rollTables.where('campaignId').equals(campaignId).delete();
    // Apaga todas as fichas de personagens da campanha
    await db.characters.where('campaignId').equals(campaignId).delete();
    
    // Apaga todas as sessões e seus logs correspondentes em cascata
    const campSessions = await db.sessions.where('campaignId').equals(campaignId).toArray();
    for (const sess of campSessions) {
      await db.sessions.delete(sess.id);
      await db.timelineLogs.where('sessionId').equals(sess.id).delete();
    }
  };

  // 2. NOTAS (Grimório / Wiki-Links)
  const createNote = async (
    campaignId: string, 
    title: string, 
    type: NoteEntity['type'], 
    content: string = ''
  ) => {
    const newNote: NoteEntity = {
      id: crypto.randomUUID(),
      title,
      type,
      content,
      campaignId,
      properties: {
        hp: type === 'monster' || type === 'npc' ? 10 : undefined,
        hpMax: type === 'monster' || type === 'npc' ? 10 : undefined,
        ca: type === 'monster' || type === 'npc' ? 10 : undefined,
        initiativeBonus: type === 'monster' || type === 'npc' ? 0 : undefined,
        conditions: [],
      },
      linkedNoteIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.notes.add(newNote);
    return newNote;
  };

  const updateNote = async (noteId: string, updates: Partial<NoteEntity>) => {
    const existing = await db.notes.get(noteId);
    if (!existing) return;

    let linkedNoteIds = existing.linkedNoteIds;
    if (updates.content !== undefined) {
      const matches = updates.content.match(/\[\[(.*?)\]\]/g);
      linkedNoteIds = matches ? matches.map(m => m.slice(2, -2).trim()) : [];
    }

    await db.notes.update(noteId, {
      ...updates,
      linkedNoteIds,
      updatedAt: Date.now(),
    });
  };

  const deleteNote = async (noteId: string) => {
    await db.notes.delete(noteId);
  };

  // 3. SESSÕES & LOGS
  const createSession = async (campaignId: string, name: string) => {
    const newSession: Session = {
      id: crypto.randomUUID(),
      campaignId,
      name,
      isActive: false,
      createdAt: Date.now(),
    };
    await db.sessions.add(newSession);
    return newSession;
  };

  const toggleSessionActive = async (campaignId: string, sessionId: string, active: boolean) => {
    if (active) {
      const activeSessions = await db.sessions
        .where('campaignId')
        .equals(campaignId)
        .toArray();
      
      for (const sess of activeSessions) {
        await db.sessions.update(sess.id, { isActive: false });
      }
    }
    await db.sessions.update(sessionId, { isActive: active });
  };

  const deleteSession = async (sessionId: string) => {
    await db.sessions.delete(sessionId);
    await db.timelineLogs.where('sessionId').equals(sessionId).delete();
  };

  const addSessionLog = async (sessionId: string, content: string, isHighlight: boolean = false) => {
    const log: SessionTimelineLog = {
      id: crypto.randomUUID(),
      sessionId,
      timestamp: Date.now(),
      content,
      isHighlight,
    };
    await db.timelineLogs.add(log);
    return log;
  };

  const toggleLogHighlight = async (logId: string, isHighlight: boolean) => {
    await db.timelineLogs.update(logId, { isHighlight });
  };

  const deleteSessionLog = async (logId: string) => {
    await db.timelineLogs.delete(logId);
  };

  // 4. TABELAS DE ROLAGEM
  const createRollTable = async (campaignId: string, name: string, formula: string = '1d20') => {
    const newTable: RollTable = {
      id: crypto.randomUUID(),
      campaignId,
      name,
      formula,
      results: [],
    };
    await db.rollTables.add(newTable);
    return newTable;
  };

  const updateRollTable = async (tableId: string, updates: Partial<RollTable>) => {
    await db.rollTables.update(tableId, updates);
  };

  const deleteRollTable = async (tableId: string) => {
    await db.rollTables.delete(tableId);
  };

  // 5. FICHAS & BESTIÁRIO (Fichas e Fichas de monstros D&D completas)
  const createCharacter = async (
    campaignId: string, 
    type: CharacterEntity['type'], 
    name: string,
    avatar?: string
  ) => {
    const newChar: CharacterEntity = {
      id: crypto.randomUUID(),
      campaignId,
      type,
      name,
      avatar,
      alignment: 'Neutro',
      languages: 'Comum',
      hp: type === 'monster' || type === 'villain' ? 15 : 10,
      hpMax: type === 'monster' || type === 'villain' ? 15 : 10,
      hpTemp: 0,
      ca: 10,
      initiative: 0,
      speed: '9 metros',
      attributes: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
      savingThrows: '',
      skills: '',
      senses: 'Percepção Passiva 10',
      resistances: '',
      immunities: '',
      actions: '⚔️ **Espada Curta.** Corpo a corpo: +4 para acertar. Dano: 1d6 + 2 perfurante.',
      bonusActions: '',
      reactions: '',
      biography: '',
      feats: '',
      features: '',
      equipment: '',
      ...(type === 'pc' && {
        class: 'Guerreiro',
        subclass: '',
        level: 1,
        species: 'Humano',
        background: 'Soldado',
        proficiencyBonus: 2,
        xp: 0,
        inspiration: false,
        deathSavesSuccesses: 0,
        deathSavesFailures: 0,
      }),
      ...(type === 'npc' && {
        role: 'Cidadão comum',
        appearance: 'Roupas simples de camponês.',
        personality: 'Pacífico e prestativo.'
      })
    };

    await db.characters.add(newChar);
    return newChar;
  };

  const updateCharacter = async (charId: string, updates: Partial<CharacterEntity>) => {
    await db.characters.update(charId, updates);
  };

  const deleteCharacter = async (charId: string) => {
    await db.characters.delete(charId);
  };

  return {
    campaigns,
    notes,
    sessions,
    rollTables,
    characters,
    loading,
    error,
    getNotesByCampaign,
    getNotesByCampaignRaw: (campaignId: string) => notes.filter(n => n.campaignId === campaignId),
    getSessionsByCampaign,
    getSessionLogs,
    getRollTablesByCampaign,
    getCharactersByCampaign,
    createCampaign,
    deleteCampaign, // Exposto para deletar campanhas ativas!
    createNote,
    updateNote,
    deleteNote,
    createSession,
    toggleSessionActive,
    deleteSession,
    addSessionLog,
    toggleLogHighlight,
    deleteSessionLog,
    createRollTable,
    updateRollTable,
    deleteRollTable,
    createCharacter,
    updateCharacter,
    deleteCharacter,
  };
}
