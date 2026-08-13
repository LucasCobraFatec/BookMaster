import React from 'react';
import type { NoteEntity } from '../types/rpg.types';

interface WikiLinkProps {
  targetTitle: string;
  displayName: string;
  previewNote?: NoteEntity;
  onLinkClick: (noteTitle: string) => void;
}

export const WikiLink: React.FC<WikiLinkProps> = ({
  targetTitle,
  displayName,
  previewNote,
  onLinkClick,
}) => {
  if (previewNote) {
    return (
      <button
        onClick={() => onLinkClick(targetTitle)}
        className="group relative text-rpg-accent hover:underline font-semibold transition-all duration-150 inline-block px-1 rounded hover:bg-rpg-accent/10"
      >
        {displayName}
        <span className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 hidden w-64 rounded-lg border border-rpg-card bg-rpg-panel p-3 text-left shadow-xl group-hover:block">
          <span className="mb-1 block text-xs font-bold text-white">{previewNote.title}</span>
          <span className="block max-h-24 overflow-hidden whitespace-pre-line text-[11px] font-normal leading-relaxed text-rpg-muted">{previewNote.content.slice(0, 220) || 'Nota sem conteúdo.'}</span>
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={() => onLinkClick(targetTitle)}
      title="Clique para criar esta nota instantaneamente"
      className="text-rpg-muted/70 border-b border-dashed border-rpg-muted/40 hover:text-rpg-accent hover:border-rpg-accent transition-all duration-150 inline-block px-1"
    >
      {displayName} 👻
    </button>
  );
};
