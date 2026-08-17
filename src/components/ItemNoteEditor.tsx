import { NoteImageField } from './NoteImageField';

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

  return <div className="space-y-6">
    <NoteImageField image={data.image} title="Imagem do item" alt="Prévia do item" onChange={(image) => update({ ...data, image })} />
    {fields.map((field) => <section key={field.key}><label className="mb-2 block text-sm font-semibold text-emerald-300">{field.title}</label><textarea rows={field.rows} value={data.values[field.key]} onChange={(event) => updateField(field.key, event.target.value)} placeholder={field.placeholder} className={controlClass} /></section>)}
  </div>;
}
