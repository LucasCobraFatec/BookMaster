import { describe, expect, it } from 'vitest';
import type { RollTable } from '../types/rpg.types';
import { getRollTableResult, normalizeWeightedResults, resolveCompositeRoll, resolveRollTableLink, rollDice, rollWeightedResult } from './rollTable';

const table: RollTable = {
  id: 'encounters',
  campaignId: 'campaign',
  name: 'Encontros',
  formula: '1d20',
  results: [
    { range: [1, 10], text: 'Goblin' },
    { range: [11, 20], text: 'Ogro' },
  ],
};

describe('roll tables', () => {
  it('resolves a table wikilink despite spaces and letter case', () => {
    const table = { id: 'treasures', campaignId: 'campaign', name: 'Tesouros Antigos', formula: '1d20', results: [] } as RollTable;
    expect(resolveRollTableLink(' TABELA:  tesouros antigos ', [table])).toBe(table);
    expect(resolveRollTableLink('Tesouros Antigos', [table])).toBeUndefined();
  });
  it('rolls each die in a valid formula', () => {
    expect(rollDice('2d6', () => 0.5)).toEqual({ diceSides: 6, total: 8 });
  });

  it('uses 1d10 for invalid formulas', () => {
    expect(rollDice('invalid', () => 0)).toEqual({ diceSides: 10, total: 1 });
  });

  it('calculates intervals from weights and excludes locked rows', () => {
    const normalized = normalizeWeightedResults([
      { range: [1, 1], text: 'Comum', weight: 3 },
      { range: [2, 2], text: 'Travado', weight: 8, locked: true },
      { range: [3, 3], text: 'Raro', weight: 1 },
    ]);
    expect(normalized.formula).toBe('1d4');
    expect(normalized.results.map((result) => result.range)).toEqual([[1, 3], [0, 0], [4, 4]]);
    expect(rollWeightedResult({ ...table, results: normalized.results }, () => 0.99).result?.text).toBe('Raro');
  });

  it('finds the matching range or reports a missing result', () => {
    expect(getRollTableResult(table, 12)).toBe('Ogro');
    expect(getRollTableResult(table, 21)).toBe('Nenhum resultado correspondente.');
  });

  it('resolves a nested table reference inside a result', () => {
    const treasureTable: RollTable = {
      id: 'treasures',
      campaignId: 'campaign',
      name: 'Tesouros',
      formula: '1d4',
      results: [{ range: [1, 4], text: 'moedas antigas' }],
    };

    const encounterTable: RollTable = {
      ...table,
      results: [{ range: [1, 20], text: 'Baú com [[Tabela: Tesouros]]' }],
    };

    const composite = resolveCompositeRoll(encounterTable, [encounterTable, treasureTable], () => 0);

    expect(composite.result).toBe('Baú com moedas antigas');
    expect(composite.trail).toEqual(['Encontros: 1', 'Tesouros: 1']);
  });

  it('stops recursive table cycles', () => {
    const firstTable: RollTable = {
      id: 'first',
      campaignId: 'campaign',
      name: 'Primeira',
      formula: '1d4',
      results: [{ range: [1, 4], text: 'Chama [[Tabela: Segunda]]' }],
    };
    const secondTable: RollTable = {
      id: 'second',
      campaignId: 'campaign',
      name: 'Segunda',
      formula: '1d4',
      results: [{ range: [1, 4], text: 'Volta [[Tabela: Primeira]]' }],
    };

    const composite = resolveCompositeRoll(firstTable, [firstTable, secondTable], () => 0);

    expect(composite.result).toBe('Chama Volta [Ciclo detectado: Primeira]');
  });
});
