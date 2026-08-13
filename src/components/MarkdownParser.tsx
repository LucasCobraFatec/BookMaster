import React from 'react';
import { MarkdownLine } from './MarkdownLine';
import { MarkdownCallout, type CalloutType } from './MarkdownCallout';
import type { CharacterEntity, NoteEntity } from '../types/rpg.types';

interface MarkdownParserProps {
  content: string;
  existingNotes: NoteEntity[];
  existingCharacters?: CharacterEntity[];
  onLinkClick: (noteTitle: string) => void;
}

export const MarkdownParser: React.FC<MarkdownParserProps> = ({
  content,
  existingNotes,
  existingCharacters = [],
  onLinkClick,
}) => {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const callout = lines[index].match(/^>\s*\[!(NOTE|TIP|WARNING|DANGER|INFO)\]\s*(.*)$/i);
    if (callout) {
      const contentLines: string[] = [];
      while (index + 1 < lines.length && lines[index + 1].startsWith('>')) {
        index += 1;
        contentLines.push(lines[index].replace(/^>\s?/, ''));
      }
      blocks.push(<MarkdownCallout key={`callout-${index}`} type={callout[1].toUpperCase() as CalloutType} title={callout[2]}>{contentLines.join('\n') || ' '}</MarkdownCallout>);
      continue;
    }
    blocks.push(<MarkdownLine key={`line-${index}`} line={lines[index]} lineIndex={index} existingNotes={existingNotes} existingCharacters={existingCharacters} onLinkClick={onLinkClick} />);
  }

  return (
    <div className="space-y-2 text-rpg-text leading-relaxed select-text">
      {blocks}
    </div>
  );
};
