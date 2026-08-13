import type { NoteEntity } from '../types/rpg.types';

export function getWikiLinkTitles(content: string): string[] {
  const matches = content.match(/\[\[(.*?)\]\]/g) ?? [];

  return matches
    .map((match) => match.slice(2, -2).split('|')[0].trim())
    .filter(Boolean);
}

export function resolveWikiLinkIds(content: string, notes: NoteEntity[]): string[] {
  const noteIdsByTitle = new Map(
    notes.map((note) => [note.title.trim().toLocaleLowerCase(), note.id]),
  );

  return [...new Set(
    getWikiLinkTitles(content)
      .map((title) => noteIdsByTitle.get(title.toLocaleLowerCase()))
      .filter((noteId): noteId is string => Boolean(noteId)),
  )];
}
