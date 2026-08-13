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
  const roll = rollDice(table.formula, random);
  let result = getRollTableResult(table, roll.total);
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
