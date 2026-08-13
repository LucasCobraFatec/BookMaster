import { describe, expect, it } from 'vitest';
import type { NoteEntity } from '../types/rpg.types';
import { getWikiLinkTitles, resolveWikiLinkIds } from './wikiLinks';

const notes: NoteEntity[] = [
  { id: 'castle', title: 'Castelo', type: 'location', content: '', campaignId: 'campaign', properties: {}, linkedNoteIds: [], createdAt: 0, updatedAt: 0 },
  { id: 'guard', title: 'Guarda Real', type: 'npc', content: '', campaignId: 'campaign', properties: {}, linkedNoteIds: [], createdAt: 0, updatedAt: 0 },
];

describe('wiki links', () => {
  it('extracts targets and ignores custom labels', () => {
    expect(getWikiLinkTitles('Visite [[Castelo|a fortaleza]] e fale com [[Guarda Real]].')).toEqual([
      'Castelo',
      'Guarda Real',
    ]);
  });

  it('resolves known targets to unique note IDs', () => {
    expect(resolveWikiLinkIds('[[castelo]] [[Guarda Real]] [[Castelo]] [[Inexistente]]', notes)).toEqual([
      'castle',
      'guard',
    ]);
  });
});
