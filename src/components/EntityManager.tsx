import { Plus } from 'lucide-react';
import { EntityFilters } from './EntityFilters';
import { EntityForm } from './EntityForm';
import { EntityList } from './EntityList';
import type { EntityManagerProps } from './entity.types';
import { useEntityForm } from '../hooks/useEntityForm';
import { PlayerCharacterSheet } from './PlayerCharacterSheet';
import { NpcCharacterSheet } from './NpcCharacterSheet';
import { CreateFileDialog } from './CreateFileDialog';
import { useState } from 'react';

export function EntityManager(props: EntityManagerProps) {
  const form = useEntityForm(props);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const entityLabel = form.activeType === 'pc' ? 'personagem' : form.activeType === 'npc' ? 'NPC' : form.activeType === 'monster' ? 'monstro' : 'vilão';

  if (props.selectedChar) {
    if (props.selectedChar.type === 'pc') {
      return <PlayerCharacterSheet character={props.selectedChar} editing onEdit={form.startEditing} onClose={form.close} onDelete={async () => { if (!window.confirm('Isso excluirá permanentemente esta ficha. Confirmar?')) return; await props.onDeleteCharacter(props.selectedChar!.id); form.close(); }} onSave={form.savePlayer} />;
    }
    if (props.selectedChar.type === 'npc') {
      return <NpcCharacterSheet character={props.selectedChar} onClose={form.close} onDelete={async () => { if (!window.confirm('Isso excluirá permanentemente este NPC. Confirmar?')) return; await props.onDeleteCharacter(props.selectedChar!.id); form.close(); }} onSave={form.savePlayer} />;
    }
    if (props.selectedChar.type === 'monster') {
      return <NpcCharacterSheet monster character={props.selectedChar} onClose={form.close} onDelete={async () => { if (!window.confirm('Isso excluirá permanentemente este monstro. Confirmar?')) return; await props.onDeleteCharacter(props.selectedChar!.id); form.close(); }} onSave={form.savePlayer} />;
    }
    if (props.selectedChar.type === 'villain') {
      return <NpcCharacterSheet villain monster character={props.selectedChar} onClose={form.close} onDelete={async () => { if (!window.confirm('Isso excluirá permanentemente este vilão. Confirmar?')) return; await props.onDeleteCharacter(props.selectedChar!.id); form.close(); }} onSave={form.savePlayer} />;
    }
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
    <div className="flex justify-end rounded-lg border border-rpg-card/25 bg-rpg-panel/10 p-4">
      <button type="button" onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-1.5 rounded-md bg-rpg-accent px-4 py-2 text-xs font-bold text-white transition hover:bg-rpg-accent/80"><Plus className="h-4 w-4" />Criar Ficha</button>
    </div>
    <EntityList characters={form.characters} onSelect={form.selectCharacter} />
    <CreateFileDialog open={createDialogOpen} title={`Novo ${entityLabel}`} description={`Informe o nome do novo ${entityLabel}.`} submitLabel="Criar ficha" onClose={() => setCreateDialogOpen(false)} onCreate={form.createWithName} />
  </div>;
}
