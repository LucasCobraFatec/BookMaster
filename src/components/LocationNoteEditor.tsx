import { ImagePlus, Plus, Trash2, X } from 'lucide-react';
import type { ChangeEvent } from 'react';

const listSections = ['NPCs', 'Combate', 'Encontros Sociais', 'Armadilhas', 'Quebra-Cabeças e Charadas', 'Possíveis Recompensas'] as const;
type ListTitle = (typeof listSections)[number];

interface LocationData {
  image: string;
  lore: string;
  notes: string;
  lists: Record<ListTitle, string[]>;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sectionValue(content: string, title: string) {
  return content.match(new RegExp(`(?:^|\\n)## ${escapeRegex(title)}\\n([\\s\\S]*?)(?=\\n## |$)`, 'i'))?.[1] ?? '';
}

function parseList(value: string) {
  return value.split(/\n(?=- )/).filter((line) => /^-\s*/.test(line)).map((line) => line.replace(/^-\s*/, '').replace(/\n {2}/g, '\n'));
}

function serializeList(items: string[]) {
  return items.map((item) => `- ${item.replace(/\n/g, '\n  ')}`).join('\n');
}

function parse(content: string): LocationData {
  const image = content.match(/^!\[Imagem do local\]\((data:image\/[A-Za-z+.-]+;base64,[^)]+)\)/)?.[1] ?? '';
  const lists = Object.fromEntries(listSections.map((title) => [title, parseList(sectionValue(content, title))])) as LocationData['lists'];
  return { image, lore: sectionValue(content, 'Lore e História'), notes: sectionValue(content, 'Bloco de Anotações'), lists };
}

function serialize(data: LocationData) {
  return [
    data.image ? `![Imagem do local](${data.image})` : '',
    `## Lore e História\n${data.lore}`,
    `## NPCs\n${serializeList(data.lists.NPCs)}`,
    '## Encontros',
    ...(['Combate', 'Encontros Sociais', 'Armadilhas', 'Quebra-Cabeças e Charadas'] as ListTitle[]).map((title) => `## ${title}\n${serializeList(data.lists[title])}`),
    `## Bloco de Anotações\n${data.notes}`,
    `## Possíveis Recompensas\n${serializeList(data.lists['Possíveis Recompensas'])}`,
  ].filter(Boolean).join('\n');
}

const controlClass = 'w-full rounded-lg border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15';

export function LocationNoteEditor({ content, onChange }: { content: string; onChange: (content: string) => void }) {
  const data = parse(content);
  const update = (next: LocationData) => onChange(serialize(next));
  const addItem = (title: ListTitle) => update({ ...data, lists: { ...data.lists, [title]: [...data.lists[title], ''] } });
  const editItem = (title: ListTitle, index: number, value: string) => update({ ...data, lists: { ...data.lists, [title]: data.lists[title].map((item, itemIndex) => itemIndex === index ? value : item) } });
  const deleteItem = (title: ListTitle, index: number) => update({ ...data, lists: { ...data.lists, [title]: data.lists[title].filter((_, itemIndex) => itemIndex !== index) } });
  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' && update({ ...data, image: reader.result });
    reader.readAsDataURL(file);
  };

  const listEditor = (title: ListTitle, placeholder: string) => (
    <section key={title} className="rounded-xl border border-zinc-800 bg-zinc-900/35 p-3">
      <div className="mb-3 flex items-center justify-between"><h4 className="text-sm font-semibold text-sky-300">{title}</h4><span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">{data.lists[title].length}</span></div>
      <div className="space-y-2">{data.lists[title].map((item, index) => <div key={index} className="flex items-start gap-2"><textarea rows={2} value={item} onChange={(event) => editItem(title, index, event.target.value)} placeholder={placeholder} className={controlClass} /><button type="button" onClick={() => deleteItem(title, index)} aria-label={`Excluir item ${index + 1} de ${title}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"><Trash2 className="h-4 w-4" /></button></div>)}</div>
      <button type="button" onClick={() => addItem(title)} className="mt-2 flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-sky-400 hover:bg-sky-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"><Plus className="h-3.5 w-3.5" />Adicionar</button>
    </section>
  );

  return <div className="space-y-6">
    <section><label className="mb-2 block text-sm font-semibold text-sky-300">Imagem do local</label>{data.image ? <div className="group relative overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950"><img src={data.image} alt="Prévia do local" className="max-h-80 w-full object-contain" /><button type="button" onClick={() => update({ ...data, image: '' })} aria-label="Remover imagem" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg bg-zinc-950/85 text-zinc-300 opacity-0 backdrop-blur transition hover:text-rose-400 focus:opacity-100 group-hover:opacity-100"><X className="h-4 w-4" /></button></div> : <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 text-zinc-500 transition hover:border-sky-500/60 hover:bg-sky-500/5 hover:text-sky-400"><ImagePlus className="mb-2 h-7 w-7" /><span className="text-xs font-semibold">Selecionar imagem</span><span className="mt-1 text-[10px]">PNG, JPG, WEBP ou GIF</span><input type="file" accept="image/*" onChange={uploadImage} className="hidden" /></label>}</section>
    <section><label className="mb-2 block text-sm font-semibold text-sky-300">Lore e História</label><textarea rows={8} value={data.lore} onChange={(event) => update({ ...data, lore: event.target.value })} placeholder="Conte a história, origem e importância deste local..." className={controlClass} /></section>
    {listEditor('NPCs', 'Nome ou [[WikiLink]] do NPC...')}
    <div><h3 className="mb-3 border-b border-zinc-800 pb-2 text-sm font-bold uppercase tracking-wider text-sky-400">Encontros</h3><div className="grid gap-3 md:grid-cols-2">{listEditor('Combate', 'Descreva um possível combate...')}{listEditor('Encontros Sociais', 'Descreva um encontro social...')}{listEditor('Armadilhas', 'Descreva uma armadilha...')}{listEditor('Quebra-Cabeças e Charadas', 'Descreva um desafio...')}</div></div>
    <section><label className="mb-2 block text-sm font-semibold text-sky-300">Bloco de Anotações</label><textarea rows={7} value={data.notes} onChange={(event) => update({ ...data, notes: event.target.value })} placeholder="Adicione observações sobre o local..." className={controlClass} /></section>
    {listEditor('Possíveis Recompensas', 'Adicione uma possível recompensa...')}
  </div>;
}
