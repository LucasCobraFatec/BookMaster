import { describe, expect, it } from 'vitest';
import type { RollTable } from '../types/rpg.types';
import { getRollTableResult, rollDice } from './rollTable';

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
  it('rolls each die in a valid formula', () => {
    expect(rollDice('2d6', () => 0.5)).toEqual({ diceSides: 6, total: 8 });
  });

  it('uses 1d10 for invalid formulas', () => {
    expect(rollDice('invalid', () => 0)).toEqual({ diceSides: 10, total: 1 });
  });

  it('finds the matching range or reports a missing result', () => {
    expect(getRollTableResult(table, 12)).toBe('Ogro');
    expect(getRollTableResult(table, 21)).toBe('Nenhum resultado correspondente.');
  });
});
