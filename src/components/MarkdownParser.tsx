import React from 'react';
import { MarkdownLine } from './MarkdownLine';

interface MarkdownParserProps {
  content: string;
  existingNotes: string[];
  onLinkClick: (noteTitle: string) => void;
}

export const MarkdownParser: React.FC<MarkdownParserProps> = ({
  content,
  existingNotes,
  onLinkClick,
}) => {
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-rpg-text leading-relaxed select-text">
      {lines.map((line, index) => (
        <MarkdownLine
          key={`line-${index}`}
          line={line}
          lineIndex={index}
          existingNotes={existingNotes}
          onLinkClick={onLinkClick}
        />
      ))}
    </div>
  );
};
