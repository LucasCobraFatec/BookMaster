import { describe, expect, it } from 'vitest';
import type { RollTable } from '../types/rpg.types';
import {
  exportRollTablesCsv,
  exportRollTablesJson,
  importRollTablesCsv,
  importRollTablesJson,
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
});
