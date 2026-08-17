import { ImagePlus, MapPin, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState, type MouseEvent } from 'react';
import type { NoteEntity } from '../types/rpg.types';
import type { CharacterEntity } from '../types/rpg.types';
import { MarkdownParser } from './MarkdownParser';
import { ImageCropper } from './ImageCropper';

interface MapPinData { id: string; x: number; y: number; noteId: string; label: string; }
interface MapData { image: string; lore: string; notes: string; interests: string[]; pins: MapPinData[]; }

function sectionValue(content: string, title: string) {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return content.match(new RegExp(`(?:^|\\n)## ${escaped}\\n([\\s\\S]*?)(?=\\n## |\\n<!-- MAP_PINS:|$)`, 'i'))?.[1] ?? '';
}
function parseList(value: string) { return value.split(/\n(?=- )/).filter((line) => /^-\s*/.test(line)).map((line) => line.replace(/^-\s*/, '').replace(/\n {2}/g, '\n')); }
function serializeList(items: string[]) { return items.map((item) => `- ${item.replace(/\n/g, '\n  ')}`).join('\n'); }
function parse(content: string): MapData {
  const image = content.match(/^!\[Imagem do mapa\]\((data:image\/[A-Za-z+.-]+;base64,[^)]+)\)/)?.[1] ?? '';
  const encodedPins = content.match(/<!-- MAP_PINS:([A-Za-z0-9+/=]+) -->/)?.[1];
  let pins: MapPinData[];
  try { pins = encodedPins ? JSON.parse(decodeURIComponent(escape(atob(encodedPins)))) : []; } catch { pins = []; }
  return { image, lore: sectionValue(content, 'Lore e História'), interests: parseList(sectionValue(content, 'Pontos de Interesse')), notes: sectionValue(content, 'Bloco de Anotações'), pins };
}
function serialize(data: MapData) {
  const pins = btoa(unescape(encodeURIComponent(JSON.stringify(data.pins))));
  return [data.image ? `![Imagem do mapa](${data.image})` : '', `## Lore e História\n${data.lore}`, `## Pontos de Interesse\n${serializeList(data.interests)}`, `## Bloco de Anotações\n${data.notes}`, `<!-- MAP_PINS:${pins} -->`].filter(Boolean).join('\n');
}
const controlClass = 'w-full rounded-lg border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15';

export function MapNoteEditor({ content, notes, onChange }: { content: string; notes: NoteEntity[]; onChange: (value: string) => void }) {
  const data = parse(content);
  const targets = notes.filter((note) => note.properties.sidebarCategory === 'locations' || note.properties.sidebarCategory === 'dungeons');
  const [targetId, setTargetId] = useState('');
  const [placing, setPlacing] = useState(false);
  const update = (next: MapData) => onChange(serialize(next));
  const placePin = (event: MouseEvent<HTMLDivElement>) => {
    if (!placing || !targetId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const target = targets.find((note) => note.id === targetId);
    if (!target) return;
    update({ ...data, pins: [...data.pins, { id: crypto.randomUUID(), x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100, noteId: target.id, label: target.title }] });
    setPlacing(false);
  };

  return <div className="space-y-6">
    <section><label className="mb-2 block text-sm font-semibold text-sky-300">Imagem do mapa</label>{data.image ? <><div onClick={placePin} className={`relative aspect-video overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 ${placing ? 'cursor-crosshair ring-2 ring-sky-500' : ''}`}><img src={data.image} alt="Mapa" className="h-full w-full object-contain" />{data.pins.map((pin) => <div key={pin.id} style={{ left: `${pin.x}%`, top: `${pin.y}%` }} className="group absolute -translate-x-1/2 -translate-y-full"><MapPin className="h-7 w-7 fill-rose-500 text-white drop-shadow-lg" /><span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-zinc-950 px-2 py-1 text-[10px] text-white group-hover:block">{pin.label}</span></div>)}</div><div className="mt-3 flex flex-wrap gap-2"><select value={targetId} onChange={(event) => setTargetId(event.target.value)} className="h-10 min-w-48 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-xs text-white"><option value="">Escolha uma localização ou masmorra</option>{targets.map((note) => <option key={note.id} value={note.id}>{note.title}</option>)}</select><button type="button" disabled={!targetId} onClick={() => setPlacing(true)} className="flex h-10 items-center gap-2 rounded-lg bg-sky-600 px-4 text-xs font-semibold text-white disabled:opacity-40"><MapPin className="h-4 w-4" />{placing ? 'Clique no mapa' : 'Adicionar pin'}</button><ImageCropper aspect={16 / 9} label="Trocar e ajustar mapa" onApply={(image) => update({ ...data, image, pins: [] })} className="flex h-10 items-center gap-2 rounded-lg border border-violet-500/30 px-3 text-xs font-bold text-violet-300"><Pencil className="h-4 w-4" />Reajustar</ImageCropper><button type="button" onClick={() => update({ ...data, image: '', pins: [] })} aria-label="Remover mapa" className="grid h-10 w-10 place-items-center rounded-lg border border-rose-500/20 text-rose-400"><X className="h-4 w-4" /></button></div><div className="mt-2 space-y-1">{data.pins.map((pin) => <div key={pin.id} className="flex h-8 items-center rounded-lg bg-zinc-900/50 px-2 text-xs text-zinc-300"><MapPin className="mr-2 h-3.5 w-3.5 text-rose-400" /><span className="flex-1">{pin.label}</span><button type="button" onClick={() => update({ ...data, pins: data.pins.filter((item) => item.id !== pin.id) })} aria-label={`Excluir pin ${pin.label}`} className="p-1 text-zinc-500 hover:text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button></div>)}</div></> : <ImageCropper aspect={16 / 9} label="Selecionar imagem do mapa" onApply={(image) => update({ ...data, image })} className="flex min-h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 text-zinc-500 hover:border-sky-500 hover:text-sky-400"><ImagePlus className="mb-2 h-7 w-7" /><span className="text-xs font-semibold">Selecionar imagem do mapa</span><span className="mt-1 text-[10px]">Depois ajuste zoom e posição</span></ImageCropper>}</section>
    <section><label className="mb-2 block text-sm font-semibold text-sky-300">Lore e História</label><textarea rows={7} value={data.lore} onChange={(event) => update({ ...data, lore: event.target.value })} placeholder="Descreva a história e o contexto do mapa..." className={controlClass} /></section>
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/35 p-3"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-sky-300">Pontos de Interesse</h3><span className="text-[10px] text-zinc-500">{data.interests.length}</span></div><div className="space-y-2">{data.interests.map((item, index) => <div key={index} className="flex items-start gap-2"><textarea rows={2} value={item} onChange={(event) => update({ ...data, interests: data.interests.map((current, itemIndex) => itemIndex === index ? event.target.value : current) })} className={controlClass} /><button type="button" onClick={() => update({ ...data, interests: data.interests.filter((_, itemIndex) => itemIndex !== index) })} className="grid h-10 w-10 place-items-center text-zinc-500 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button></div>)}</div><button type="button" onClick={() => update({ ...data, interests: [...data.interests, ''] })} className="mt-2 flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-sky-400 hover:bg-sky-500/10"><Plus className="h-3.5 w-3.5" />Adicionar ponto</button></section>
    <section><label className="mb-2 block text-sm font-semibold text-sky-300">Bloco de Anotações</label><textarea rows={8} value={data.notes} onChange={(event) => update({ ...data, notes: event.target.value })} placeholder="Adicione observações sobre o mapa..." className={controlClass} /></section>
  </div>;
}

export function MapNoteViewer({ content, notes, characters, onSelectNote, onLinkClick }: { content: string; notes: NoteEntity[]; characters: CharacterEntity[]; onSelectNote: (note: NoteEntity) => void; onLinkClick: (title: string) => void }) {
  const data = parse(content);
  const linkedText = (value: string, empty: string) => value ? <MarkdownParser content={value} existingNotes={notes} existingCharacters={characters} onLinkClick={onLinkClick} /> : <p className="text-sm text-zinc-500">{empty}</p>;
  return <div className="space-y-6">{data.image && <div className="relative overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950"><img src={data.image} alt="Mapa" className="w-full object-contain" />{data.pins.map((pin) => <button key={pin.id} type="button" style={{ left: `${pin.x}%`, top: `${pin.y}%` }} onClick={() => { const note = notes.find((item) => item.id === pin.noteId); if (note) onSelectNote(note); }} aria-label={`Abrir ${pin.label}`} className="group absolute -translate-x-1/2 -translate-y-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"><MapPin className="h-8 w-8 fill-rose-500 text-white drop-shadow-lg transition group-hover:-translate-y-1" /><span className="absolute left-1/2 top-full z-10 mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-zinc-950 px-2 py-1 text-[10px] text-white group-hover:block group-focus:block">{pin.label}</span></button>)}</div>}<section><h2 className="mb-2 text-sm font-semibold text-sky-300">Lore e História</h2>{linkedText(data.lore, 'Nenhuma lore registrada.')}</section><section><h2 className="mb-2 text-sm font-semibold text-sky-300">Pontos de Interesse</h2><ul className="space-y-2">{data.interests.map((item, index) => <li key={index} className="rounded-lg bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300">{linkedText(item, 'Ponto sem descrição.')}</li>)}</ul></section><section><h2 className="mb-2 text-sm font-semibold text-sky-300">Bloco de Anotações</h2>{linkedText(data.notes, 'Nenhuma anotação.')}</section></div>;
}
