import React, { useState, useEffect } from 'react';
import type { CharacterEntity } from '../types/rpg.types';
import { 
  Plus, 
  Trash2, 
  User, 
  Skull, 
  Upload, 
  X, 
  Crown, 
  Save, 
  Swords, 
  Zap, 
  BookOpen,
  Award,
  Sparkles
} from 'lucide-react';

interface EntityManagerProps {
  campaignId: string;
  characters: CharacterEntity[];
  onCreateCharacter: (type: CharacterEntity['type'], name: string, avatar?: string) => Promise<any>;
  onUpdateCharacter: (charId: string, updates: Partial<CharacterEntity>) => Promise<void>;
  onDeleteCharacter: (charId: string) => Promise<void>;
  
  // Lifted state from App.tsx to coordinate sidebar (cofre) and central view!
  selectedChar: CharacterEntity | null;
  setSelectedChar: (char: CharacterEntity | null) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

type TabType = 'pc' | 'npc' | 'monster' | 'villain';

const getStringField = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
};

const getNumberField = (formData: FormData, key: string, fallback = 0) => {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
};

const buildCharacterUpdate = (formData: FormData, activeTab: TabType): Partial<CharacterEntity> => {
  const baseUpdate: Partial<CharacterEntity> = {
    name: getStringField(formData, 'name'),
    alignment: getStringField(formData, 'alignment'),
    languages: getStringField(formData, 'languages'),
    hp: getNumberField(formData, 'hp'),
    hpMax: getNumberField(formData, 'hpMax'),
    hpTemp: getNumberField(formData, 'hpTemp', 0),
    ca: getNumberField(formData, 'ca'),
    initiative: getNumberField(formData, 'initiative'),
    speed: getStringField(formData, 'speed'),
    biography: getStringField(formData, 'biography'),
    savingThrows: getStringField(formData, 'savingThrows'),
    skills: getStringField(formData, 'skills'),
    senses: getStringField(formData, 'senses'),
    attributes: {
      strength: getNumberField(formData, 'strength'),
      dexterity: getNumberField(formData, 'dexterity'),
      constitution: getNumberField(formData, 'constitution'),
      intelligence: getNumberField(formData, 'intelligence'),
      wisdom: getNumberField(formData, 'wisdom'),
      charisma: getNumberField(formData, 'charisma'),
    },
  };

  if (activeTab === 'pc') {
    return {
      ...baseUpdate,
      class: getStringField(formData, 'class'),
      subclass: getStringField(formData, 'subclass'),
      level: getNumberField(formData, 'level'),
      species: getStringField(formData, 'species'),
      background: getStringField(formData, 'background'),
      proficiencyBonus: getNumberField(formData, 'proficiencyBonus'),
      xp: getNumberField(formData, 'xp'),
      inspiration: formData.get('inspiration') === 'on',
      deathSavesSuccesses: getNumberField(formData, 'deathSavesSuccesses', 0),
      deathSavesFailures: getNumberField(formData, 'deathSavesFailures', 0),
      feats: getStringField(formData, 'feats'),
      features: getStringField(formData, 'features'),
      equipment: getStringField(formData, 'equipment'),
    };
  }

  if (activeTab === 'npc') {
    return {
      ...baseUpdate,
      role: getStringField(formData, 'role'),
      appearance: getStringField(formData, 'appearance'),
      personality: getStringField(formData, 'personality'),
      feats: getStringField(formData, 'feats'),
      features: getStringField(formData, 'features'),
      equipment: getStringField(formData, 'equipment'),
    };
  }

  return {
    ...baseUpdate,
    size: getStringField(formData, 'size'),
    monsterType: getStringField(formData, 'monsterType'),
    challengeRating: getStringField(formData, 'challengeRating'),
    resistances: getStringField(formData, 'resistances'),
    immunities: getStringField(formData, 'immunities'),
    actions: getStringField(formData, 'actions'),
    bonusActions: getStringField(formData, 'bonusActions'),
    reactions: getStringField(formData, 'reactions'),
    equipment: getStringField(formData, 'equipment'),
  };
};

const getTabButtonClasses = (isActive: boolean, isVillain = false) => {
  if (isVillain) {
    return isActive
      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/10'
      : 'text-rpg-muted hover:text-white';
  }

  return isActive
    ? 'bg-rpg-accent text-white shadow-lg shadow-rpg-accent/10'
    : 'text-rpg-muted hover:text-white';
};

const getCharacterCardSubtitle = (char: CharacterEntity) => {
  if (char.type === 'pc') return `${char.species ?? 'Humano'} ${char.class ?? ''}`.trim();
  if (char.type === 'npc') return char.role ?? 'NPC';
  return `${char.size ?? '—'} | ${char.monsterType ?? 'Criatura'}`;
};

const getCharacterBadgeText = (char: CharacterEntity) => {
  if (char.type === 'pc') return `Nível ${char.level ?? 1}`;
  if (char.type === 'npc') return 'NPC';
  return `ND ${char.challengeRating ?? '—'}`;
};

export const EntityManager: React.FC<EntityManagerProps> = ({
  campaignId,
  characters,
  onCreateCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
  selectedChar,
  setSelectedChar,
  isEditing,
  setIsEditing,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('pc');
  const [newCharName, setNewCharName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [localEditing, setLocalEditing] = useState(false);
  const editing = isEditing || localEditing;

  // Sincroniza a aba ativa quando um personagem é aberto pelo cofre (left sidebar)
  useEffect(() => {
    if (selectedChar) {
      setActiveTab(selectedChar.type);
      setLocalEditing(false);
    }
  }, [selectedChar]);

  // Filtra as fichas com base na campanha, tipo ativo e termo de pesquisa
  const filteredChars = characters.filter(
    (c) => 
      c.campaignId === campaignId && 
      c.type === activeTab && 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auxiliar para ler imagem de upload e converter em Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, charId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      if (charId) {
        // Atualizando personagem aberto
        await onUpdateCharacter(charId, { avatar: base64String });
        setSelectedChar({ ...selectedChar!, avatar: base64String });
      } else {
        // Criando provisoriamente
        localStorage.setItem('temp_avatar_upload', base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharName.trim()) return;

    const tempAvatar = localStorage.getItem('temp_avatar_upload') || undefined;
    const created = await onCreateCharacter(activeTab, newCharName.trim(), tempAvatar);
    localStorage.removeItem('temp_avatar_upload');
    setSelectedChar(created);
    setLocalEditing(true);
    setIsEditing(true);
    setNewCharName('');
  };

  const handleSaveForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedChar) return;

    const formData = new FormData(e.currentTarget);
    const updates = buildCharacterUpdate(formData, activeTab);

    await onUpdateCharacter(selectedChar.id, updates);
    setSelectedChar({ ...selectedChar, ...updates });
    setLocalEditing(false);
    setIsEditing(false);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedChar(null);
    setLocalEditing(false);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Abas e Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rpg-card/60 pb-4">
        <div className="flex items-center gap-1.5 p-1 bg-rpg-panel/40 border border-rpg-card/50 rounded-lg">
          <button
            onClick={() => handleTabChange('pc')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${getTabButtonClasses(activeTab === 'pc')}`}
          >
            <User className="w-3.5 h-3.5" /> Personagens
          </button>
          <button
            onClick={() => handleTabChange('npc')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${getTabButtonClasses(activeTab === 'npc')}`}
          >
            <BookOpen className="w-3.5 h-3.5" /> NPCs
          </button>
          <button
            onClick={() => handleTabChange('monster')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${getTabButtonClasses(activeTab === 'monster')}`}
          >
            <Skull className="w-3.5 h-3.5" /> Monstros
          </button>
          <button
            onClick={() => handleTabChange('villain')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${getTabButtonClasses(activeTab === 'villain', true)}`}
          >
            <Crown className="w-3.5 h-3.5" /> Vilões
          </button>
        </div>

        {/* Input de Pesquisa */}
        <input
          type="text"
          placeholder="Pesquisar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-rpg-card border border-rpg-card/60 text-xs rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-rpg-accent text-white w-full md:w-48"
        />
      </div>

      {/* Seção Principal: Lista / Criador ou Ficha Detalhada */}
      {!selectedChar ? (
        <div className="space-y-6">
          {/* Formulário de Criação Rápida */}
          <form onSubmit={handleCreate} className="flex gap-3 bg-rpg-panel/10 border border-rpg-card/25 rounded-lg p-4">
            <input
              type="text"
              placeholder={`Nome do novo ${activeTab === 'pc' ? 'personagem' : activeTab === 'npc' ? 'NPC' : activeTab === 'monster' ? 'monstro' : 'vilão'}...`}
              value={newCharName}
              onChange={(e) => setNewCharName(e.target.value)}
              className="flex-1 bg-rpg-card border border-rpg-card text-xs rounded-md px-3 py-2 text-white focus:outline-none focus:border-rpg-accent"
            />
            <button
              type="submit"
              className="bg-rpg-accent hover:bg-rpg-accent/80 text-white font-bold text-xs px-4 py-2 rounded-md flex items-center gap-1.5 transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> Criar Ficha
            </button>
          </form>

          {/* Grid de Cards dos Personagens */}
          {filteredChars.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-rpg-card/40 rounded-xl bg-rpg-panel/5">
              <User className="w-12 h-12 text-rpg-muted/30 mx-auto mb-3" />
              <p className="text-sm text-rpg-muted font-medium">Nenhuma ficha encontrada nesta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredChars.map((char) => (
                <div
                  key={char.id}
                  onClick={() => setSelectedChar(char)}
                  className="bg-rpg-panel border border-rpg-card hover:border-rpg-accent/60 rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 relative hover:-translate-y-1 shadow-md hover:shadow-rpg-accent/5 flex flex-col h-[210px]"
                >
                  <div className="relative w-full h-[140px] bg-rpg-card flex-shrink-0 p-1">
                    {char.avatar ? (
                      <img 
                        src={char.avatar} 
                        alt={char.name} 
                        className="w-full h-full object-contain bg-rpg-card/30 object-center rounded-lg transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-rpg-muted/20 group-hover:text-rpg-accent/20 transition-colors">
                        {char.type === 'pc' || char.type === 'npc' ? <User className="w-14 h-14" /> : <Skull className="w-14 h-14" />}
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-rpg-panel to-transparent" />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rpg-panel/95 text-rpg-accent border border-rpg-card/40 shadow-sm z-10">
                      {getCharacterBadgeText(char)}
                    </div>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-center bg-rpg-panel border-t border-rpg-card/10">
                    <h4 className="text-xs font-bold text-white group-hover:text-rpg-accent transition-colors truncate">{char.name}</h4>
                    <p className="text-[9px] text-rpg-muted mt-0.5 truncate">{getCharacterCardSubtitle(char)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* DETALHE / FORMULÁRIO COMPLETO DO PERSONAGEM SELECIONADO */
        <div className="bg-rpg-panel border border-rpg-card rounded-xl overflow-hidden p-6 relative animate-fadeIn">
          {/* Botão de Fechar */}
          <button
            type="button"
            onClick={() => { setSelectedChar(null); setIsEditing(false); }}
            className="absolute top-4 right-4 text-rpg-muted hover:text-white transition-colors bg-rpg-card/50 p-1.5 rounded-full z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <form onSubmit={handleSaveForm} className="space-y-6">
            {/* Header da Ficha: Avatar e Dados de Identidade */}
            <div className="flex flex-col md:flex-row gap-6 items-start border-b border-rpg-card pb-6">
              {/* Avatar CENTRALIZADA (Sem cortes!) */}
              <div className="relative w-32 h-32 bg-rpg-card rounded-xl overflow-hidden border border-rpg-card/80 flex-shrink-0 group p-1">
                {selectedChar.avatar ? (
                  <img src={selectedChar.avatar} alt={selectedChar.name} className="w-full h-full object-contain bg-rpg-card/30 object-center rounded-lg" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-rpg-muted/40 bg-rpg-card/20 rounded-lg">
                    <User className="w-12 h-12" />
                  </div>
                )}
                {isEditing && (
                  <label className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                    <Upload className="w-6 h-6 text-white mb-1" />
                    <span className="text-[9px] text-rpg-muted font-bold">Fazer Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, selectedChar.id)} />
                  </label>
                )}
              </div>

              {/* Títulos e Identidades */}
              <div className="flex-1 space-y-4 w-full">
                <div className="flex items-center justify-between gap-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      defaultValue={selectedChar.name}
                      required
                      className="bg-rpg-card border border-rpg-accent/30 text-lg font-bold rounded px-3 py-1 text-white w-full max-w-sm focus:outline-none focus:border-rpg-accent"
                    />
                  ) : (
                    <h2 className="text-2xl font-black text-white flex items-center gap-2">
                      {selectedChar.type === 'villain' && <Crown className="w-6 h-6 text-rose-500 fill-rose-500/20" />}
                      {selectedChar.name}
                    </h2>
                  )}

                  {/* Ações de Ficha */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {editing ? (
                      <button
                        type="submit"
                        className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/10"
                      >
                        <Save className="w-3.5 h-3.5" /> Salvar Ficha
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setLocalEditing(true);
                          setIsEditing(true);
                        }}
                        className="bg-rpg-accent hover:bg-rpg-accent/80 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-lg shadow-rpg-accent/10"
                      >
                        Editar Ficha
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm("Isso excluirá permanentemente esta ficha do seu banco offline. Confirmar?")) {
                          await onDeleteCharacter(selectedChar.id);
                          setSelectedChar(null);
                        }
                      }}
                      className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/10"
                      title="Excluir Ficha"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sub-atributos Dinâmicos por Tipo */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-rpg-panel/30 border border-rpg-card/40 p-4 rounded-xl text-xs">
                  {activeTab === 'pc' && (
                    <>
                      <div>
                        <span className="text-rpg-muted text-[10px] uppercase block">Classe & Subclasse</span>
                        {isEditing ? (
                          <div className="flex gap-1 mt-1">
                            <input type="text" name="class" placeholder="Classe" defaultValue={selectedChar.class} className="bg-rpg-card text-white border border-rpg-card px-2 py-0.5 rounded w-1/2" />
                            <input type="text" name="subclass" placeholder="Subclasse" defaultValue={selectedChar.subclass || ''} className="bg-rpg-card text-white border border-rpg-card px-2 py-0.5 rounded w-1/2" />
                          </div>
                        ) : (
                          <strong className="text-white block mt-0.5 truncate">{selectedChar.class} {selectedChar.subclass ? `(${selectedChar.subclass})` : ''}</strong>
                        )}
                      </div>
                      <div>
                        <span className="text-rpg-muted text-[10px] uppercase block">Nível & Bônus Prof.</span>
                        {isEditing ? (
                          <div className="flex gap-1 mt-1">
                            <input type="number" name="level" defaultValue={selectedChar.level} className="bg-rpg-card text-white border border-rpg-card px-1.5 py-0.5 rounded w-1/2 text-center" />
                            <input type="number" name="proficiencyBonus" defaultValue={selectedChar.proficiencyBonus} className="bg-rpg-card text-white border border-rpg-card px-1.5 py-0.5 rounded w-1/2 text-center" />
                          </div>
                        ) : (
                          <strong className="text-white block mt-0.5">Nível {selectedChar.level} (+{selectedChar.proficiencyBonus} Prof)</strong>
                        )}
                      </div>
                      <div>
                        <span className="text-rpg-muted text-[10px] uppercase block">Espécie/Raça</span>
                        {isEditing ? <input type="text" name="species" defaultValue={selectedChar.species} className="bg-rpg-card text-white border border-rpg-card px-2 py-0.5 rounded w-full mt-1" /> : <strong className="text-white block mt-0.5">{selectedChar.species}</strong>}
                      </div>
                      <div>
                        <span className="text-rpg-muted text-[10px] uppercase block">Antecedente</span>
                        {isEditing ? <input type="text" name="background" defaultValue={selectedChar.background} className="bg-rpg-card text-white border border-rpg-card px-2 py-0.5 rounded w-full mt-1" /> : <strong className="text-white block mt-0.5">{selectedChar.background}</strong>}
                      </div>
                    </>
                  )}

                  {activeTab === 'npc' && (
                    <>
                      <div className="col-span-2">
                        <span className="text-rpg-muted text-[10px] uppercase block">Ocupação / Cargo</span>
                        {isEditing ? <input type="text" name="role" defaultValue={selectedChar.role} className="bg-rpg-card text-white border border-rpg-card px-2 py-0.5 rounded w-full mt-1" /> : <strong className="text-white block mt-0.5">{selectedChar.role}</strong>}
                      </div>
                      <div>
                        <span className="text-rpg-muted text-[10px] uppercase block">Alinhamento</span>
                        {isEditing ? <input type="text" name="alignment" defaultValue={selectedChar.alignment} className="bg-rpg-card text-white border border-rpg-card px-2 py-0.5 rounded w-full mt-1" /> : <strong className="text-white block mt-0.5">{selectedChar.alignment}</strong>}
                      </div>
                      <div>
                        <span className="text-rpg-muted text-[10px] uppercase block">Idiomas</span>
                        {isEditing ? <input type="text" name="languages" defaultValue={selectedChar.languages} className="bg-rpg-card text-white border border-rpg-card px-2 py-0.5 rounded w-full mt-1" /> : <strong className="text-white block mt-0.5">{selectedChar.languages}</strong>}
                      </div>
                    </>
                  )}

                  {(activeTab === 'monster' || activeTab === 'villain') && (
                    <>
                      <div>
                        <span className="text-rpg-muted text-[10px] uppercase block">Tamanho & Tipo</span>
                        {isEditing ? (
                          <div className="flex gap-1 mt-1">
                            <input type="text" name="size" placeholder="Tamanho" defaultValue={selectedChar.size} className="bg-rpg-card text-white border border-rpg-card px-2 py-0.5 rounded w-1/2 text-center" />
                            <input type="text" name="monsterType" placeholder="Tipo" defaultValue={selectedChar.monsterType} className="bg-rpg-card text-white border border-rpg-card px-2 py-0.5 rounded w-1/2 text-center" />
                          </div>
                        ) : (
                          <strong className="text-white block mt-0.5 truncate">{selectedChar.size} | {selectedChar.monsterType}</strong>
                        )}
                      </div>
                      <div>
                        <span className="text-rpg-muted text-[10px] uppercase block">Nível de Desafio (ND)</span>
                        {isEditing ? <input type="text" name="challengeRating" defaultValue={selectedChar.challengeRating} className="bg-rpg-card text-white border border-rpg-card px-2 py-0.5 rounded w-full mt-1 text-center" /> : <strong className="text-white block mt-0.5 text-center">{selectedChar.challengeRating}</strong>}
                      </div>
                      <div>
                        <span className="text-rpg-muted text-[10px] uppercase block">Alinhamento</span>
                        {isEditing ? <input type="text" name="alignment" defaultValue={selectedChar.alignment} className="bg-rpg-card text-white border border-rpg-card px-2 py-0.5 rounded w-full mt-1" /> : <strong className="text-white block mt-0.5">{selectedChar.alignment}</strong>}
                      </div>
                      <div>
                        <span className="text-rpg-muted text-[10px] uppercase block">Idiomas</span>
                        {isEditing ? <input type="text" name="languages" defaultValue={selectedChar.languages} className="bg-rpg-card text-white border border-rpg-card px-2 py-0.5 rounded w-full mt-1" /> : <strong className="text-white block mt-0.5 truncate">{selectedChar.languages}</strong>}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Corpo da Ficha: Dividido em Duas Colunas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Coluna 1: Atributos Clássicos & Status de Combate Rápido */}
              <div className="space-y-5">
                
                {/* Status Gerais: HP (Atu / Max / Temp), CA, Iniciativa */}
                <div className="bg-rpg-panel/20 border border-rpg-card/50 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-red-500/5 border border-red-500/20 rounded-lg col-span-2">
                      <span className="text-[9px] text-red-400 block font-bold uppercase leading-none">Pontos de Vida (HP Atu / Máx / Temp)</span>
                      {isEditing ? (
                        <div className="flex gap-1 justify-center mt-1.5 items-center">
                          <input type="number" name="hp" defaultValue={selectedChar.hp} className="bg-rpg-card border border-rpg-card text-white w-12 text-center rounded text-xs py-0.5" title="HP Atual" />
                          <span className="text-rpg-muted font-bold">/</span>
                          <input type="number" name="hpMax" defaultValue={selectedChar.hpMax} className="bg-rpg-card border border-rpg-card text-white w-12 text-center rounded text-xs py-0.5" title="HP Máximo" />
                          <span className="text-amber-500 font-bold ml-1">+</span>
                          <input type="number" name="hpTemp" defaultValue={selectedChar.hpTemp || 0} className="bg-rpg-card border border-amber-500/20 text-amber-400 w-12 text-center rounded text-xs py-0.5" title="HP Temporário" />
                        </div>
                      ) : (
                        <div className="flex justify-center gap-1 mt-1 items-baseline">
                          <span className="text-base font-black text-white">{selectedChar.hp}</span>
                          <span className="text-xs text-rpg-muted font-bold">/</span>
                          <span className="text-base font-black text-white">{selectedChar.hpMax}</span>
                          {Number(selectedChar.hpTemp) > 0 && (
                            <span className="text-xs text-amber-400 font-extrabold ml-1.5">(+{selectedChar.hpTemp} Temp)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-sky-500/5 border border-sky-500/20 rounded-lg">
                      <span className="text-[9px] text-sky-400 block font-bold uppercase leading-none">Armadura (CA)</span>
                      {isEditing ? <input type="number" name="ca" defaultValue={selectedChar.ca} className="bg-rpg-card border border-rpg-card text-white w-16 text-center rounded text-xs mt-1 py-0.5" /> : <span className="text-base font-black text-white block mt-1">{selectedChar.ca} CA</span>}
                    </div>
                    <div className="p-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                      <span className="text-[9px] text-emerald-400 block font-bold uppercase leading-none">Iniciativa</span>
                      {isEditing ? <input type="number" name="initiative" defaultValue={selectedChar.initiative} className="bg-rpg-card border border-rpg-card text-white w-16 text-center rounded text-xs mt-1 py-0.5" /> : <span className="text-base font-black text-white block mt-1">{selectedChar.initiative >= 0 ? `+${selectedChar.initiative}` : selectedChar.initiative}</span>}
                    </div>
                  </div>

                  {/* Campo de Deslocamento */}
                  <div className="px-1 text-xs flex justify-between items-center border-t border-rpg-card/10 pt-2.5">
                    <span className="text-rpg-muted text-[10px] uppercase font-bold">Deslocamento:</span>
                    {isEditing ? (
                      <input type="text" name="speed" defaultValue={selectedChar.speed} className="bg-rpg-card text-white border border-rpg-card px-2 py-0.5 rounded w-32 text-right" />
                    ) : (
                      <span className="text-white font-bold">{selectedChar.speed}</span>
                    )}
                  </div>
                </div>

                {/* 🎲 NOVIDADE D&D: Inspiração Heroica & Death Saves (Só para PCs) */}
                {activeTab === 'pc' && (
                  <div className="bg-rpg-panel/10 border border-rpg-card/30 rounded-xl p-4 space-y-3.5 text-xs">
                    <h3 className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Condição & Sobrevivência</h3>
                    
                    {/* Inspiração checkbox */}
                    <div className="flex items-center justify-between bg-rpg-card/30 border border-rpg-card/25 rounded-lg px-3 py-2">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/10" /> Inspiração Heroica
                      </span>
                      {isEditing ? (
                        <input type="checkbox" name="inspiration" defaultChecked={selectedChar.inspiration} className="w-4 h-4 cursor-pointer accent-rpg-accent" />
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedChar.inspiration ? 'bg-amber-400/15 text-amber-400 border border-amber-400/25' : 'bg-rpg-card text-rpg-muted'}`}>
                          {selectedChar.inspiration ? 'Disponível' : 'Gasta'}
                        </span>
                      )}
                    </div>

                    {/* Death Saves (Salvaguarda Contra Morte) */}
                    <div className="bg-rpg-card/20 rounded-lg p-2.5 space-y-2 border border-rpg-card/10">
                      <span className="text-[10px] text-rpg-muted uppercase font-bold block">Salvaguardas Contra Morte</span>
                      <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                        <div>
                          <span className="text-emerald-400 block mb-1">Sucessos:</span>
                          {isEditing ? (
                            <select name="deathSavesSuccesses" defaultValue={selectedChar.deathSavesSuccesses || 0} className="bg-rpg-card text-white border border-rpg-card rounded px-1.5 py-0.5">
                              <option value="0">0</option>
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3</option>
                            </select>
                          ) : (
                            <div className="flex justify-center gap-1">
                              {[1, 2, 3].map(i => (
                                <span key={i} className={`w-2.5 h-2.5 rounded-full border border-emerald-500/50 ${i <= (selectedChar.deathSavesSuccesses || 0) ? 'bg-emerald-500' : 'bg-transparent'}`} />
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-red-400 block mb-1">Falhas:</span>
                          {isEditing ? (
                            <select name="deathSavesFailures" defaultValue={selectedChar.deathSavesFailures || 0} className="bg-rpg-card text-white border border-rpg-card rounded px-1.5 py-0.5">
                              <option value="0">0</option>
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3</option>
                            </select>
                          ) : (
                            <div className="flex justify-center gap-1">
                              {[1, 2, 3].map(i => (
                                <span key={i} className={`w-2.5 h-2.5 rounded-full border border-red-500/50 ${i <= (selectedChar.deathSavesFailures || 0) ? 'bg-red-500' : 'bg-transparent'}`} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bloco de 6 Atributos D&D com Modificadores Calculados Automaticamente */}
                <div className="bg-rpg-panel/10 border border-rpg-card/30 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-rpg-accent uppercase tracking-wider flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Atributos Principais</h3>
                  
                  {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map((attrKey) => {
                    const label = 
                      attrKey === 'strength' ? 'Força (FOR)' : 
                      attrKey === 'dexterity' ? 'Destreza (DES)' : 
                      attrKey === 'constitution' ? 'Constituição (CON)' : 
                      attrKey === 'intelligence' ? 'Inteligência (INT)' : 
                      attrKey === 'wisdom' ? 'Sabedoria (SAB)' : 'Carisma (CAR)';
                    
                    const val = (selectedChar.attributes as any)[attrKey] || 10;
                    const mod = Math.floor((val - 10) / 2);
                    const modSign = mod >= 0 ? `+${mod}` : mod;

                    return (
                      <div key={attrKey} className="flex items-center justify-between bg-rpg-card/30 border border-rpg-card/20 rounded-lg px-3 py-1.5 text-xs">
                        <span className="font-bold text-white">{label}</span>
                        <div className="flex items-center gap-2">
                          {editing ? (
                            <input
                              type="number"
                              name={attrKey}
                              defaultValue={val}
                              className="bg-rpg-card border border-rpg-card rounded text-center text-white w-12 py-0.5"
                            />
                          ) : (
                            <>
                              <span className="text-rpg-muted font-bold">{val}</span>
                              <span className="bg-rpg-accent/10 border border-rpg-accent/25 text-rpg-accent font-black px-2 py-0.5 rounded">
                                {modSign}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Coluna 2 e 3: Informações de Ficha e Mecânica Específica */}
              <div className="md:col-span-2 space-y-5">
                {/* 🎲 NOVIDADE D&D: Salvaguardas, Perícias e Sentidos EDITÁVEIS PARA TODOS OS ATORES! */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-rpg-panel/10 border border-rpg-card/30 rounded-xl p-4 text-xs">
                  <div className="col-span-2 border-b border-rpg-card/20 pb-1.5 mb-1.5">
                    <span className="text-[10px] text-rpg-accent uppercase font-black block">Salvaguardas, Perícias e Sentidos</span>
                  </div>
                  <div>
                    <span className="text-rpg-muted text-[10px] uppercase font-bold block">Salvaguardas Treinadas</span>
                    {isEditing ? (
                      <input type="text" name="savingThrows" placeholder="ex: Força +5, Sabedoria +3" defaultValue={selectedChar.savingThrows || ''} className="w-full bg-rpg-card text-white border border-rpg-card p-1.5 rounded mt-1" />
                    ) : (
                      <span className="text-white mt-1 block font-mono bg-rpg-card/25 px-2 py-1 rounded">{selectedChar.savingThrows || 'Nenhuma Proficiência'}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-rpg-muted text-[10px] uppercase font-bold block">Perícias Treinadas</span>
                    {isEditing ? (
                      <input type="text" name="skills" placeholder="ex: Atletismo +4, Furtividade +6, Percepção +4" defaultValue={selectedChar.skills || ''} className="w-full bg-rpg-card text-white border border-rpg-card p-1.5 rounded mt-1" />
                    ) : (
                      <span className="text-white mt-1 block font-mono bg-rpg-card/25 px-2 py-1 rounded">{selectedChar.skills || 'Nenhuma Perícia'}</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <span className="text-rpg-muted text-[10px] uppercase font-bold block">Sentidos Passivos & Especiais</span>
                    {isEditing ? (
                      <input type="text" name="senses" placeholder="ex: Percepção Passiva 14, Visão no Escuro 18m" defaultValue={selectedChar.senses || ''} className="w-full bg-rpg-card text-white border border-rpg-card p-1.5 rounded mt-1" />
                    ) : (
                      <span className="text-white mt-1 block bg-rpg-card/25 px-2 py-1 rounded">{selectedChar.senses || 'Nenhum Sentido Especial'}</span>
                    )}
                  </div>
                </div>

                {/* 📊 SE FOR FICHA DE MONSTRO OU VILÃO (Resistências e Imunidades do Bestiário) */}
                {(activeTab === 'monster' || activeTab === 'villain') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-rpg-panel/10 border border-rpg-card/30 rounded-xl p-4 text-xs">
                    <div>
                      <span className="text-rpg-muted text-[10px] uppercase font-bold block">Resistências a Danos</span>
                      {isEditing ? <input type="text" name="resistances" placeholder="ex: Fogo, Cortante não-mágico" defaultValue={selectedChar.resistances} className="w-full bg-rpg-card text-white border border-rpg-card p-1.5 rounded mt-1" /> : <span className="text-amber-300 mt-1 block font-medium">{selectedChar.resistances || '—'}</span>}
                    </div>
                    <div>
                      <span className="text-rpg-muted text-[10px] uppercase font-bold block">Imunidades a Danos/Condições</span>
                      {isEditing ? <input type="text" name="immunities" placeholder="ex: Venenoso, Condição Envenenado" defaultValue={selectedChar.immunities} className="w-full bg-rpg-card text-white border border-rpg-card p-1.5 rounded mt-1" /> : <span className="text-red-400 mt-1 block font-medium">{selectedChar.immunities || '—'}</span>}
                    </div>
                  </div>
                )}

                {/* 📝 NOVIDADE D&D: Talentos e Características / Traços de Classe (Só para PCs e NPCs) */}
                {(activeTab === 'pc' || activeTab === 'npc') && (
                  <div className="bg-rpg-panel/10 border border-rpg-card/30 rounded-xl p-4 space-y-4 text-xs">
                    <h3 className="text-[10px] font-bold text-rpg-accent uppercase tracking-wider">Talentos & Habilidades Especiais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-rpg-muted text-[10px] uppercase block mb-1">Talentos (Feats)</span>
                        {isEditing ? (
                          <textarea
                            name="feats"
                            defaultValue={selectedChar.feats || ''}
                            rows={3}
                            placeholder="ex: Iniciado em Magia, Alerta, Robustez..."
                            className="w-full bg-rpg-card text-white border border-rpg-card rounded p-2 text-xs focus:outline-none focus:border-rpg-accent"
                          />
                        ) : (
                          <p className="text-xs text-white leading-relaxed whitespace-pre-line bg-rpg-card/25 p-2 rounded min-h-[60px]">{selectedChar.feats || 'Nenhum talento adquirido.'}</p>
                        )}
                      </div>
                      <div>
                        <span className="text-rpg-muted text-[10px] uppercase block mb-1">Características & Traços</span>
                        {isEditing ? (
                          <textarea
                            name="features"
                            defaultValue={selectedChar.features || ''}
                            rows={3}
                            placeholder="ex: Fúria, Ataque Furtivo, Canalizar Divindade..."
                            className="w-full bg-rpg-card text-white border border-rpg-card rounded p-2 text-xs focus:outline-none focus:border-rpg-accent"
                          />
                        ) : (
                          <p className="text-xs text-white leading-relaxed whitespace-pre-line bg-rpg-card/25 p-2 rounded min-h-[60px]">{selectedChar.features || 'Nenhuma característica anotada.'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 🎒 NOVIDADE D&D: Equipamentos e Moedas (Disponível para TODOS os tipos de personagens) */}
                <div className="bg-rpg-panel/10 border border-rpg-card/30 rounded-xl p-4 text-xs space-y-1.5">
                  <span className="text-rpg-muted text-[10px] uppercase font-bold block">Equipamentos & Moedas</span>
                  {editing ? (
                    <textarea
                      name="equipment"
                      defaultValue={selectedChar.equipment || ''}
                      rows={3}
                      placeholder="ex: Armadura de Placas, Espada Curta, Mochila, 15 PO, 5 PP"
                      className="w-full bg-rpg-card text-white border border-rpg-card rounded p-2 text-xs focus:outline-none focus:border-rpg-accent font-mono"
                    />
                  ) : (
                    <p className="text-xs text-white leading-relaxed whitespace-pre-line bg-rpg-card/25 p-2.5 rounded font-mono min-h-[50px]">
                      {selectedChar.equipment || 'Nenhum equipamento anotado.'}
                    </p>
                  )}
                </div>

                {/* Caixa de Texto Dinâmica de Ações e Ataques do Bestiário (Monstros e Vilões) */}
                {(activeTab === 'monster' || activeTab === 'villain') && (
                  <div className="bg-rpg-panel/10 border border-rpg-card/30 rounded-xl p-4 space-y-4">
                    <h3 className="text-xs font-bold text-rpg-accent uppercase tracking-wider flex items-center gap-1.5"><Swords className="w-4 h-4" /> Ações e Ataques da Ficha</h3>
                    <div>
                      <span className="text-rpg-muted text-[10px] uppercase block mb-1">Ações do Turno</span>
                      {isEditing ? (
                        <textarea
                          name="actions"
                          defaultValue={selectedChar.actions}
                          rows={3}
                          placeholder="Ataques de mordida, magias de ataque..."
                          className="w-full bg-rpg-card text-white border border-rpg-card rounded p-2 text-xs font-mono focus:outline-none focus:border-rpg-accent"
                        />
                      ) : (
                        <pre className="text-xs text-white leading-relaxed font-sans whitespace-pre-line">{selectedChar.actions || 'Nenhuma ação declarada.'}</pre>
                      )}
                    </div>
                    {(selectedChar.bonusActions || isEditing) && (
                      <div>
                        <span className="text-rpg-muted text-[10px] uppercase block mb-1">Ações Bônus</span>
                        {isEditing ? (
                          <textarea
                            name="bonusActions"
                            defaultValue={selectedChar.bonusActions}
                            rows={2}
                            placeholder="Passo nebuloso, rugido assustador bônus..."
                            className="w-full bg-rpg-card text-white border border-rpg-card rounded p-2 text-xs font-mono focus:outline-none focus:border-rpg-accent"
                          />
                        ) : (
                          <p className="text-xs text-white leading-relaxed whitespace-pre-line">{selectedChar.bonusActions}</p>
                        )}
                      </div>
                    )}
                    {(selectedChar.reactions || isEditing) && (
                      <div>
                        <span className="text-rpg-muted text-[10px] uppercase block mb-1">Reações</span>
                        {isEditing ? (
                          <textarea
                            name="reactions"
                            defaultValue={selectedChar.reactions}
                            rows={2}
                            placeholder="Ataque de oportunidade de escudo, esquiva..."
                            className="w-full bg-rpg-card text-white border border-rpg-card rounded p-2 text-xs font-mono focus:outline-none focus:border-rpg-accent"
                          />
                        ) : (
                          <p className="text-xs text-white leading-relaxed whitespace-pre-line">{selectedChar.reactions}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* História Global (Biografia ou Anotações Secretas do Mestre) */}
                <div className="bg-rpg-panel/10 border border-rpg-card/30 rounded-xl p-4">
                  <span className="text-rpg-muted text-[10px] uppercase font-bold block mb-1">Biografia / Diário Secreto de Mestre</span>
                  {isEditing ? (
                    <textarea
                      name="biography"
                      defaultValue={selectedChar.biography}
                      rows={4}
                      placeholder="Escreva aqui o backstory do herói ou ganchos dramáticos envolvendo este ator..."
                      className="w-full bg-rpg-card text-white border border-rpg-card rounded p-2 text-xs focus:outline-none focus:border-rpg-accent"
                    />
                  ) : (
                    <p className="text-xs text-white leading-relaxed whitespace-pre-line">
                      {selectedChar.biography || 'Nenhum diário registrado para este ator.'}
                    </p>
                  )}
                </div>
              </div>

            </div>
          </form>
        </div>
      )}
    </div>
  );
};
