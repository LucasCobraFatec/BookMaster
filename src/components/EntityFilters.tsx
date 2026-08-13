import { BookOpen, Crown, Skull, User } from 'lucide-react';
import type { EntityType } from './entity.types';

interface EntityFiltersProps {
  activeType: EntityType;
  searchTerm: string;
  onTypeChange: (type: EntityType) => void;
  onSearchChange: (value: string) => void;
}

const tabs: { type: EntityType; label: string; icon: typeof User }[] = [
  { type: 'pc', label: 'Personagens', icon: User }, { type: 'npc', label: 'NPCs', icon: BookOpen },
  { type: 'monster', label: 'Monstros', icon: Skull }, { type: 'villain', label: 'Vilões', icon: Crown },
];

export function EntityFilters({ activeType, searchTerm, onTypeChange, onSearchChange }: EntityFiltersProps) {
  return <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rpg-card/60 pb-4">
    <div className="flex items-center gap-1.5 p-1 bg-rpg-panel/40 border border-rpg-card/50 rounded-lg">
      {tabs.map(({ type, label, icon: Icon }) => <button key={type} type="button" onClick={() => onTypeChange(type)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeType === type ? type === 'villain' ? 'bg-rose-600 text-white' : 'bg-rpg-accent text-white' : 'text-rpg-muted hover:text-white'}`}>
        <Icon className="w-3.5 h-3.5" /> {label}
      </button>)}
    </div>
    <input type="search" placeholder="Pesquisar por nome..." value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} className="bg-rpg-card border border-rpg-card/60 text-xs rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-rpg-accent text-white w-full md:w-48" />
  </div>;
}
