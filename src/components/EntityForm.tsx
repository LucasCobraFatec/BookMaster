import { Save, Trash2, Upload, X } from 'lucide-react';
import type { ChangeEvent, FormEvent, MouseEvent } from 'react';
import type { CharacterEntity } from '../types/rpg.types';

interface EntityFormProps {
  character: CharacterEntity;
  isEditing: boolean;
  onClose: () => void;
  onStartEditing: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onDelete: () => Promise<void>;
  onUploadAvatar: (event: ChangeEvent<HTMLInputElement>) => void;
}

const attributes = [['strength', 'Força'], ['dexterity', 'Destreza'], ['constitution', 'Constituição'], ['intelligence', 'Inteligência'], ['wisdom', 'Sabedoria'], ['charisma', 'Carisma']] as const;
const inputClass = 'w-full bg-rpg-card text-white border border-rpg-card rounded p-2 text-xs focus:outline-none focus:border-rpg-accent';

function Field({ name, label, value, editing, type = 'text' }: { name: string; label: string; value?: string | number; editing: boolean; type?: string }) {
  return <label className="block"><span className="text-rpg-muted text-[10px] uppercase font-bold block mb-1">{label}</span>{editing ? <input name={name} type={type} defaultValue={value ?? ''} className={inputClass} /> : <span className="text-white text-xs block bg-rpg-card/25 px-2 py-1.5 rounded min-h-7">{value || '—'}</span>}</label>;
}

function TextArea({ name, label, value, editing }: { name: string; label: string; value?: string; editing: boolean }) {
  return <label className="block"><span className="text-rpg-muted text-[10px] uppercase font-bold block mb-1">{label}</span>{editing ? <textarea name={name} defaultValue={value ?? ''} rows={3} className={inputClass} /> : <p className="text-xs text-white leading-relaxed whitespace-pre-line bg-rpg-card/25 p-2 rounded min-h-12">{value || '—'}</p>}</label>;
}

export function EntityForm({ character, isEditing, onClose, onStartEditing, onSave, onDelete, onUploadAvatar }: EntityFormProps) {
  const monster = character.type === 'monster' || character.type === 'villain';
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!isEditing) {
      event.preventDefault();
      onStartEditing();
      return;
    }

    onSave(event);
  };

  const handleStartEditing = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onStartEditing();
  };

  return <div className="bg-rpg-panel border border-rpg-card rounded-xl p-6 relative">
    <form onSubmit={handleSubmit} className="space-y-6">
      <header className="flex flex-col md:flex-row gap-6 items-start border-b border-rpg-card pb-6">
        <div className="relative w-32 h-32 bg-rpg-card rounded-xl overflow-hidden border border-rpg-card/80 group p-1">{character.avatar ? <img src={character.avatar} alt={character.name} className="w-full h-full object-contain rounded-lg" /> : <div className="h-full grid place-items-center text-rpg-muted">Sem avatar</div>}{isEditing && <label className="absolute inset-0 bg-black/70 hidden group-hover:flex flex-col items-center justify-center cursor-pointer"><Upload className="w-6 h-6 text-white" /><input type="file" accept="image/*" className="hidden" onChange={onUploadAvatar} /></label>}</div>
        <div className="flex-1 w-full">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {isEditing ? <input name="name" required defaultValue={character.name} className="min-w-0 flex-1 bg-rpg-card border border-rpg-accent/30 text-lg font-bold rounded px-3 py-1 text-white" /> : <h2 className="min-w-0 flex-1 truncate text-2xl font-black text-white">{character.name}</h2>}
            <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
              {isEditing ? <button type="submit" className="flex h-9 items-center gap-1 rounded-lg bg-emerald-500 px-3.5 text-xs font-bold text-white transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"><Save className="w-3.5 h-3.5" />Salvar</button> : <button type="button" onClick={handleStartEditing} className="h-9 rounded-lg bg-rpg-accent px-3.5 text-xs font-bold text-white transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">Editar</button>}
              <button type="button" onClick={onDelete} aria-label={`Excluir ficha de ${character.name}`} title="Excluir ficha" className="grid h-9 w-9 place-items-center rounded-lg border border-red-500/20 text-red-400 transition hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><Trash2 className="w-4 h-4" /></button>
              <button type="button" onClick={onClose} aria-label="Fechar ficha" title="Fechar ficha" className="grid h-9 w-9 place-items-center rounded-lg border border-rpg-card text-rpg-muted transition hover:bg-rpg-card hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rpg-accent"><X className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5"><Field name="alignment" label="Alinhamento" value={character.alignment} editing={isEditing} /><Field name="languages" label="Idiomas" value={character.languages} editing={isEditing} /><Field name="hp" label="PV" value={character.hp} editing={isEditing} type="number" /><Field name="hpMax" label="PV Máximo" value={character.hpMax} editing={isEditing} type="number" /><Field name="hpTemp" label="PV Temporário" value={character.hpTemp} editing={isEditing} type="number" /><Field name="ca" label="CA" value={character.ca} editing={isEditing} type="number" /><Field name="initiative" label="Iniciativa" value={character.initiative} editing={isEditing} type="number" /><Field name="speed" label="Deslocamento" value={character.speed} editing={isEditing} /></div>
        </div>
      </header>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">{character.type === 'pc' && <><Field name="class" label="Classe" value={character.class} editing={isEditing} /><Field name="subclass" label="Subclasse" value={character.subclass} editing={isEditing} /><Field name="level" label="Nível" value={character.level} editing={isEditing} type="number" /><Field name="species" label="Espécie" value={character.species} editing={isEditing} /><Field name="background" label="Antecedente" value={character.background} editing={isEditing} /><Field name="proficiencyBonus" label="Bônus de proficiência" value={character.proficiencyBonus} editing={isEditing} type="number" /><Field name="xp" label="XP" value={character.xp} editing={isEditing} type="number" /><Field name="deathSavesSuccesses" label="Sucessos contra morte" value={character.deathSavesSuccesses} editing={isEditing} type="number" /><Field name="deathSavesFailures" label="Falhas contra morte" value={character.deathSavesFailures} editing={isEditing} type="number" /></>}{character.type === 'npc' && <><Field name="role" label="Papel" value={character.role} editing={isEditing} /><Field name="appearance" label="Aparência" value={character.appearance} editing={isEditing} /><Field name="personality" label="Personalidade" value={character.personality} editing={isEditing} /></>}{monster && <><Field name="size" label="Tamanho" value={character.size} editing={isEditing} /><Field name="monsterType" label="Tipo" value={character.monsterType} editing={isEditing} /><Field name="challengeRating" label="ND" value={character.challengeRating} editing={isEditing} /><Field name="resistances" label="Resistências" value={character.resistances} editing={isEditing} /><Field name="immunities" label="Imunidades" value={character.immunities} editing={isEditing} /></>}</section>
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">{attributes.map(([name, label]) => <Field key={name} name={name} label={label} value={character.attributes[name]} editing={isEditing} type="number" />)}</section>
      <section className="grid md:grid-cols-2 gap-4"><TextArea name="savingThrows" label="Salvaguardas" value={character.savingThrows} editing={isEditing} /><TextArea name="skills" label="Perícias" value={character.skills} editing={isEditing} /><TextArea name="senses" label="Sentidos" value={character.senses} editing={isEditing} /><TextArea name="equipment" label="Equipamentos" value={character.equipment} editing={isEditing} /><TextArea name="feats" label="Talentos" value={character.feats} editing={isEditing} /><TextArea name="features" label="Características" value={character.features} editing={isEditing} />{monster && <><TextArea name="actions" label="Ações" value={character.actions} editing={isEditing} /><TextArea name="bonusActions" label="Ações bônus" value={character.bonusActions} editing={isEditing} /><TextArea name="reactions" label="Reações" value={character.reactions} editing={isEditing} /></>}</section>
      <TextArea name="biography" label="Biografia / diário do mestre" value={character.biography} editing={isEditing} />
    </form>
  </div>;
}
