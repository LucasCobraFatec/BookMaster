import type { RollTable } from '../types/rpg.types';

export interface DiceRoll {
  diceSides: number;
  total: number;
}

export interface CompositeRoll {
  total: number;
  result: string;
  trail: string[];
}

export type RollTableResult = RollTable['results'][number];

export function resultWeight(result: RollTableResult): number {
  const legacyWeight = Math.max(1, result.range[1] - result.range[0] + 1);
  return Math.max(1, Math.trunc(result.weight ?? legacyWeight));
}

export function normalizeWeightedResults(results: RollTableResult[]): { results: RollTableResult[]; formula: string } {
  let nextValue = 1;
  const normalized = results.map((result) => {
    const weight = resultWeight(result);
    if (result.locked) return { ...result, weight, range: [0, 0] as [number, number] };
    const range: [number, number] = [nextValue, nextValue + weight - 1];
    nextValue = range[1] + 1;
    return { ...result, weight, range };
  });
  return { results: normalized, formula: `1d${Math.max(1, nextValue - 1)}` };
}

export function rollWeightedResult(table: RollTable, random = Math.random): { total: number; result?: RollTableResult } {
  const normalized = normalizeWeightedResults(table.results);
  const activeResults = normalized.results.filter((result) => !result.locked);
  const totalWeight = activeResults.reduce((sum, result) => sum + resultWeight(result), 0);
  if (!totalWeight) return { total: 0 };
  const total = Math.floor(random() * totalWeight) + 1;
  return { total, result: activeResults.find((result) => total >= result.range[0] && total <= result.range[1]) };
}

export function getRollTableLinkName(rawTitle: string): string | undefined {
  const match = rawTitle.trim().match(/^tabela\s*:\s*(.+)$/i);
  return match?.[1].trim() || undefined;
}

export function resolveRollTableLink(rawTitle: string, tables: RollTable[]): RollTable | undefined {
  const explicitName = getRollTableLinkName(rawTitle);
  if (!explicitName) return undefined;

  const normalizedName = explicitName.normalize('NFC').toLocaleLowerCase();
  return tables.find(
    (table) => table.name.trim().normalize('NFC').toLocaleLowerCase() === normalizedName,
  );
}

export function rollDice(formula: string, random = Math.random): DiceRoll {
  const formulaMatch = formula.trim().toLowerCase().match(/^(\d+)d(\d+)$/);
  const diceCount = Number(formulaMatch?.[1] ?? 1);
  const diceSides = Number(formulaMatch?.[2] ?? 10);

  if (diceCount < 1 || diceSides < 1) {
    return { diceSides: 10, total: Math.floor(random() * 10) + 1 };
  }

  let total = 0;
  for (let index = 0; index < diceCount; index += 1) {
    total += Math.floor(random() * diceSides) + 1;
  }

  return { diceSides, total };
}

export function getRollTableResult(table: RollTable, total: number): string {
  return table.results.find((result) => total >= result.range[0] && total <= result.range[1])?.text
    ?? 'Nenhum resultado correspondente.';
}

export function resolveCompositeRoll(
  table: RollTable,
  tables: RollTable[],
  random = Math.random,
  visited = new Set<string>(),
): CompositeRoll {
  if (visited.has(table.id)) {
    return { total: 0, result: `[Ciclo detectado: ${table.name}]`, trail: [table.name] };
  }

  const nextVisited = new Set(visited).add(table.id);
  const roll = rollWeightedResult(table, random);
  let result = roll.result?.text ?? 'Nenhum resultado correspondente.';
  const trail = [`${table.name}: ${roll.total}`];
  const references = [...result.matchAll(/\[\[Tabela:\s*([^\]]+)\]\]/gi)];

  for (const reference of references) {
    const targetName = reference[1].trim();
    const target = tables.find(
      (candidate) => candidate.name.toLocaleLowerCase() === targetName.toLocaleLowerCase(),
    );

    if (!target) {
      result = result.replace(reference[0], `[Tabela nao encontrada: ${targetName}]`);
      continue;
    }

    const nested = resolveCompositeRoll(target, tables, random, nextVisited);
    trail.push(...nested.trail);
    result = result.replace(reference[0], nested.result);
  }

  return { total: roll.total, result, trail };
}
