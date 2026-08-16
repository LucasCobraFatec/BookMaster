import React from 'react';
import { WikiLink } from './WikiLink';
import type { CharacterEntity, NoteEntity } from '../types/rpg.types';
import { parseWikiLinkTarget, resolveWikiLinkTarget } from '../lib/wikiLinks';

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
          const parsedTarget = parseWikiLinkTarget(cleanTitle);
          const displayName = customLabel ? customLabel.trim() : parsedTarget.title;
          const resolvedTarget = resolveWikiLinkTarget(cleanTitle, existingNotes, existingCharacters);
          const previewNote = resolvedTarget?.kind === 'note' ? resolvedTarget.entity : undefined;
          const previewCharacter = resolvedTarget?.kind === 'character' ? resolvedTarget.entity : undefined;

          if (cleanTitle.toLocaleLowerCase().startsWith('tabela:')) {
            return <button type="button" key={index} onClick={() => onLinkClick(cleanTitle)} title="Abrir tabela" className="rounded bg-emerald-500/10 px-1 font-semibold text-emerald-400 transition hover:bg-emerald-500/20 hover:underline">{displayName}</button>;
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
