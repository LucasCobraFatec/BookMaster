import type { CharacterEntity, NoteEntity } from '../types/rpg.types';

export type WikiLinkTarget =
  | { kind: 'note'; entity: NoteEntity }
  | { kind: 'character'; entity: CharacterEntity };

export function normalizeWikiLinkTitle(title: string): string {
  return title.trim().normalize('NFC').toLocaleLowerCase();
}

export function parseWikiLinkTarget(title: string): { title: string; preferredKind?: WikiLinkTarget['kind'] } {
  const trimmed = title.trim();
  const explicitTarget = trimmed.match(/^(nota|ficha)\s*:\s*(.+)$/i);

  if (!explicitTarget) return { title: trimmed };

  return {
    title: explicitTarget[2].trim(),
    preferredKind: explicitTarget[1].toLocaleLowerCase() === 'ficha' ? 'character' : 'note',
  };
}

export function resolveWikiLinkTarget(
  rawTitle: string,
  notes: NoteEntity[],
  characters: CharacterEntity[],
): WikiLinkTarget | undefined {
  const { title, preferredKind } = parseWikiLinkTarget(rawTitle);
  const normalizedTitle = normalizeWikiLinkTitle(title);
  const note = notes.find((item) => normalizeWikiLinkTitle(item.title) === normalizedTitle);
  const character = characters.find((item) => normalizeWikiLinkTitle(item.name) === normalizedTitle);

  if (preferredKind === 'note') return note ? { kind: 'note', entity: note } : undefined;
  if (preferredKind === 'character') return character ? { kind: 'character', entity: character } : undefined;

  // Nomes de fichas são referências mais específicas que notas de lore homônimas.
  if (character) return { kind: 'character', entity: character };
  if (note) return { kind: 'note', entity: note };
  return undefined;
}

export function getWikiLinkTitles(content: string): string[] {
  const matches = content.match(/\[\[(.*?)\]\]/g) ?? [];

  return matches
    .map((match) => match.slice(2, -2).split('|')[0].trim())
    .filter(Boolean);
}

export function resolveWikiLinkIds(content: string, notes: NoteEntity[]): string[] {
  const noteIdsByTitle = new Map(
    notes.map((note) => [normalizeWikiLinkTitle(note.title), note.id]),
  );

  return [...new Set(
    getWikiLinkTitles(content)
      .map((title) => parseWikiLinkTarget(title))
      .filter((target) => target.preferredKind !== 'character')
      .map((target) => noteIdsByTitle.get(normalizeWikiLinkTitle(target.title)))
      .filter((noteId): noteId is string => Boolean(noteId)),
  )];
}
