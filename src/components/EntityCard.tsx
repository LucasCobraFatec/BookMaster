import { Skull, User } from 'lucide-react';
import type { CharacterEntity } from '../types/rpg.types';

export function EntityCard({ character, onSelect }: { character: CharacterEntity; onSelect: () => void }) {
  const subtitle = character.type === 'pc' ? `${character.species ?? 'Humano'} ${character.class ?? ''}`.trim() : character.type === 'npc' ? character.role ?? 'NPC' : `${character.size ?? '—'} | ${character.monsterType ?? 'Criatura'}`;
  const badge = character.type === 'pc' ? `Nível ${character.level ?? 1}` : character.type === 'npc' ? 'NPC' : `ND ${character.challengeRating ?? '—'}`;
  return <button type="button" onClick={onSelect} className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-rpg-panel text-left shadow-[0_12px_35px_rgba(0,0,0,.28)] outline-none transition duration-300 hover:-translate-y-1 hover:border-rpg-accent/70 hover:shadow-[0_18px_45px_rgba(139,92,246,.16)] focus-visible:ring-2 focus-visible:ring-rpg-accent">
    {character.avatar ? <img src={character.avatar} alt={character.name} className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105" /> : <div className="absolute inset-0 flex items-center justify-center text-rpg-muted/20">{character.type === 'pc' || character.type === 'npc' ? <User className="h-14 w-14" /> : <Skull className="h-14 w-14" />}</div>}
    <span className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-black/10" />
    <span className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black via-black/85 to-transparent" />
    <span className="absolute right-3 top-3 rounded-full border border-white/15 bg-zinc-950/80 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-violet-300 shadow-lg backdrop-blur-md">{badge}</span>
    <div className="absolute inset-x-0 bottom-0 p-4"><h4 className="truncate text-base font-black capitalize text-white drop-shadow-md transition-colors group-hover:text-violet-200">{character.name}</h4><p className="mt-1 truncate text-[10px] font-medium text-zinc-300 drop-shadow-md">{subtitle}</p></div>
    <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
  </button>;
}
