import { Plus, Upload } from 'lucide-react';
import { EntityFilters } from './EntityFilters';
import { EntityForm } from './EntityForm';
import { EntityList } from './EntityList';
import type { EntityManagerProps } from './entity.types';
import { useEntityForm } from '../hooks/useEntityForm';
import { PlayerCharacterSheet } from './PlayerCharacterSheet';
import { NpcCharacterSheet } from './NpcCharacterSheet';
import { CreateFileDialog } from './CreateFileDialog';
import { useState } from 'react';
import { CharacterImportDialog } from './CharacterImportDialog';

export function EntityManager(props: EntityManagerProps) {
  const form = useEntityForm(props);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const entityLabel = form.activeType === 'pc' ? 'personagem' : form.activeType === 'npc' ? 'NPC' : form.activeType === 'monster' ? 'monstro' : 'vilão';
  const linkContext = { existingNotes: props.existingNotes, existingCharacters: props.characters, onWikiLinkClick: props.onWikiLinkClick };

  if (props.selectedChar) {
    if (props.selectedChar.type === 'pc') {
      return <PlayerCharacterSheet key={props.selectedChar.id} character={props.selectedChar} editing={form.isEditing} onEdit={form.startEditing} onClose={form.close} onDelete={async () => { if (!window.confirm('Isso excluirá permanentemente esta ficha. Confirmar?')) return; await props.onDeleteCharacter(props.selectedChar!.id); form.close(); }} onSave={form.savePlayer} linkContext={linkContext} />;
    }
    if (props.selectedChar.type === 'npc') {
      return <NpcCharacterSheet key={props.selectedChar.id} character={props.selectedChar} editing={form.isEditing} onEdit={form.startEditing} onClose={form.close} onDelete={async () => { if (!window.confirm('Isso excluirá permanentemente este NPC. Confirmar?')) return; await props.onDeleteCharacter(props.selectedChar!.id); form.close(); }} onSave={form.savePlayer} linkContext={linkContext} />;
    }
    if (props.selectedChar.type === 'monster') {
      return <NpcCharacterSheet key={props.selectedChar.id} monster character={props.selectedChar} editing={form.isEditing} onEdit={form.startEditing} onClose={form.close} onDelete={async () => { if (!window.confirm('Isso excluirá permanentemente este monstro. Confirmar?')) return; await props.onDeleteCharacter(props.selectedChar!.id); form.close(); }} onSave={form.savePlayer} linkContext={linkContext} />;
    }
    if (props.selectedChar.type === 'villain') {
      return <NpcCharacterSheet key={props.selectedChar.id} villain monster character={props.selectedChar} editing={form.isEditing} onEdit={form.startEditing} onClose={form.close} onDelete={async () => { if (!window.confirm('Isso excluirá permanentemente este vilão. Confirmar?')) return; await props.onDeleteCharacter(props.selectedChar!.id); form.close(); }} onSave={form.savePlayer} linkContext={linkContext} />;
    }
    return <EntityForm
      key={props.selectedChar.id}
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
    <div className="flex justify-end gap-2 rounded-lg border border-rpg-card/25 bg-rpg-panel/10 p-4">
      <button type="button" onClick={() => setImportDialogOpen(true)} className="flex items-center gap-1.5 rounded-md border border-rpg-accent/40 px-4 py-2 text-xs font-bold text-rpg-accent transition hover:bg-rpg-accent/10"><Upload className="h-4 w-4" />Importar ficha</button>
      <button type="button" onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-1.5 rounded-md bg-rpg-accent px-4 py-2 text-xs font-bold text-white transition hover:bg-rpg-accent/80"><Plus className="h-4 w-4" />Criar Ficha</button>
    </div>
    <EntityList characters={form.characters} onSelect={form.selectCharacter} />
    <CreateFileDialog open={createDialogOpen} title={`Novo ${entityLabel}`} description={`Informe o nome do novo ${entityLabel}.`} submitLabel="Criar ficha" onClose={() => setCreateDialogOpen(false)} onCreate={form.createWithName} />
    <CharacterImportDialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} onImport={async (draft) => { const { type, name, sourceText: _sourceText, ...updates } = draft; void _sourceText; const created = await props.onCreateCharacter(type, name); await props.onUpdateCharacter(created.id, updates); props.setSelectedChar({ ...created, ...updates }); props.setIsEditing(false); }} />
  </div>;
}
