import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { CharacterEntity } from '../types/rpg.types';

export function useEntities(campaignId: string) {
  const query = useLiveQuery(() => campaignId ? db.characters.where('campaignId').equals(campaignId).toArray() : Promise.resolve<CharacterEntity[]>([]), [campaignId]);
  const characters = query ?? [];

  const createCharacter = async (targetCampaignId: string, type: CharacterEntity['type'], name: string, avatar?: string) => {
    const character: CharacterEntity = {
      id: crypto.randomUUID(), campaignId: targetCampaignId, type, name, avatar, isDraft: true, alignment: 'Neutro', languages: 'Comum', hp: type === 'monster' || type === 'villain' ? 15 : 10, hpMax: type === 'monster' || type === 'villain' ? 15 : 10, hpTemp: 0, ca: 10, initiative: 0, speed: '9 metros',
      attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 }, savingThrows: '', skills: '', senses: 'Percepção Passiva 10', resistances: '', immunities: '', actions: '⚔️ **Espada Curta.** Corpo a corpo: +4 para acertar. Dano: 1d6 + 2 perfurante.', bonusActions: '', reactions: '', biography: '', feats: '', features: '', equipment: '',
      ...(type === 'pc' && { class: 'Guerreiro', subclass: '', level: 1, species: 'Humano', background: 'Soldado', proficiencyBonus: 2, xp: 0, inspiration: false, deathSavesSuccesses: 0, deathSavesFailures: 0 }),
      ...(type === 'npc' && { role: 'Cidadão comum', appearance: 'Roupas simples de camponês.', personality: 'Pacífico e prestativo.' }),
    };
    await db.characters.add(character);
    return character;
  };

  const updateCharacter = async (id: string, updates: Partial<CharacterEntity>): Promise<void> => { await db.characters.update(id, { ...updates, isDraft: false }); };
  const duplicateCharacter = async (id: string): Promise<CharacterEntity> => {
    const source = await db.characters.get(id);
    if (!source) throw new Error('Ficha não encontrada para duplicação.');
    const campaignCharacters = await db.characters.where('campaignId').equals(source.campaignId).toArray();
    let name = `${source.name} (Cópia)`;
    let copyNumber = 2;
    while (campaignCharacters.some((character) => character.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase())) {
      name = `${source.name} (Cópia ${copyNumber})`;
      copyNumber += 1;
    }
    const duplicate = structuredClone(source);
    duplicate.id = crypto.randomUUID();
    duplicate.name = name;
    await db.characters.add(duplicate);
    return duplicate;
  };
  const deleteCharacter = async (id: string): Promise<void> => { await db.characters.delete(id); };
  return { characters, loading: query === undefined, getCharactersByCampaign: (id: string) => characters.filter((character) => character.campaignId === id), createCharacter, updateCharacter, duplicateCharacter, deleteCharacter };
}
