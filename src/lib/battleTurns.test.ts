import { describe, expect, it } from 'vitest';
import { findActiveTurnDistance, isDefeatedEnemy, isDownedPlayer, isPermanentlyOut } from './battleTurns';

describe('battle turns', () => {
  it('only marks enemies at zero or fewer hit points as defeated', () => {
    expect(isDefeatedEnemy({ side: 'enemy', hp: 0 })).toBe(true);
    expect(isDefeatedEnemy({ side: 'enemy', hp: -3 })).toBe(true);
    expect(isDefeatedEnemy({ side: 'enemy', hp: 1 })).toBe(false);
    expect(isDefeatedEnemy({ side: 'ally', hp: 0 })).toBe(false);
  });

  it('treats allied NPCs, villains and monsters like defeated monsters at zero HP', () => {
    expect(isDefeatedEnemy({ side: 'ally', hp: 0, characterType: 'npc' })).toBe(true);
    expect(isDefeatedEnemy({ side: 'ally', hp: 0, characterType: 'villain' })).toBe(true);
    expect(isDefeatedEnemy({ side: 'ally', hp: 0, characterType: 'monster' })).toBe(true);
    expect(isDefeatedEnemy({ side: 'enemy', hp: 0, characterType: 'pc' })).toBe(false);
  });

  it('keeps downed players available for death saves but skips dead players', () => {
    expect(isDownedPlayer({ side: 'ally', hp: 0, characterType: 'pc' })).toBe(true);
    expect(isPermanentlyOut({ side: 'ally', hp: 0, characterType: 'pc' })).toBe(false);
    expect(isPermanentlyOut({ side: 'ally', hp: 0, characterType: 'pc', isDead: true })).toBe(true);
  });

  it('skips consecutive defeated enemies in both directions', () => {
    const combatants = [
      { side: 'ally' as const, hp: 10 },
      { side: 'enemy' as const, hp: 0 },
      { side: 'enemy' as const, hp: -1 },
      { side: 'ally' as const, hp: 4 },
    ];

    expect(findActiveTurnDistance(combatants, 1)).toBe(3);
    expect(findActiveTurnDistance(combatants, -1)).toBe(1);
  });

  it('allows a healed enemy to return to the initiative', () => {
    const combatants = [{ side: 'ally' as const, hp: 10 }, { side: 'enemy' as const, hp: 0 }];
    expect(findActiveTurnDistance(combatants, 1)).toBe(2);
    combatants[1].hp = 1;
    expect(findActiveTurnDistance(combatants, 1)).toBe(1);
  });
});
