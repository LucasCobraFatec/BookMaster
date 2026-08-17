import { describe, expect, it } from 'vitest';
import type { RollTable } from '../types/rpg.types';
import {
  exportRollTablesCsv,
  exportRollTablesJson,
  importRollTablesCsv,
  importRollTablesJson,
  importRollTablesText,
} from './rollTableTransfer';

const table: RollTable = {
  id: 'table-1',
  campaignId: 'campaign',
  name: 'Tesouros',
  formula: '1d100',
  results: [
    { range: [1, 50], text: 'Moedas, joias e "mapa"' },
    { range: [51, 100], text: 'Artefato antigo' },
  ],
};

describe('roll table transfer', () => {
  it('exports and imports JSON tables', () => {
    expect(importRollTablesJson(exportRollTablesJson([table]))).toEqual([
      {
        name: 'Tesouros',
        formula: '1d100',
        results: table.results,
      },
    ]);
  });

  it('exports and imports CSV tables with quoted content', () => {
    expect(importRollTablesCsv(exportRollTablesCsv([table]))).toEqual([
      {
        name: 'Tesouros',
        formula: '1d100',
        results: table.results,
      },
    ]);
  });

  it('imports simple weighted text and plain lines', () => {
    expect(importRollTablesText('5 | Goblins\n2 | [[Tabela: Tesouros]]\nDescanso seguro', 'Encontros')).toEqual([{
      name: 'Encontros',
      formula: '1d8',
      results: [
        { range: [1, 5], text: 'Goblins', weight: 5, locked: false },
        { range: [6, 7], text: '[[Tabela: Tesouros]]', weight: 2, locked: false },
        { range: [8, 8], text: 'Descanso seguro', weight: 1, locked: false },
      ],
    }]);
  });
});
