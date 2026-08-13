import Dexie, { type Table } from 'dexie';
import type {
  Campaign,
  NoteEntity,
  Session,
  SessionTimelineLog,
  RollTable,
  SoundTrack,
  CharacterEntity // <-- Nova importação de tipos!
} from '../types/rpg.types';

export class RPGMasterDatabase extends Dexie {
  campaigns!: Table<Campaign, string>;
  notes!: Table<NoteEntity, string>;
  sessions!: Table<Session, string>;
  timelineLogs!: Table<SessionTimelineLog, string>;
  rollTables!: Table<RollTable, string>;
  sounds!: Table<SoundTrack, string>;
  characters!: Table<CharacterEntity, string>; // <-- Tabela declarada no IndexedDB!

  constructor() {
    super('RPGMasterDatabase');

    // Schema Versão 2: Adiciona a tabela characters e seus índices de busca rápida
    this.version(2).stores({
      campaigns: 'id, name, system, createdAt',
      notes: 'id, title, type, campaignId, *linkedNoteIds, updatedAt',
      sessions: 'id, campaignId, isActive, createdAt',
      timelineLogs: 'id, sessionId, timestamp',
      rollTables: 'id, campaignId, name',
      sounds: 'id, name, type, category',
      characters: 'id, campaignId, type, name', // Índices para buscas cruzadas por tipo ou nome
    });

    this.version(3)
      .stores({
        campaigns: 'id, name, system, createdAt',
        notes: 'id, title, type, campaignId, *linkedNoteIds, updatedAt',
        sessions: 'id, campaignId, isActive, createdAt',
        timelineLogs: 'id, sessionId, timestamp',
        rollTables: 'id, campaignId, name',
        sounds: 'id, name, type, category',
        characters: 'id, campaignId, type, name',
      })
      .upgrade(async (transaction) => {
        const notes = await transaction.table('notes').toArray() as NoteEntity[];
        const notesByCampaign = new Map<string, Map<string, string>>();

        for (const note of notes) {
          const campaignNotes = notesByCampaign.get(note.campaignId) ?? new Map<string, string>();
          campaignNotes.set(note.title.trim().toLocaleLowerCase(), note.id);
          notesByCampaign.set(note.campaignId, campaignNotes);
        }

        await Promise.all(
          notes.map((note) => {
            const noteIds = (note.linkedNoteIds ?? [])
              .map((link) => notesByCampaign.get(note.campaignId)?.get(link.trim().toLocaleLowerCase()) ?? link)
              .filter((link) => notes.some((candidate) => candidate.id === link));

            return transaction.table('notes').update(note.id, { linkedNoteIds: [...new Set(noteIds)] });
          }),
        );
      });
  }
}

export const db = new RPGMasterDatabase();
