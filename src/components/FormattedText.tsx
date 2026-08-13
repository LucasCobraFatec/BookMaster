import React from 'react';
import { WikiLink } from './WikiLink';

interface FormattedTextProps {
  text: string;
  existingNotes: string[];
  onLinkClick: (noteTitle: string) => void;
  lineKey: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({
  text,
  existingNotes,
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
          const noteExists = existingNotes.some(
            (title) => title.toLowerCase() === cleanTitle.toLowerCase()
          );

          return (
            <WikiLink
              key={index}
              targetTitle={cleanTitle}
              displayName={displayName}
              noteExists={noteExists}
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
