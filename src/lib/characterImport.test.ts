import { describe, expect, it } from 'vitest';
import { parseCharacterJson, parseCharacterText } from './characterImport';

describe('character import', () => {
  it('extracts common monster fields from text', () => {
    const result = parseCharacterText('Dragão Jovem\nArmor Class 18\nHit Points 127\nSpeed 40 ft.\nSTR 23\nDEX 10\nCON 21\nChallenge Rating 10');
    expect(result).toMatchObject({ name: 'Dragão Jovem', type: 'monster', ca: 18, hp: 127, hpMax: 127 });
    expect(result.attributes.strength).toBe(23);
  });

  it('accepts BookMaster-like JSON data', () => {
    expect(parseCharacterJson('{"name":"Lia","type":"pc","hp":22,"hpMax":30,"ca":15,"initiative":3,"speed":"9 m","attributes":{"strength":8},"features":"Ataque Extra","actions":"Espada","biography":"História de Lia"}')).toMatchObject({ name: 'Lia', type: 'pc', hp: 22, hpMax: 30, ca: 15, initiative: 3, features: 'Ataque Extra', actions: 'Espada', biography: 'História de Lia' });
  });

  it('imports the complete tabbed player sheet', () => {
    const result = parseCharacterJson(JSON.stringify({
      name: 'Lia', type: 'pc', level: 3,
      playerSheet: {
        shield: true, armorBase: 15, armorDexCap: 2, hitDie: 10, initiativeAdjustment: 1,
        skills: { 'Destreza:Furtividade': { trained: true, bonus: 2 } },
        armorTraining: { light: true, medium: true, heavy: false, shields: true },
        classFeatures: 'Surto de Ação', speciesTraits: 'Versátil',
        attacks: [{ id: 'attack-1', name: 'Espada', bonus: '+5', damage: '1d8+3', notes: '' }],
        spellSlots: [{ level: 1, max: 2, spent: [true, false] }],
        spells: [{ id: 'spell-1', prepared: true, level: 1, name: 'Escudo' }],
        coins: { cp: 1, sp: 2, gp: 30, pp: 0 }, personality: 'Corajosa',
      },
    }));
    expect(result.playerSheet).toMatchObject({ shield: true, armorBase: 15, classFeatures: 'Surto de Ação', personality: 'Corajosa' });
    expect(result.playerSheet?.skills['Destreza:Furtividade']).toEqual({ trained: true, bonus: 2 });
    expect(result.playerSheet?.attacks[0]).toMatchObject({ name: 'Espada', damage: '1d8+3' });
    expect(result.playerSheet?.spellSlots[0]).toEqual({ level: 1, max: 2, spent: [true, false] });
  });
});
