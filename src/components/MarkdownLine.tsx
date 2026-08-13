import React from 'react';
import { FormattedText } from './FormattedText';
import { MarkdownImage } from './MarkdownImage';
import type { CharacterEntity, NoteEntity } from '../types/rpg.types';

interface MarkdownLineProps {
  line: string;
  lineIndex: number;
  existingNotes: NoteEntity[];
  existingCharacters: CharacterEntity[];
  onLinkClick: (noteTitle: string) => void;
}

export const MarkdownLine: React.FC<MarkdownLineProps> = ({
  line,
  lineIndex,
  existingNotes,
  existingCharacters,
  onLinkClick,
}) => {
  const lineKey = `line-${lineIndex}`;

  if (line.trim() === '') {
    return <div key={lineKey} className="h-2" />;
  }

  const obsidianImage = line.trim().match(/^!\[\[([^|\]]+)(?:\|(\d+))?\]\]$/);
  if (obsidianImage) return <MarkdownImage source={obsidianImage[1]} alt={obsidianImage[1]} width={obsidianImage[2] ? Number(obsidianImage[2]) : undefined} />;

  const markdownImage = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (markdownImage) return <MarkdownImage alt={markdownImage[1]} source={markdownImage[2]} />;

  if (line.startsWith('# ')) {
    return (
      <h1 key={lineKey} className="text-2xl font-extrabold text-white pt-4 pb-1 border-b border-rpg-card">
        <FormattedText
          text={line.substring(2)}
          existingNotes={existingNotes}
          existingCharacters={existingCharacters}
          onLinkClick={onLinkClick}
          lineKey={`${lineKey}-h1`}
        />
      </h1>
    );
  }

  if (line.startsWith('## ')) {
    return (
      <h2 key={lineKey} className="text-xl font-bold text-white pt-3 pb-1 border-b border-rpg-card/40">
        <FormattedText
          text={line.substring(3)}
          existingNotes={existingNotes}
          existingCharacters={existingCharacters}
          onLinkClick={onLinkClick}
          lineKey={`${lineKey}-h2`}
        />
      </h2>
    );
  }

  if (line.startsWith('### ')) {
    return (
      <h3 key={lineKey} className="text-lg font-semibold text-white/90 pt-2">
        <FormattedText
          text={line.substring(4)}
          existingNotes={existingNotes}
          existingCharacters={existingCharacters}
          onLinkClick={onLinkClick}
          lineKey={`${lineKey}-h3`}
        />
      </h3>
    );
  }

  if (line.startsWith('#### ')) {
    return (
      <h4 key={lineKey} className="pt-2 text-xs font-bold uppercase tracking-wider text-sky-400">
        <FormattedText
          text={line.substring(5)}
          existingNotes={existingNotes}
          existingCharacters={existingCharacters}
          onLinkClick={onLinkClick}
          lineKey={`${lineKey}-h4`}
        />
      </h4>
    );
  }

  if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
    const listContent = line.replace(/^\s*[-*]\s+/, '');
    return (
      <div key={lineKey} className="flex items-start pl-4">
        <span className="text-rpg-accent mr-2 select-none">•</span>
        <p className="flex-1">
          <FormattedText
            text={listContent}
            existingNotes={existingNotes}
            existingCharacters={existingCharacters}
            onLinkClick={onLinkClick}
            lineKey={`${lineKey}-list`}
          />
        </p>
      </div>
    );
  }

  return (
    <p key={lineKey} className="text-rpg-text/90">
      <FormattedText
        text={line}
        existingNotes={existingNotes}
        existingCharacters={existingCharacters}
        onLinkClick={onLinkClick}
        lineKey={`${lineKey}-p`}
      />
    </p>
  );
};
