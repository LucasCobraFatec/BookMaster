import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { resolveWikiLinkIds } from '../lib/wikiLinks';
import type { NoteEntity } from '../types/rpg.types';

export function useNotes(campaignId: string) {
  const query = useLiveQuery(() => campaignId ? db.notes.where('campaignId').equals(campaignId).toArray() : Promise.resolve<NoteEntity[]>([]), [campaignId]);
  const notes = query ?? [];

  const createNote = async (targetCampaignId: string, title: string, type: NoteEntity['type'], content = '') => {
    const combatant = type === 'monster' || type === 'npc';
    const note: NoteEntity = { id: crypto.randomUUID(), title, type, content, campaignId: targetCampaignId, properties: { hp: combatant ? 10 : undefined, hpMax: combatant ? 10 : undefined, ca: combatant ? 10 : undefined, initiativeBonus: combatant ? 0 : undefined, conditions: [] }, linkedNoteIds: [], createdAt: Date.now(), updatedAt: Date.now(), isDraft: true };
    await db.notes.add(note);
    return note;
  };

  const updateNote = async (noteId: string, updates: Partial<NoteEntity>) => {
    const existing = await db.notes.get(noteId);
    if (!existing) return;
    const campaignNotes = updates.content === undefined ? [] : await db.notes.where('campaignId').equals(existing.campaignId).toArray();
    await db.notes.update(noteId, { ...updates, linkedNoteIds: updates.content === undefined ? existing.linkedNoteIds : resolveWikiLinkIds(updates.content, campaignNotes), updatedAt: Date.now() });
  };

  return { notes, loading: query === undefined, getNotesByCampaign: (id: string) => notes.filter((note) => note.campaignId === id), createNote, updateNote, deleteNote: (noteId: string) => db.notes.delete(noteId) };
}
