import type { RollTable } from '../types/rpg.types';

export type ImportedRollTable = Pick<RollTable, 'name' | 'formula' | 'results'>;

const escapeCsv = (value: string | number | boolean) => `"${String(value).replaceAll('"', '""')}"`;

function isImportedResult(value: unknown): value is { range: [number, number]; text: string; weight?: number; locked?: boolean } {
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
  const rows = ['tableName,formula,min,max,weight,locked,text'];

  tables.forEach((table) => {
    table.results.forEach((result) => {
      rows.push([
        table.name,
        table.formula,
        result.range[0],
        result.range[1],
        result.weight ?? Math.max(1, result.range[1] - result.range[0] + 1),
        Boolean(result.locked),
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
        ? [{
          range: [result.range[0], result.range[1]] as [number, number],
          text: result.text,
          ...(typeof result.weight === 'number' ? { weight: result.weight } : {}),
          ...(result.locked === true ? { locked: true } : {}),
        }]
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
    const values = csvValues(line);
    const legacy = values.length < 7;
    const [name, formula, min, max] = values;
    const weight = legacy ? undefined : Number(values[4]);
    const locked = legacy ? false : values[5].toLocaleLowerCase() === 'true';
    const text = legacy ? values[4] : values[6];
    if (!name || !text || !Number.isFinite(Number(min)) || !Number.isFinite(Number(max))) return;

    const table = grouped.get(name) ?? { name, formula: formula || '1d20', results: [] };
    const legacyWeight = Math.max(1, Number(max) - Number(min) + 1);
    table.results.push({
      range: [Number(min), Number(max)],
      text,
      ...(Number.isFinite(weight) && (weight !== legacyWeight || locked) ? { weight } : {}),
      ...(locked ? { locked: true } : {}),
    });
    grouped.set(name, table);
  });

  return [...grouped.values()];
}

export function importRollTablesText(content: string, tableName = 'Tabela importada'): ImportedRollTable[] {
  const results = content.split(/\r?\n/).flatMap((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) return [];
    const separator = line.indexOf('|');
    const possibleWeight = separator >= 0 ? Number(line.slice(0, separator).trim()) : 1;
    const text = (separator >= 0 && Number.isFinite(possibleWeight) ? line.slice(separator + 1) : line).trim();
    if (!text) return [];
    return [{ text, weight: Math.max(1, Math.trunc(Number.isFinite(possibleWeight) ? possibleWeight : 1)), locked: false, range: [1, 1] as [number, number] }];
  });
  let next = 1;
  const normalized = results.map((result) => {
    const range: [number, number] = [next, next + result.weight - 1];
    next = range[1] + 1;
    return { ...result, range };
  });
  return normalized.length ? [{ name: tableName.trim() || 'Tabela importada', formula: `1d${next - 1}`, results: normalized }] : [];
}
