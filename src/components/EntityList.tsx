import { User } from 'lucide-react';
import type { CharacterEntity } from '../types/rpg.types';
import { EntityCard } from './EntityCard';

export function EntityList({ characters, onSelect }: { characters: CharacterEntity[]; onSelect: (character: CharacterEntity) => void }) {
  if (!characters.length) return <div className="text-center py-20 border border-dashed border-rpg-card/40 rounded-xl bg-rpg-panel/5"><User className="w-12 h-12 text-rpg-muted/30 mx-auto mb-3" /><p className="text-sm text-rpg-muted font-medium">Nenhuma ficha encontrada nesta categoria.</p></div>;
  return <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,220px))] gap-5">{characters.map((character) => <EntityCard key={character.id} character={character} onSelect={() => onSelect(character)} />)}</div>;
}
