import { Skull, User } from 'lucide-react';
import type { CharacterEntity } from '../types/rpg.types';

export function EntityCard({ character, onSelect }: { character: CharacterEntity; onSelect: () => void }) {
  const subtitle = character.type === 'pc' ? `${character.species ?? 'Humano'} ${character.class ?? ''}`.trim() : character.type === 'npc' ? character.role ?? 'NPC' : `${character.size ?? '—'} | ${character.monsterType ?? 'Criatura'}`;
  const badge = character.type === 'pc' ? `Nível ${character.level ?? 1}` : character.type === 'npc' ? 'NPC' : `ND ${character.challengeRating ?? '—'}`;
  return <button type="button" onClick={onSelect} className="text-left bg-rpg-panel border border-rpg-card hover:border-rpg-accent/60 rounded-xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 shadow-md flex flex-col h-[210px]">
    <div className="relative w-full h-[140px] bg-rpg-card flex-shrink-0 p-1">
      {character.avatar ? <img src={character.avatar} alt={character.name} className="w-full h-full object-contain bg-rpg-card/30 object-center rounded-lg" /> : <div className="w-full h-full flex items-center justify-center text-rpg-muted/20">{character.type === 'pc' || character.type === 'npc' ? <User className="w-14 h-14" /> : <Skull className="w-14 h-14" />}</div>}
      <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-rpg-panel/95 text-rpg-accent border border-rpg-card/40">{badge}</span>
    </div>
    <div className="p-3 flex-1 flex flex-col justify-center bg-rpg-panel border-t border-rpg-card/10"><h4 className="text-xs font-bold text-white group-hover:text-rpg-accent truncate">{character.name}</h4><p className="text-[9px] text-rpg-muted mt-0.5 truncate">{subtitle}</p></div>
  </button>;
}
