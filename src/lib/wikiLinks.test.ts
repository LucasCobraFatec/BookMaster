import { describe, expect, it } from 'vitest';
import type { CharacterEntity, NoteEntity } from '../types/rpg.types';
import { getWikiLinkTitles, resolveWikiLinkIds, resolveWikiLinkTarget } from './wikiLinks';

const notes: NoteEntity[] = [
  { id: 'castle', title: 'Castelo', type: 'location', content: '', campaignId: 'campaign', properties: {}, linkedNoteIds: [], createdAt: 0, updatedAt: 0 },
  { id: 'guard', title: 'Guarda Real', type: 'npc', content: '', campaignId: 'campaign', properties: {}, linkedNoteIds: [], createdAt: 0, updatedAt: 0 },
];
const character = { id: 'character', name: 'Guarda Real', campaignId: 'campaign', type: 'npc' } as CharacterEntity;

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

  it('opens a character instead of a homonymous lore note', () => {
    expect(resolveWikiLinkTarget('  Guarda Real  ', notes, [character])).toEqual({
      kind: 'character',
      entity: character,
    });
  });

  it('supports explicit nota: and ficha: targets to disambiguate names', () => {
    expect(resolveWikiLinkTarget('nota: Guarda Real', notes, [character])?.kind).toBe('note');
    expect(resolveWikiLinkTarget('ficha: Guarda Real', notes, [character])?.kind).toBe('character');
    expect(resolveWikiLinkIds('[[ficha: Guarda Real]] [[nota: Guarda Real]]', notes)).toEqual(['guard']);
  });
});
