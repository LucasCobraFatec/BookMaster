export interface NoteEntity {
  id: string; // UUID único para evitar conflitos de links
  title: string; // Ex: "Josias, o Guarda"
  type: 'npc' | 'monster' | 'location' | 'item' | 'session_log' | 'lore' | 'table';
  content: string; // Corpo principal em Markdown livre (descrições, notas de preparação)
  campaignId: string; // ID da campanha a que pertence
  
  // Propriedades Estruturadas (O Frontmatter do Obsidian / Metadados do Master App)
  properties: {
    hp?: number; // Pontos de vida atuais
    hpMax?: number; // Pontos de vida máximos
    ca?: number; // Classe de Armadura
    initiativeBonus?: number; // Bônus de iniciativa para rolagem rápida
    faction?: string; // Nome ou ID da Facção (Link bidirecional)
    location?: string; // Onde este NPC se encontra
    dangerLevel?: string; // Nível de Desafio / Perigo (ex: ND 1/2)
    xp?: number; // Experiência concedida
    rarity?: string; // Comum, Incomum, Raro, Lendário (para itens)
    conditions?: string[]; // Condições ativas (ex: Atordoado, Envenenado)
    avatar?: string; // URL da imagem ou Base64 local
    [key: string]: unknown; // Propriedades extras dinâmicas (estilo Dataview do Obsidian)
  };
  
  linkedNoteIds: string[]; // IDs de notas referenciadas via [[Link]]
  createdAt: number;
  updatedAt: number;
  isDraft?: boolean;
}

export interface Campaign {
  id: string;
  name: string; // Ex: "Crônicas de Gor"
  system: string; // Ex: "D&D 5e", "Tormenta20", etc.
  progressionType: 'milestone' | 'xp'; // Tipo de avanço de nível
  createdAt: number;
}

export interface Session {
  id: string;
  campaignId: string;
  name: string;       // Nome da sessão (ex: "Sessão 1: O Encontro na Taverna")
  isActive: boolean;  // Se é a sessão ativa sendo jogada agora
  createdAt: number;  // Horário/Data de criação
}

export interface SessionTimelineLog {
  id: string;
  sessionId: string;
  timestamp: number; // Horário do log (new Date().getTime())
  content: string; // Ex: "O bardo irritou o guarda na taverna"
  isHighlight?: boolean; // Destacar para gerar o diário depois
}

export interface RollTable {
  id: string;
  isDraft?: boolean;
  campaignId: string;
  name: string; // Ex: "Tabela de Encontros na Floresta"
  formula: string; // Ex: "1d20" ou "1d100"
  results: {
    range: [number, number]; // Ex: [1, 2] = Goblin, [3, 4] = Lobo
    text: string; // Resultado ou link para nota ex: "Encontro com [[Lobo]]"
    weight?: number; // Quantidade de resultados do dado atribuídos a esta linha
    locked?: boolean; // Linhas travadas não participam do sorteio
  }[];
}

export interface CharacterEntity {
  id: string;
  isDraft?: boolean;
  campaignId: string;
  type: 'pc' | 'npc' | 'monster' | 'villain';
  name: string;
  avatar?: string; // Armazenará a imagem local convertida para string Base64 Data URL

  // ATRIBUTOS E ESTATÍSTICAS BÁSICAS COMUNS
  alignment: string; // Alinhamento (Ordeiro e Bom, Neutro, etc.)
  languages: string; // Idiomas conhecidos
  hp: number;
  hpMax: number;
  hpTemp?: number;
  ca: number;
  initiative: number; // Iniciativa (Modificador ex: +2)
  speed: string; // Deslocamento (ex: "9 metros", "Voo 12 metros")

  // ATRIBUTOS PRINCIPAIS DE RPG (D&D Clássico)
  attributes: {
    strength: number;     // Força
    dexterity: number;    // Destreza
    constitution: number; // Constituição
    intelligence: number; // Inteligência
    wisdom: number;       // Sabedoria
    charisma: number;     // Carisma
  };

  // CAMPOS ESPECÍFICOS PARA PERSONAGENS JOGADORES (PCs)
  class?: string; // Classe (Guerreiro, Mago, etc.)
  subclass?: string; // Subclasse opcional
  level?: number; // Nível
  species?: string; // Raça / Espécie (Elfo, Humano, etc.)
  background?: string; // Antecedente (Acólito, Soldado, etc.)
  proficiencyBonus?: number; // Bônus de Proficiência
  xp?: number; // Pontos de Experiência
  inspiration?: boolean; // Inspiração heroica
  deathSavesSuccesses?: number;
  deathSavesFailures?: number;

  // CAMPOS ESPECÍFICOS PARA NPCs (Mestrar Rápido)
  role?: string; // Papel ou Profissão (Ferreiro, Rei, Guarda, etc.)
  appearance?: string; // Detalhes rápidos de Aparência
  personality?: string; // Detalhes de Personalidade e Objetivos

  // CAMPOS ESPECÍFICOS PARA MONSTROS / VILÕES (Bestiário de D&D)
  size?: string; // Tamanho (Minúsculo, Médio, Enorme, etc.)
  monsterType?: string; // Subtipo de Criatura (Morto-vivo, Dragão, Elemental, etc.)
  challengeRating?: string; // Nível de Desafio / ND (ex: "1/2", "5", "20")
  savingThrows?: string; // Salvaguardas com Proficiência (ex: "Força +5, Sabedoria +3")
  skills?: string; // Perícias treinadas (ex: "Furtividade +6, Percepção +4")
  resistances?: string; // Resistências a danos (ex: "Fogo, Cortante não mágico")
  immunities?: string; // Imunidades (ex: "Venenoso, Condição Envenenado")
  senses?: string; // Sentidos especiais (ex: "Visão no Escuro 18m, Percepção Passiva 14")
  actions?: string; // Ações (Ataques, Garras, Magia)
  bonusActions?: string; // Ações bônus da criatura
  reactions?: string; // Reações especiais

  // HISTÓRIA / NOTAS GERAIS
  biography?: string; // Backstory do PC ou notas de mestragem secretas do NPC/Monstro
  feats?: string; // Talentos ou feats
  features?: string; // Características e traços
  equipment?: string; // Equipamentos e moedas
  playerName?: string;
  playerSheet?: PlayerSheetData;
  npcSheet?: NpcSheetData;
}

export interface NpcSheetData {
  version: 1;
  secret: string;
  size: string;
  creatureType: string;
  hitDice: string;
  savingThrows: Partial<Record<keyof CharacterEntity['attributes'], number>>;
  passivePerception: number;
  challengeRating: string;
  proficiencyBonus: number;
  traits: string;
  actions: string;
  bonusActions: string;
  reactions: string;
  vulnerabilities?: string;
  damageResistances?: string;
  damageImmunities?: string;
  conditionImmunities?: string;
  legendaryActions?: string;
  legendaryResistance?: string;
  initiativeAdjustment?: number;
}

export interface PlayerSheetRow { id: string; [key: string]: string | number | boolean; }
export interface PlayerSheetData {
  version: 1;
  shield: boolean;
  armorBase: number;
  armorDexCap: number | null;
  hitDie: number;
  initiativeAdjustment?: number;
  size: string;
  passivePerception: number;
  hitDiceSpent: number;
  hitDiceMax: number;
  deathSuccesses: boolean[];
  deathFailures: boolean[];
  skills: Record<string, { trained: boolean; bonus: number }>;
  armorTraining: Record<'light' | 'medium' | 'heavy' | 'shields', boolean>;
  weaponsTraining: string;
  toolsTraining: string;
  classFeatures: string;
  speciesTraits: string;
  attacks: PlayerSheetRow[];
  spellcastingAbility: string;
  spellcastingModifier: number;
  spellSaveDc: number;
  spellAttackBonus: number;
  spellSlots: Array<{ level: number; max: number; spent: boolean[] }>;
  spells: PlayerSheetRow[];
  personality: string;
  coins: { cp: number; sp: number; gp: number; pp: number };
}
