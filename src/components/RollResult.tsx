import { Award } from 'lucide-react';
import { FormattedText } from './FormattedText';
import type { CharacterEntity, NoteEntity } from '../types/rpg.types';

interface RollResultProps {
  rolledNumber: number;
  rollingResult: string;
  isVisible: boolean;
  existingNotes: NoteEntity[];
  existingCharacters: CharacterEntity[];
  onWikiLinkClick: (title: string) => void;
}

export function RollResult({ rolledNumber, rollingResult, isVisible, existingNotes, existingCharacters, onWikiLinkClick }: RollResultProps) {
  if (!isVisible) return null;

  return (
    <div className="relative overflow-hidden rounded-lg border border-rpg-accent/30 bg-rpg-panel p-4 text-center animate-pulse">
      <div className="absolute left-2 top-2 flex items-center gap-1 text-[10px] text-rpg-muted">
        <Award className="h-3 w-3 text-rpg-accent" />
        Resultado da Rolagem
      </div>
      <div className="mt-1 font-mono text-3xl font-extrabold text-white">{rolledNumber}</div>
      <div className="mx-auto mt-2 max-w-md text-sm font-bold text-rpg-accent">
        {rollingResult ? (
          <FormattedText text={rollingResult} existingNotes={existingNotes} existingCharacters={existingCharacters} onLinkClick={onWikiLinkClick} lineKey="roll-result" />
        ) : 'Rolando os dados mágicos...'}
      </div>
    </div>
  );
}
