import { Plus, Trash2 } from 'lucide-react';
import { NoteImageField } from './NoteImageField';

const listSections = ['NPCs', 'Combate', 'Encontros Sociais', 'Armadilhas', 'Quebra-Cabeças e Charadas', 'Possíveis Recompensas'] as const;
type ListTitle = (typeof listSections)[number];
interface DungeonRoom { local: string; description: string; challenges: string; }
interface DungeonData { image: string; lore: string; notes: string; rooms: DungeonRoom[]; lists: Record<ListTitle, string[]>; }

function escapeRegex(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function sectionValue(content: string, title: string) { return content.match(new RegExp(`(?:^|\\n)## ${escapeRegex(title)}\\n([\\s\\S]*?)(?=\\n## |$)`, 'i'))?.[1] ?? ''; }
function parseList(value: string) { return value.split(/\n(?=- )/).filter((line) => /^-\s*/.test(line)).map((line) => line.replace(/^-\s*/, '').replace(/\n {2}/g, '\n')); }
function serializeList(items: string[]) { return items.map((item) => `- ${item.replace(/\n/g, '\n  ')}`).join('\n'); }
function decodeRoomValue(value: string) { return value.replace(/\\\|/g, '|').replace(/\\n/g, '\n').replace(/\\\\/g, '\\'); }

function parseRooms(content: string): DungeonRoom[] {
  const section = sectionValue(content, 'Salas da Masmorra');
  const structuredRooms = section.split(/(?:^|\n)### Sala \d+\n/).slice(1).map((room) => {
    const field = (title: string) => room.match(new RegExp(`(?:^|\\n)#### ${title}\\n([\\s\\S]*?)(?=\\n#### |$)`, 'i'))?.[1] ?? '';
    return { local: field('Local'), description: field('Descrição'), challenges: field('Desafios') };
  });
  if (structuredRooms.length) return structuredRooms;

  return section.split('\n').filter((line) => /^- \|/.test(line)).map((line) => {
    const values = line.slice(3).split(/(?<!\\)\|/).map(decodeRoomValue);
    return { local: values[0] ?? '', description: values[1] ?? '', challenges: values[2] ?? '' };
  });
}

function parse(content: string): DungeonData {
  const image = content.match(/^!\[Imagem da masmorra\]\((data:image\/[A-Za-z+.-]+;base64,[^)]+)\)/)?.[1] ?? '';
  const lists = Object.fromEntries(listSections.map((title) => [title, parseList(sectionValue(content, title))])) as DungeonData['lists'];
  return { image, lore: sectionValue(content, 'Lore e História'), notes: sectionValue(content, 'Bloco de Anotações'), rooms: parseRooms(content), lists };
}

function serialize(data: DungeonData) {
  return [
    data.image ? `![Imagem da masmorra](${data.image})` : '',
    `## Lore e História\n${data.lore}`,
    `## NPCs\n${serializeList(data.lists.NPCs)}`,
    `## Salas da Masmorra\n${data.rooms.map((room, index) => `### Sala ${index + 1}\n#### Local\n${room.local}\n#### Descrição\n${room.description}\n#### Desafios\n${room.challenges}`).join('\n')}`,
    '## Encontros',
    ...(['Combate', 'Encontros Sociais', 'Armadilhas', 'Quebra-Cabeças e Charadas'] as ListTitle[]).map((title) => `## ${title}\n${serializeList(data.lists[title])}`),
    `## Bloco de Anotações\n${data.notes}`,
    `## Possíveis Recompensas\n${serializeList(data.lists['Possíveis Recompensas'])}`,
  ].filter(Boolean).join('\n');
}

const controlClass = 'w-full rounded-lg border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15';

export function DungeonNoteEditor({ content, onChange }: { content: string; onChange: (content: string) => void }) {
  const data = parse(content);
  const update = (next: DungeonData) => onChange(serialize(next));
  const addItem = (title: ListTitle) => update({ ...data, lists: { ...data.lists, [title]: [...data.lists[title], ''] } });
  const editItem = (title: ListTitle, index: number, value: string) => update({ ...data, lists: { ...data.lists, [title]: data.lists[title].map((item, itemIndex) => itemIndex === index ? value : item) } });
  const deleteItem = (title: ListTitle, index: number) => update({ ...data, lists: { ...data.lists, [title]: data.lists[title].filter((_, itemIndex) => itemIndex !== index) } });
  const addRoom = () => update({ ...data, rooms: [...data.rooms, { local: '', description: '', challenges: '' }] });
  const updateRoom = (index: number, field: keyof DungeonRoom, value: string) => update({ ...data, rooms: data.rooms.map((room, roomIndex) => roomIndex === index ? { ...room, [field]: value } : room) });
  const deleteRoom = (index: number) => update({ ...data, rooms: data.rooms.filter((_, roomIndex) => roomIndex !== index) });

  const listEditor = (title: ListTitle, placeholder: string) => <section key={title} className="rounded-xl border border-zinc-800 bg-zinc-900/35 p-3"><div className="mb-3 flex items-center justify-between"><h4 className="text-sm font-semibold text-sky-300">{title}</h4><span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">{data.lists[title].length}</span></div><div className="space-y-2">{data.lists[title].map((item, index) => <div key={index} className="flex items-start gap-2"><textarea rows={2} value={item} onChange={(event) => editItem(title, index, event.target.value)} placeholder={placeholder} className={controlClass} /><button type="button" onClick={() => deleteItem(title, index)} aria-label={`Excluir item ${index + 1} de ${title}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button></div>)}</div><button type="button" onClick={() => addItem(title)} className="mt-2 flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-sky-400 hover:bg-sky-500/10"><Plus className="h-3.5 w-3.5" />Adicionar</button></section>;

  return <div className="space-y-6">
    <NoteImageField image={data.image} title="Imagem da masmorra" alt="Prévia da masmorra" onChange={(image) => update({ ...data, image })} />
    <section><label className="mb-2 block text-sm font-semibold text-sky-300">Lore e História</label><textarea rows={8} value={data.lore} onChange={(event) => update({ ...data, lore: event.target.value })} placeholder="Conte a história, origem e propósito desta masmorra..." className={controlClass} /></section>
    {listEditor('NPCs', 'Nome ou [[WikiLink]] do NPC...')}
    <section><div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-2"><h3 className="text-sm font-bold uppercase tracking-wider text-sky-400">Salas da Masmorra</h3><span className="text-[10px] text-zinc-500">{data.rooms.length} salas</span></div><div className="space-y-3">{data.rooms.map((room, index) => <article key={index} className="rounded-xl border border-zinc-800 bg-zinc-900/35 p-4"><div className="mb-3 flex items-center justify-between"><h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Sala {index + 1}</h4><button type="button" onClick={() => deleteRoom(index)} aria-label={`Excluir sala ${index + 1}`} className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button></div><div className="space-y-3"><label className="block text-xs text-zinc-400">Local<input value={room.local} onChange={(event) => updateRoom(index, 'local', event.target.value)} placeholder="Nome ou posição da sala..." className={`mt-1 ${controlClass}`} /></label><label className="block text-xs text-zinc-400">Descrição<textarea rows={3} value={room.description} onChange={(event) => updateRoom(index, 'description', event.target.value)} placeholder="Descreva o ambiente..." className={`mt-1 ${controlClass}`} /></label><label className="block text-xs text-zinc-400">Desafios<textarea rows={3} value={room.challenges} onChange={(event) => updateRoom(index, 'challenges', event.target.value)} placeholder="Inimigos, obstáculos, armadilhas ou enigmas..." className={`mt-1 ${controlClass}`} /></label></div></article>)}</div><button type="button" onClick={addRoom} className="mt-3 flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-sky-400 hover:bg-sky-500/10"><Plus className="h-3.5 w-3.5" />Adicionar sala</button></section>
    <div><h3 className="mb-3 border-b border-zinc-800 pb-2 text-sm font-bold uppercase tracking-wider text-sky-400">Encontros</h3><div className="grid gap-3 md:grid-cols-2">{listEditor('Combate', 'Descreva um possível combate...')}{listEditor('Encontros Sociais', 'Descreva um encontro social...')}{listEditor('Armadilhas', 'Descreva uma armadilha...')}{listEditor('Quebra-Cabeças e Charadas', 'Descreva um desafio...')}</div></div>
    <section><label className="mb-2 block text-sm font-semibold text-sky-300">Bloco de Anotações</label><textarea rows={7} value={data.notes} onChange={(event) => update({ ...data, notes: event.target.value })} placeholder="Adicione observações sobre a masmorra..." className={controlClass} /></section>
    {listEditor('Possíveis Recompensas', 'Adicione uma possível recompensa...')}
  </div>;
}
