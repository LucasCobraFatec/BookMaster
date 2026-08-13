import React from 'react';
import { WikiLink } from './WikiLink';
import type { CharacterEntity, NoteEntity } from '../types/rpg.types';

interface FormattedTextProps {
  text: string;
  existingNotes: NoteEntity[];
  existingCharacters: CharacterEntity[];
  onLinkClick: (noteTitle: string) => void;
  lineKey: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({
  text,
  existingNotes,
  existingCharacters,
  onLinkClick,
  lineKey,
}) => {
  const wikiLinkRegex = /(\[\[[^\]]+\]\])/g;
  const parts = text.split(wikiLinkRegex);

  return (
    <span key={lineKey}>
      {parts.map((part, index) => {
        if (part.startsWith('[[') && part.endsWith(']]')) {
          const rawLink = part.slice(2, -2);
          const [targetTitle, customLabel] = rawLink.split('|');

          const cleanTitle = targetTitle.trim();
          const displayName = customLabel ? customLabel.trim() : cleanTitle;
          const previewNote = existingNotes.find((note) => note.title.toLowerCase() === cleanTitle.toLowerCase());
          const previewCharacter = existingCharacters.find((character) => character.name.toLowerCase() === cleanTitle.toLowerCase());

          if (cleanTitle.toLocaleLowerCase().startsWith('tabela:')) {
            return <span key={index} className="rounded bg-emerald-500/10 px-1 font-semibold text-emerald-400">{displayName}</span>;
          }

          return (
            <WikiLink
              key={index}
              targetTitle={cleanTitle}
              displayName={displayName}
              previewNote={previewNote}
              previewCharacter={previewCharacter}
              onLinkClick={onLinkClick}
            />
          );
        }

        const boldParts = part.split(/(\*\*.+?\*\*)/g);

        return (
          <React.Fragment key={index}>
            {boldParts.map((boldPart, bIndex) => {
              if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
                const boldText = boldPart.slice(2, -2);
                return (
                  <strong key={bIndex} className="text-white font-bold">
                    {boldText}
                  </strong>
                );
              }

              const italicParts = boldPart.split(/(\*.+?\*)/g);
              return (
                <React.Fragment key={bIndex}>
                  {italicParts.map((italicPart, iIndex) => {
                    if (italicPart.startsWith('*') && italicPart.endsWith('*')) {
                      const italicText = italicPart.slice(1, -1);
                      return (
                        <em key={iIndex} className="italic text-rpg-text">
                          {italicText}
                        </em>
                      );
                    }
                    return italicPart;
                  })}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}
    </span>
  );
};
