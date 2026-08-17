import { Copy, Dices, Heart, Shield, Swords, Trash2, X } from 'lucide-react';
import { useState, type DragEvent } from 'react';
import type { CharacterEntity } from '../types/rpg.types';

export type BattleSide = 'ally' | 'enemy';
export type InitiativeMode = 'normal' | 'advantage' | 'disadvantage';
export interface BattleStatus { id: string; name: string; definitionId?: string; stacks?: number; attribute: keyof CharacterEntity['attributes']; modifier: number; }
export interface BattleToken { id: string; characterId: string; characterType: CharacterEntity['type']; name: string; avatar?: string; side: BattleSide; hp: number; hpMax: number; ca: number; initiative: number; initiativeRoll?: number; initiativeRolls?: number[]; initiativeMode: InitiativeMode; baseInitiative: number; attributes: CharacterEntity['attributes']; statuses: BattleStatus[]; deathSuccesses: number; deathFailures: number; isDead?: boolean; }

function createBattleToken(character: CharacterEntity, side: BattleSide): BattleToken {
  return { id: crypto.randomUUID(), characterId: character.id, characterType: character.type, name: character.name, avatar: character.avatar, side, hp: character.hp, hpMax: character.hpMax, ca: character.ca, initiative: 0, initiativeMode: 'normal', baseInitiative: character.initiative, attributes: character.attributes, statuses: [], deathSuccesses: character.playerSheet?.deathSuccesses.filter(Boolean).length ?? character.deathSavesSuccesses ?? 0, deathFailures: character.playerSheet?.deathFailures.filter(Boolean).length ?? character.deathSavesFailures ?? 0 };
}

function alphabeticSuffix(index: number): string {
  let value = index + 1;
  let suffix = '';
  while (value > 0) {
    value -= 1;
    suffix = String.fromCharCode(65 + (value % 26)) + suffix;
    value = Math.floor(value / 26);
  }
  return suffix;
}

function duplicateTokenInstance(tokens: BattleToken[], source: BattleToken, character: CharacterEntity): BattleToken[] {
  const duplicate = createBattleToken(character, source.side);
  duplicate.initiativeMode = source.initiativeMode;
  const characterTokens = [...tokens.filter((token) => token.characterId === character.id), duplicate];
  const names = new Map(characterTokens.map((token, index) => [token.id, `${character.name} ${alphabeticSuffix(index)}`]));
  return [...tokens, duplicate].map((token) => names.has(token.id) ? { ...token, name: names.get(token.id)! } : token);
}

function rollTokenInitiative(token: BattleToken): BattleToken {
  const rolls = token.initiativeMode === 'normal' ? [Math.floor(Math.random() * 20) + 1] : [Math.floor(Math.random() * 20) + 1, Math.floor(Math.random() * 20) + 1];
  const initiativeRoll = token.initiativeMode === 'advantage' ? Math.max(...rolls) : token.initiativeMode === 'disadvantage' ? Math.min(...rolls) : rolls[0];
  return { ...token, initiativeRoll, initiativeRolls: rolls, initiative: initiativeRoll + token.baseInitiative };
}

function sortInitiative(tokens: BattleToken[]): BattleToken[] {
  return [...tokens].sort((a, b) => b.initiative - a.initiative);
}

function rollInitiative(tokens: BattleToken[]): BattleToken[] {
  return sortInitiative(tokens.map(rollTokenInitiative));
}

function prepareInitiative(tokens: BattleToken[]): BattleToken[] {
  return sortInitiative(tokens.map((token) => token.initiativeRoll === undefined && token.initiative === 0 ? rollTokenInitiative(token) : token));
}

function initiativeDetails(token: BattleToken): string {
  if (token.initiativeRoll === undefined) return `Ainda não rolada · modificador ${token.baseInitiative >= 0 ? '+' : ''}${token.baseInitiative}`;
  const mode = token.initiativeMode === 'advantage' ? 'Vantagem' : token.initiativeMode === 'disadvantage' ? 'Desvantagem' : 'Normal';
  const dice = token.initiativeRolls?.join(' e ') ?? String(token.initiativeRoll);
  const calculated = token.initiativeRoll + token.baseInitiative;
  const manual = token.initiative !== calculated ? ` · valor manual atual: ${token.initiative}` : '';
  return `${mode}: d20 ${dice} · escolhido ${token.initiativeRoll} ${token.baseInitiative >= 0 ? '+' : '-'} ${Math.abs(token.baseInitiative)} = ${calculated}${manual}`;
}

export function BattleTracker({ open, characters, tokens, onTokensChange, onClose, onStart }: { open: boolean; characters: CharacterEntity[]; tokens: BattleToken[]; onTokensChange: (tokens: BattleToken[]) => void; onClose: () => void; onStart: () => void; }) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  if (!open) return null;
  const assignedIds = new Set(tokens.map((token) => token.characterId));
  const update = (id: string, patch: Partial<BattleToken>) => onTokensChange(tokens.map((token) => token.id === id ? { ...token, ...patch } : token));
  const add = (characterId: string, side: BattleSide) => { const character = characters.find((item) => item.id === characterId); if (character && !assignedIds.has(characterId)) onTokensChange([...tokens, createBattleToken(character, side)]); };
  const duplicate = (token: BattleToken) => { const character = characters.find((item) => item.id === token.characterId); if (character) onTokensChange(duplicateTokenInstance(tokens, token, character)); };
  const drop = (event: DragEvent, side: BattleSide) => { event.preventDefault(); const id = event.dataTransfer.getData('characterId') || draggedId; if (id) add(id, side); setDraggedId(null); };
  const roll = () => onTokensChange(rollInitiative(tokens));
  const start = () => { onTokensChange(prepareInitiative(tokens)); onStart(); onClose(); };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-label="Rastreador de batalha" className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl"><header className="flex items-center justify-between border-b border-zinc-800 p-4"><div><h2 className="flex items-center gap-2 text-lg font-bold text-white"><Swords className="h-5 w-5 text-rose-400" />Rastreador de Batalha</h2><p className="mt-1 text-xs text-zinc-500">Arraste as fichas para um dos lados e role a iniciativa.</p></div><button onClick={onClose} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white"><X className="h-5 w-5" /></button></header><div className="grid flex-1 gap-4 overflow-y-auto p-4 lg:grid-cols-[16rem_1fr_1fr]"><section><h3 className="mb-3 text-xs font-bold uppercase text-zinc-500">Fichas disponíveis</h3><div className="space-y-2">{characters.filter((character) => !assignedIds.has(character.id)).map((character) => <article key={character.id} draggable onDragStart={(event) => { event.dataTransfer.setData('characterId', character.id); setDraggedId(character.id); }} className="flex cursor-grab items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-2 active:cursor-grabbing">{character.avatar ? <img src={character.avatar} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span className="grid h-10 w-10 place-items-center rounded-full bg-zinc-800 text-xs font-bold">{character.name.slice(0,2).toUpperCase()}</span>}<div className="min-w-0"><strong className="block truncate text-xs text-white">{character.name}</strong><span className="text-[10px] uppercase text-zinc-500">{character.type}</span></div></article>)}</div></section>{(['ally','enemy'] as const).map((side) => <section key={side} onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop(event, side)} className={`min-h-80 rounded-xl border-2 border-dashed p-3 ${side === 'ally' ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-rose-500/40 bg-rose-500/5'}`}><h3 className={`mb-3 text-sm font-black uppercase tracking-wider ${side === 'ally' ? 'text-emerald-400' : 'text-rose-400'}`}>{side === 'ally' ? 'Aliados' : 'Inimigos'}</h3><div className="space-y-2">{tokens.filter((token) => token.side === side).map((token) => <div key={token.id} className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/80 p-2">{token.avatar ? <img src={token.avatar} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span className="grid h-10 w-10 place-items-center rounded-full bg-zinc-800 text-xs">{token.name.slice(0,2)}</span>}<span className="min-w-0 flex-1 truncate text-xs font-semibold">{token.name}</span><select aria-label={`Modo de iniciativa de ${token.name}`} value={token.initiativeMode} onChange={(event) => update(token.id, { initiativeMode: event.target.value as InitiativeMode, initiative: 0, initiativeRoll: undefined, initiativeRolls: undefined })} className="h-8 w-24 rounded-md border border-zinc-800 bg-zinc-900 px-2 text-[10px] text-zinc-200 outline-none focus:border-violet-500"><option value="normal">Normal</option><option value="advantage">Vantagem</option><option value="disadvantage">Desvantagem</option></select><input aria-label={`Resultado da iniciativa de ${token.name}`} title={initiativeDetails(token)} type="number" value={token.initiative} onChange={(event) => update(token.id, { initiative: Number(event.target.value) })} className="h-8 w-14 rounded-full border border-zinc-800 bg-zinc-900 px-1 text-center text-xs font-black text-zinc-100 outline-none hover:border-violet-500 focus:border-violet-400" /><button onClick={() => duplicate(token)} aria-label={`Duplicar ${token.name} na batalha`} title="Duplicar token" className="p-1 text-zinc-600 hover:text-sky-400"><Copy className="h-4 w-4" /></button><button onClick={() => onTokensChange(tokens.filter((item) => item.id !== token.id))} aria-label={`Remover ${token.name} da batalha`} className="p-1 text-zinc-600 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button></div>)}</div></section>)}</div><footer className="flex justify-end gap-2 border-t border-zinc-800 p-4"><button onClick={roll} disabled={!tokens.length} className="flex h-10 items-center gap-2 rounded-lg border border-violet-500/30 px-4 text-xs font-bold text-violet-300 disabled:opacity-40"><Dices className="h-4 w-4" />Rolar iniciativa</button><button onClick={start} disabled={!tokens.length} className="flex h-10 items-center gap-2 rounded-lg bg-rose-600 px-4 text-xs font-bold text-white disabled:opacity-40"><Swords className="h-4 w-4" />Iniciar batalha</button></footer></div></div>;
}

export function InitiativeQueue({ tokens, onTokensChange, onEnd }: { tokens: BattleToken[]; onTokensChange: (tokens: BattleToken[]) => void; onEnd: () => void; }) {
  const update = (id: string, patch: Partial<BattleToken>) => onTokensChange(tokens.map((token) => token.id === id ? { ...token, ...patch } : token));
  const addStatus = (token: BattleToken) => { const name = window.prompt('Nome da condição/status:')?.trim(); if (!name) return; const attribute = (window.prompt('Atributo afetado: strength, dexterity, constitution, intelligence, wisdom ou charisma', 'strength') ?? 'strength') as keyof CharacterEntity['attributes']; const modifier = Number(window.prompt('Modificador do atributo:', '0')) || 0; update(token.id, { statuses: [...token.statuses, { id: crypto.randomUUID(), name, attribute, modifier }] }); };
  return <div className="space-y-3"><div className="flex items-center justify-between"><h3 className="text-xs font-bold uppercase text-rose-400">Ordem de Iniciativa</h3><button onClick={onEnd} className="text-[10px] text-zinc-500 hover:text-rose-400">Encerrar</button></div>{tokens.map((token, index) => <article key={token.id} className={`rounded-xl border p-3 ${index === 0 ? 'border-amber-400/50 bg-amber-400/5' : token.side === 'ally' ? 'border-emerald-500/25' : 'border-rose-500/25'}`}><div className="flex items-center gap-2">{token.avatar ? <img src={token.avatar} alt="" className="h-11 w-11 rounded-full object-cover" /> : <span className="grid h-11 w-11 place-items-center rounded-full bg-zinc-800 text-xs">{token.name.slice(0,2)}</span>}<div className="min-w-0 flex-1"><strong className="block truncate text-xs text-white">{token.name}</strong><span className="text-[10px] text-zinc-500">Iniciativa</span></div><input aria-label={`Iniciativa de ${token.name}`} type="number" value={token.initiative} onChange={(e) => update(token.id, { initiative: Number(e.target.value) })} className="w-14 rounded bg-zinc-900 p-1 text-center text-sm font-bold" /></div><div className="mt-3 grid grid-cols-2 gap-2"><label className="flex items-center gap-1 text-[10px] text-zinc-500"><Heart className="h-3 w-3 text-rose-400" /><input type="number" value={token.hp} onChange={(e) => update(token.id,{hp:Number(e.target.value)})} className="w-full rounded bg-zinc-900 p-1 text-white" />/{token.hpMax}</label><label className="flex items-center gap-1 text-[10px] text-zinc-500"><Shield className="h-3 w-3 text-sky-400" /><input type="number" value={token.ca} onChange={(e) => update(token.id,{ca:Number(e.target.value)})} className="w-full rounded bg-zinc-900 p-1 text-white" /></label></div><div className="mt-2 flex flex-wrap gap-1">{token.statuses.map((status) => <button key={status.id} onClick={() => update(token.id,{statuses:token.statuses.filter((item)=>item.id!==status.id)})} title={`${status.attribute} ${status.modifier >= 0 ? '+' : ''}${status.modifier} · clique para remover`} className="rounded bg-violet-500/15 px-2 py-1 text-[9px] text-violet-300">{status.name}</button>)}<button onClick={() => addStatus(token)} className="rounded px-2 py-1 text-[9px] text-zinc-500 hover:bg-zinc-800">+ status</button></div></article>)}</div>;
}
