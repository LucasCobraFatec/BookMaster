import type { CharacterEntity, NoteEntity } from '../types/rpg.types';
import { FormattedText } from './FormattedText';

export interface CharacterLinkContext {
  existingNotes: NoteEntity[];
  existingCharacters: CharacterEntity[];
  onWikiLinkClick: (target: string) => void;
}

export function CharacterLinkedText({ value, label, context, className = '' }: { value: string; label: string; context: CharacterLinkContext; className?: string }) {
  return <div className={`min-h-10 whitespace-pre-wrap rounded-lg border border-zinc-800/70 bg-zinc-900/30 px-3 py-2 text-sm leading-6 ${className}`}><FormattedText text={value || '—'} existingNotes={context.existingNotes} existingCharacters={context.existingCharacters} onLinkClick={context.onWikiLinkClick} lineKey={label} /></div>;
}

function linkedValues(value: unknown, path = ''): Array<{ path: string; value: string }> {
  if (typeof value === 'string') return value.includes('[[') ? [{ path, value }] : [];
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => linkedValues(child, path ? `${path}.${key}` : key));
}

export function CharacterWikiLinksPanel({ character, context, light = false }: { character: CharacterEntity; context: CharacterLinkContext; light?: boolean }) {
  const values = linkedValues(character).filter((item) => item.path !== 'avatar');
  if (!values.length) return null;
  return <section className={`mt-6 rounded-xl border p-4 ${light ? 'border-[#b99b82] bg-[#fff8e8]' : 'border-violet-500/25 bg-violet-500/5'}`}><h3 className={`text-xs font-black uppercase tracking-wider ${light ? 'text-[#8b2d24]' : 'text-violet-300'}`}>WikiLinks encontrados na ficha</h3><p className={`mt-1 text-[10px] ${light ? 'text-[#805b52]' : 'text-zinc-500'}`}>Todos os links abaixo são clicáveis, inclusive os usados em ataques, magias e campos curtos.</p><div className="mt-3 space-y-2">{values.map((item, index) => <div key={`${item.path}-${index}`} className="grid gap-1 sm:grid-cols-[11rem_1fr]"><span className={`truncate text-[9px] font-bold uppercase ${light ? 'text-[#805b52]' : 'text-zinc-600'}`} title={item.path}>{item.path}</span><div className="whitespace-pre-wrap text-sm"><FormattedText text={item.value} existingNotes={context.existingNotes} existingCharacters={context.existingCharacters} onLinkClick={context.onWikiLinkClick} lineKey={`sheet-link-${item.path}-${index}`} /></div></div>)}</div></section>;
}
