import type { CharacterEntity } from '../types/rpg.types';

export type ImportedCharacterDraft = Pick<CharacterEntity, 'type' | 'name' | 'hp' | 'hpMax' | 'ca' | 'initiative' | 'speed' | 'attributes'> & Partial<CharacterEntity> & { sourceText: string };

const numberAfter = (text: string, labels: string[]) => {
  const label = labels.map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const match = text.match(new RegExp(`(?:${label})\\s*[:]?\\s*(-?\\d+)`, 'i'));
  return match ? Number(match[1]) : undefined;
};
const textAfter = (text: string, labels: string[]) => {
  const label = labels.map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return text.match(new RegExp(`(?:${label})\\s*[:]?\\s*([^\\n\\r]+)`, 'i'))?.[1].trim();
};
const ability = (text: string, labels: string[], fallback = 10) => numberAfter(text, labels) ?? fallback;

const playerSkillKeys = [
  'Força:Salvaguarda', 'Força:Atletismo',
  'Destreza:Salvaguarda', 'Destreza:Acrobacia', 'Destreza:Furtividade', 'Destreza:Prestidigitação',
  'Constituição:Salvaguarda',
  'Inteligência:Salvaguarda', 'Inteligência:Arcanismo', 'Inteligência:História', 'Inteligência:Investigação', 'Inteligência:Natureza', 'Inteligência:Religião',
  'Sabedoria:Salvaguarda', 'Sabedoria:Lidar com Animais', 'Sabedoria:Intuição', 'Sabedoria:Medicina', 'Sabedoria:Percepção', 'Sabedoria:Sobrevivência',
  'Carisma:Salvaguarda', 'Carisma:Atuação', 'Carisma:Enganação', 'Carisma:Intimidação', 'Carisma:Persuasão',
];
const defaultSlotTotals = [4, 3, 3, 3, 3, 2, 2, 1, 1];
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const stringValue = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback;
const numberValue = (value: unknown, fallback = 0) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const booleanValue = (value: unknown, fallback = false) => typeof value === 'boolean' ? value : fallback;

function parsePlayerSheet(value: unknown, level: number) {
  const raw = record(value);
  const rawSkills = record(raw.skills);
  const skills = Object.fromEntries(playerSkillKeys.map((key) => {
    const skill = record(rawSkills[key]);
    return [key, { trained: booleanValue(skill.trained), bonus: numberValue(skill.bonus) }];
  }));
  const armorTraining = record(raw.armorTraining);
  const rows = (value: unknown) => Array.isArray(value) ? value.flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const source = item as Record<string, unknown>;
    const row = Object.fromEntries(Object.entries(source).filter(([, field]) => ['string', 'number', 'boolean'].includes(typeof field)));
    return [{ id: typeof row.id === 'string' && row.id ? row.id : crypto.randomUUID(), ...row }];
  }) : [];
  const rawSlots = Array.isArray(raw.spellSlots) ? raw.spellSlots : [];
  const spellSlots = defaultSlotTotals.map((fallbackMax, index) => {
    const slot = record(rawSlots.find((item) => record(item).level === index + 1));
    const max = Math.max(0, Math.min(20, numberValue(slot.max, fallbackMax)));
    const rawSpent = Array.isArray(slot.spent) ? slot.spent : [];
    return { level: index + 1, max, spent: Array.from({ length: max }, (_, spentIndex) => booleanValue(rawSpent[spentIndex])) };
  });
  const coins = record(raw.coins);
  return {
    version: 1 as const,
    shield: booleanValue(raw.shield), armorBase: numberValue(raw.armorBase, 10), armorDexCap: raw.armorDexCap === null ? null : numberValue(raw.armorDexCap, 2),
    hitDie: numberValue(raw.hitDie, 10), initiativeAdjustment: numberValue(raw.initiativeAdjustment), size: stringValue(raw.size, 'Médio'), passivePerception: numberValue(raw.passivePerception, 10),
    hitDiceSpent: numberValue(raw.hitDiceSpent), hitDiceMax: numberValue(raw.hitDiceMax, Math.max(1, level)),
    deathSuccesses: Array.from({ length: 3 }, (_, index) => booleanValue(Array.isArray(raw.deathSuccesses) ? raw.deathSuccesses[index] : false)),
    deathFailures: Array.from({ length: 3 }, (_, index) => booleanValue(Array.isArray(raw.deathFailures) ? raw.deathFailures[index] : false)),
    skills,
    armorTraining: { light: booleanValue(armorTraining.light), medium: booleanValue(armorTraining.medium), heavy: booleanValue(armorTraining.heavy), shields: booleanValue(armorTraining.shields) },
    weaponsTraining: stringValue(raw.weaponsTraining), toolsTraining: stringValue(raw.toolsTraining), classFeatures: stringValue(raw.classFeatures), speciesTraits: stringValue(raw.speciesTraits),
    attacks: rows(raw.attacks), spellcastingAbility: stringValue(raw.spellcastingAbility), spellcastingModifier: numberValue(raw.spellcastingModifier), spellSaveDc: numberValue(raw.spellSaveDc), spellAttackBonus: numberValue(raw.spellAttackBonus),
    spellSlots, spells: rows(raw.spells), personality: stringValue(raw.personality),
    coins: { cp: numberValue(coins.cp), sp: numberValue(coins.sp), gp: numberValue(coins.gp), pp: numberValue(coins.pp) },
  };
}

export function parseCharacterText(sourceText: string): ImportedCharacterDraft {
  const text = sourceText.replace(/\u00a0/g, ' ').replace(/\r/g, '').trim();
  const monsterSignals = /armor class|classe de armadura|hit points|pontos de vida|challenge rating|nível de desafio|legendary actions|ações lendárias/i.test(text);
  const playerSignals = /player name|nome do jogador|background|antecedente|death saves|salvaguardas contra a morte/i.test(text);
  const type: CharacterEntity['type'] = playerSignals ? 'pc' : monsterSignals ? 'monster' : 'npc';
  const firstUsefulLine = text.split('\n').map((line) => line.trim()).find((line) => line.length > 1 && line.length < 100) ?? 'Ficha importada';
  const hp = numberAfter(text, ['Pontos de Vida', 'PV', 'Hit Points', 'HP']) ?? 10;
  return {
    type,
    name: textAfter(text, ['Nome', 'Name']) ?? firstUsefulLine,
    hp,
    hpMax: hp,
    ca: numberAfter(text, ['Classe de Armadura', 'CA', 'Armor Class', 'AC']) ?? 10,
    initiative: numberAfter(text, ['Iniciativa', 'Initiative']) ?? 0,
    speed: textAfter(text, ['Deslocamento', 'Speed']) ?? '9 metros',
    attributes: {
      strength: ability(text, ['FOR', 'STR', 'Força', 'Strength']), dexterity: ability(text, ['DES', 'DEX', 'Destreza', 'Dexterity']),
      constitution: ability(text, ['CON', 'Constituição', 'Constitution']), intelligence: ability(text, ['INT', 'Inteligência', 'Intelligence']),
      wisdom: ability(text, ['SAB', 'WIS', 'Sabedoria', 'Wisdom']), charisma: ability(text, ['CAR', 'CHA', 'Carisma', 'Charisma']),
    },
    challengeRating: textAfter(text, ['Nível de Desafio', 'ND', 'Challenge Rating', 'CR']),
    languages: textAfter(text, ['Idiomas', 'Languages']) ?? '',
    senses: textAfter(text, ['Sentidos', 'Senses']),
    skills: textAfter(text, ['Perícias', 'Skills']),
    biography: `Importado de documento externo. Revise os campos abaixo.\n\n${text}`,
    sourceText: text,
  };
}

export function parseCharacterJson(content: string): ImportedCharacterDraft {
  const value: unknown = JSON.parse(content);
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || typeof candidate !== 'object') throw new Error('O JSON não contém uma ficha válida.');
  const object = candidate as Record<string, unknown>;
  const textFallback = Object.entries(object).map(([key, value]) => `${key}: ${String(value)}`).join('\n');
  const parsed = parseCharacterText(textFallback);
  const attributes = object.attributes && typeof object.attributes === 'object' ? object.attributes as Partial<CharacterEntity['attributes']> : {};
  const importedFields: Partial<CharacterEntity> = {};
  const stringFields: Array<keyof CharacterEntity> = [
    'alignment', 'languages', 'speed', 'class', 'subclass', 'species', 'background', 'playerName',
    'role', 'appearance', 'personality', 'size', 'monsterType', 'challengeRating', 'savingThrows',
    'skills', 'resistances', 'immunities', 'senses', 'actions', 'bonusActions', 'reactions',
    'biography', 'feats', 'features', 'equipment',
  ];
  stringFields.forEach((key) => {
    if (typeof object[key] === 'string') (importedFields as Record<string, unknown>)[key] = object[key];
  });
  const numberFields: Array<keyof CharacterEntity> = ['level', 'proficiencyBonus', 'xp', 'hpTemp'];
  numberFields.forEach((key) => {
    if (typeof object[key] === 'number') (importedFields as Record<string, unknown>)[key] = object[key];
  });
  if (object.playerSheet && typeof object.playerSheet === 'object') {
    importedFields.playerSheet = parsePlayerSheet(object.playerSheet, typeof object.level === 'number' ? object.level : 1);
  }
  return {
    ...parsed,
    ...importedFields,
    type: ['pc', 'npc', 'monster', 'villain'].includes(String(object.type)) ? object.type as CharacterEntity['type'] : parsed.type,
    name: typeof object.name === 'string' ? object.name : parsed.name,
    hp: typeof object.hp === 'number' ? object.hp : parsed.hp,
    hpMax: typeof object.hpMax === 'number' ? object.hpMax : parsed.hpMax,
    ca: typeof object.ca === 'number' ? object.ca : parsed.ca,
    initiative: typeof object.initiative === 'number' ? object.initiative : parsed.initiative,
    speed: typeof object.speed === 'string' ? object.speed : parsed.speed,
    attributes: { ...parsed.attributes, ...attributes },
    sourceText: textFallback,
  };
}
