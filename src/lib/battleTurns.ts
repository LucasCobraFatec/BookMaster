export interface TurnCombatant {
  side: 'ally' | 'enemy';
  hp: number;
  characterType?: 'pc' | 'npc' | 'monster' | 'villain';
  isDead?: boolean;
}

export function isDefeatedEnemy(combatant: TurnCombatant): boolean {
  const isNonPlayerCharacter = combatant.characterType
    ? combatant.characterType !== 'pc'
    : combatant.side === 'enemy';
  return isNonPlayerCharacter && combatant.hp <= 0;
}

export function isDownedPlayer(combatant: TurnCombatant): boolean {
  return combatant.characterType === 'pc' && combatant.hp <= 0 && !combatant.isDead;
}

export function isPermanentlyOut(combatant: TurnCombatant): boolean {
  return isDefeatedEnemy(combatant) || Boolean(combatant.characterType === 'pc' && combatant.isDead);
}

export function findActiveTurnDistance(
  combatants: TurnCombatant[],
  direction: 1 | -1,
  maximumDistance = combatants.length,
): number | undefined {
  const limit = Math.min(combatants.length, Math.max(0, maximumDistance));

  for (let distance = 1; distance <= limit; distance += 1) {
    const index = direction === 1
      ? distance % combatants.length
      : (combatants.length - (distance % combatants.length)) % combatants.length;

    if (!isPermanentlyOut(combatants[index])) return distance;
  }

  return undefined;
}
