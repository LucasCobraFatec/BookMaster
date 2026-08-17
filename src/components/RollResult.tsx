import { Award, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { FormattedText } from './FormattedText';
import type { CharacterEntity, NoteEntity } from '../types/rpg.types';

interface RollResultProps {
  rolledNumber: number;
  rollingResult: string;
  isVisible: boolean;
  existingNotes: NoteEntity[];
  existingCharacters: CharacterEntity[];
  onWikiLinkClick: (title: string) => void;
  onClose: () => void;
}

export function RollResult({ rolledNumber, rollingResult, isVisible, existingNotes, existingCharacters, onWikiLinkClick, onClose }: RollResultProps) {
  if (!isVisible) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && rollingResult && onClose()}><div role="dialog" aria-modal="true" aria-label="Resultado do sorteio" className={`relative w-full max-w-lg overflow-hidden rounded-2xl border border-violet-500/40 bg-zinc-950 p-6 text-center shadow-2xl ${rollingResult ? '' : 'animate-pulse'}`}><button type="button" onClick={onClose} disabled={!rollingResult} aria-label="Fechar resultado" className="absolute right-3 top-3 rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white disabled:opacity-30"><X className="h-5 w-5" /></button><div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-violet-300"><Award className="h-4 w-4" />Resultado sorteado</div><div className="mt-4 font-mono text-4xl font-extrabold text-white">{rolledNumber}</div><div className="mx-auto mt-4 max-w-md rounded-xl bg-violet-500/10 p-4 text-base font-bold text-violet-200">
        {rollingResult ? (
          <FormattedText text={rollingResult} existingNotes={existingNotes} existingCharacters={existingCharacters} onLinkClick={onWikiLinkClick} lineKey="roll-result" />
        ) : 'Rolando os dados mágicos...'}
      </div>{rollingResult && <button type="button" onClick={onClose} className="mt-5 rounded-lg bg-violet-600 px-6 py-2 text-xs font-black text-white hover:bg-violet-500">Fechar</button>}</div></div>, document.body,
  );
}
