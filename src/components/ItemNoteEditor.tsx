import { ImagePlus, X } from 'lucide-react';
import type { ChangeEvent } from 'react';

const fields = [
  { key: 'lore', title: 'Lore e História', placeholder: 'Conte a origem, a história e a importância deste item...', rows: 7 },
  { key: 'stats', title: 'Estatísticas', placeholder: 'Registre atributos, bônus, dano, alcance, peso, valor, raridade ou requisitos...', rows: 6 },
  { key: 'effects', title: 'Efeitos Mágicos', placeholder: 'Descreva propriedades, poderes, cargas, ativações e efeitos mágicos...', rows: 6 },
  { key: 'curses', title: 'Maldições', placeholder: 'Descreva maldições, custos ocultos, condições e formas de removê-las...', rows: 6 },
  { key: 'ownership', title: 'Posse', placeholder: 'Quem possui ou procura este item? Use [[WikiLinks]] para personagens, NPCs ou locais.', rows: 4 },
] as const;
type FieldKey = (typeof fields)[number]['key'];
interface ItemData { image: string; values: Record<FieldKey, string>; }

function sectionValue(content: string, title: string) {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return content.match(new RegExp(`(?:^|\\n)## ${escaped}\\n([\\s\\S]*?)(?=\\n## |$)`, 'i'))?.[1] ?? '';
}

function parse(content: string): ItemData {
  const image = content.match(/^!\[Imagem do item\]\((data:image\/[A-Za-z+.-]+;base64,[^)]+)\)/)?.[1] ?? '';
  const values = Object.fromEntries(fields.map((field) => [field.key, sectionValue(content, field.title)])) as ItemData['values'];
  return { image, values };
}

function serialize(data: ItemData) {
  return [data.image ? `![Imagem do item](${data.image})` : '', ...fields.map((field) => `## ${field.title}\n${data.values[field.key]}`)].filter(Boolean).join('\n');
}

const controlClass = 'w-full rounded-lg border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15';

export function ItemNoteEditor({ content, onChange }: { content: string; onChange: (content: string) => void }) {
  const data = parse(content);
  const update = (next: ItemData) => onChange(serialize(next));
  const updateField = (key: FieldKey, value: string) => update({ ...data, values: { ...data.values, [key]: value } });
  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' && update({ ...data, image: reader.result });
    reader.readAsDataURL(file);
  };

  return <div className="space-y-6">
    <section>
      <label className="mb-2 block text-sm font-semibold text-emerald-300">Imagem do item</label>
      {data.image ? <div className="group relative overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950"><img src={data.image} alt="Prévia do item" className="max-h-80 w-full object-contain" /><button type="button" onClick={() => update({ ...data, image: '' })} aria-label="Remover imagem do item" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg bg-zinc-950/85 text-zinc-300 opacity-0 backdrop-blur transition hover:text-rose-400 focus:opacity-100 group-hover:opacity-100"><X className="h-4 w-4" /></button></div> : <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 text-zinc-500 transition hover:border-emerald-500/60 hover:bg-emerald-500/5 hover:text-emerald-400"><ImagePlus className="mb-2 h-7 w-7" /><span className="text-xs font-semibold">Selecionar imagem do item</span><span className="mt-1 text-[10px]">PNG, JPG, WEBP ou GIF</span><input type="file" accept="image/*" onChange={uploadImage} className="hidden" /></label>}
    </section>
    {fields.map((field) => <section key={field.key}><label className="mb-2 block text-sm font-semibold text-emerald-300">{field.title}</label><textarea rows={field.rows} value={data.values[field.key]} onChange={(event) => updateField(field.key, event.target.value)} placeholder={field.placeholder} className={controlClass} /></section>)}
  </div>;
}
