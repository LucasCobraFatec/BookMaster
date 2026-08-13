import type { RollTable } from '../types/rpg.types';

export type ImportedRollTable = Pick<RollTable, 'name' | 'formula' | 'results'>;

const escapeCsv = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

function isImportedResult(value: unknown): value is { range: [number, number]; text: string } {
  return Boolean(
    value
      && typeof value === 'object'
      && 'range' in value
      && Array.isArray(value.range)
      && value.range.length === 2
      && typeof value.range[0] === 'number'
      && typeof value.range[1] === 'number'
      && 'text' in value
      && typeof value.text === 'string',
  );
}

export function exportRollTablesCsv(tables: RollTable[]) {
  const rows = ['tableName,formula,min,max,text'];

  tables.forEach((table) => {
    table.results.forEach((result) => {
      rows.push([
        table.name,
        table.formula,
        result.range[0],
        result.range[1],
        result.text,
      ].map(escapeCsv).join(','));
    });
  });

  return rows.join('\n');
}

export function exportRollTablesJson(tables: RollTable[]) {
  return JSON.stringify(
    tables.map(({ name, formula, results }) => ({ name, formula, results })),
    null,
    2,
  );
}

function csvValues(line: string) {
  return [...line.matchAll(/(?:^|,)(?:"((?:[^"]|"")*)"|([^,]*))/g)]
    .map((match) => (match[1] ?? match[2]).replaceAll('""', '"'));
}

export function importRollTablesJson(content: string): ImportedRollTable[] {
  const parsed: unknown = JSON.parse(content);
  const tables = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && 'tables' in parsed && Array.isArray(parsed.tables)
      ? parsed.tables
      : [];

  return tables.flatMap((table): ImportedRollTable[] => {
    if (!table || typeof table !== 'object' || !('name' in table) || typeof table.name !== 'string') {
      return [];
    }

    const rawResults: unknown[] = 'results' in table && Array.isArray(table.results) ? table.results : [];
    const results = rawResults.flatMap((result) => (
      isImportedResult(result)
        ? [{ range: [result.range[0], result.range[1]] as [number, number], text: result.text }]
        : []
    ));

    return [{
      name: table.name,
      formula: 'formula' in table && typeof table.formula === 'string' ? table.formula : '1d20',
      results,
    }];
  });
}

export function importRollTablesCsv(content: string): ImportedRollTable[] {
  const grouped = new Map<string, ImportedRollTable>();

  content.split(/\r?\n/).slice(1).filter(Boolean).forEach((line) => {
    const [name, formula, min, max, text] = csvValues(line);
    if (!name || !text || !Number.isFinite(Number(min)) || !Number.isFinite(Number(max))) return;

    const table = grouped.get(name) ?? { name, formula: formula || '1d20', results: [] };
    table.results.push({ range: [Number(min), Number(max)], text });
    grouped.set(name, table);
  });

  return [...grouped.values()];
}
