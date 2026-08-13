import { Plus } from 'lucide-react';
import { EntityFilters } from './EntityFilters';
import { EntityForm } from './EntityForm';
import { EntityList } from './EntityList';
import type { EntityManagerProps } from './entity.types';
import { useEntityForm } from '../hooks/useEntityForm';

export function EntityManager(props: EntityManagerProps) {
  const form = useEntityForm(props);
  const entityLabel = form.activeType === 'pc' ? 'personagem' : form.activeType === 'npc' ? 'NPC' : form.activeType === 'monster' ? 'monstro' : 'vilão';

  if (props.selectedChar) {
    return <EntityForm
      character={props.selectedChar}
      isEditing={form.isEditing}
      onClose={form.close}
      onStartEditing={form.startEditing}
      onSave={form.save}
      onUploadAvatar={form.uploadAvatar}
      onDelete={async () => {
        if (!window.confirm('Isso excluirá permanentemente esta ficha do seu banco offline. Confirmar?')) return;
        await props.onDeleteCharacter(props.selectedChar!.id);
        form.close();
      }}
    />;
  }

  return <div className="space-y-6">
    <EntityFilters activeType={form.activeType} searchTerm={form.searchTerm} onTypeChange={form.changeType} onSearchChange={form.setSearchTerm} />
    <form onSubmit={form.create} className="flex gap-3 bg-rpg-panel/10 border border-rpg-card/25 rounded-lg p-4">
      <input type="text" placeholder={`Nome do novo ${entityLabel}...`} value={form.name} onChange={(event) => form.setName(event.target.value)} className="flex-1 bg-rpg-card border border-rpg-card text-xs rounded-md px-3 py-2 text-white focus:outline-none focus:border-rpg-accent" />
      <button type="submit" className="bg-rpg-accent hover:bg-rpg-accent/80 text-white font-bold text-xs px-4 py-2 rounded-md flex items-center gap-1.5"><Plus className="w-4 h-4" />Criar Ficha</button>
    </form>
    <EntityList characters={form.characters} onSelect={form.selectCharacter} />
  </div>;
}
