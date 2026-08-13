import React from 'react';

interface WikiLinkProps {
  targetTitle: string;
  displayName: string;
  noteExists: boolean;
  onLinkClick: (noteTitle: string) => void;
}

export const WikiLink: React.FC<WikiLinkProps> = ({
  targetTitle,
  displayName,
  noteExists,
  onLinkClick,
}) => {
  if (noteExists) {
    return (
      <button
        onClick={() => onLinkClick(targetTitle)}
        className="text-rpg-accent hover:underline font-semibold transition-all duration-150 inline-block px-1 rounded hover:bg-rpg-accent/10"
      >
        {displayName}
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
