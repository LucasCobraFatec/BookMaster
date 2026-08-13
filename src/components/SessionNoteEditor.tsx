import { ChevronDown, Plus, Trash2 } from 'lucide-react';

const listSections = ['Recados', 'Recapitulando', 'Local Atual', 'Locais Próximos', 'Locais Prováveis'] as const;
const textSections = [
  { title: 'Introdução', placeholder: 'Escreva a introdução da sessão...', rows: 4 },
  { title: 'Bloco de Notas', placeholder: 'Registre observações, lembretes e detalhes importantes...', rows: 6 },
  { title: 'Notas de Sessão', placeholder: 'Faça anotações à medida que as coisas progridem durante o jogo.', rows: 10 },
] as const;

interface SessionNoteData {
  reviewCharacters: boolean;
  reviewNpcs: boolean;
  lists: Record<(typeof listSections)[number], string[]>;
  texts: Record<(typeof textSections)[number]['title'], string>;
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

function parse(content: string): SessionNoteData {
  const preSession = sectionValue(content, 'Pré-sessão');
  const lists = Object.fromEntries(listSections.map((title) => [title, parseList(sectionValue(content, title))])) as SessionNoteData['lists'];
  const texts = Object.fromEntries(textSections.map(({ title }) => [title, sectionValue(content, title)])) as SessionNoteData['texts'];
  return {
    reviewCharacters: /- \[x\] Revisar os @Personagens/i.test(preSession),
    reviewNpcs: /- \[x\] Revisar os @NPCs/i.test(preSession),
    lists,
    texts,
  };
}

function serialize(data: SessionNoteData) {
  const blocks = [
    `## Pré-sessão\n- [${data.reviewCharacters ? 'x' : ' '}] Revisar os @Personagens\n- [${data.reviewNpcs ? 'x' : ' '}] Revisar os @NPCs`,
    `## Recados\n${serializeList(data.lists.Recados)}`,
    `## Recapitulando\n${serializeList(data.lists.Recapitulando)}`,
    `## Introdução\n${data.texts.Introdução}`,
    `## Local Atual\n${serializeList(data.lists['Local Atual'])}`,
    `## Locais Próximos\n${serializeList(data.lists['Locais Próximos'])}`,
    `## Locais Prováveis\n${serializeList(data.lists['Locais Prováveis'])}`,
    `## Bloco de Notas\n${data.texts['Bloco de Notas']}`,
    `## Notas de Sessão\n${data.texts['Notas de Sessão']}`,
  ];
  return blocks.join('\n');
}

const controlClass = 'w-full rounded-lg border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15';

export function SessionNoteEditor({ content, onChange }: { content: string; onChange: (content: string) => void }) {
  const data = parse(content);
  const update = (next: SessionNoteData) => onChange(serialize(next));
  const updateListItem = (title: (typeof listSections)[number], index: number, value: string) => update({ ...data, lists: { ...data.lists, [title]: data.lists[title].map((item, itemIndex) => itemIndex === index ? value : item) } });
  const addListItem = (title: (typeof listSections)[number]) => update({ ...data, lists: { ...data.lists, [title]: [...data.lists[title], ''] } });
  const deleteListItem = (title: (typeof listSections)[number], index: number) => update({ ...data, lists: { ...data.lists, [title]: data.lists[title].filter((_, itemIndex) => itemIndex !== index) } });

  const renderList = (title: (typeof listSections)[number]) => (
    <details key={title} className="group rounded-xl border border-zinc-800 bg-zinc-900/35">
      <summary className="flex h-11 cursor-pointer list-none items-center gap-2 px-3 text-sm font-semibold text-violet-300 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500">
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-0 -rotate-90" />
        <span className="flex-1">{title}</span>
        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">{data.lists[title].length}</span>
      </summary>
      <div className="space-y-2 border-t border-zinc-800 p-3">
        {data.lists[title].map((item, index) => <div key={index} className="flex items-start gap-2"><textarea rows={2} value={item} onChange={(event) => updateListItem(title, index, event.target.value)} placeholder={`Adicionar em ${title.toLowerCase()}...`} className={controlClass} /><button type="button" onClick={() => deleteListItem(title, index)} aria-label={`Excluir item ${index + 1} de ${title}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-zinc-500 transition hover:bg-rose-500/10 hover:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"><Trash2 className="h-4 w-4" /></button></div>)}
        <button type="button" onClick={() => addListItem(title)} className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-violet-400 transition hover:bg-violet-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"><Plus className="h-3.5 w-3.5" />Adicionar item</button>
      </div>
    </details>
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/35 p-4">
        <h3 className="text-sm font-semibold text-violet-300">Pré-sessão</h3>
        <div className="mt-3 space-y-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50"><input type="checkbox" checked={data.reviewCharacters} onChange={(event) => update({ ...data, reviewCharacters: event.target.checked })} className="h-4 w-4 rounded border-zinc-600 accent-violet-500" /><span className={data.reviewCharacters ? 'text-zinc-500 line-through' : ''}>Revisar os <strong className="text-violet-400">@Personagens</strong></span></label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50"><input type="checkbox" checked={data.reviewNpcs} onChange={(event) => update({ ...data, reviewNpcs: event.target.checked })} className="h-4 w-4 rounded border-zinc-600 accent-violet-500" /><span className={data.reviewNpcs ? 'text-zinc-500 line-through' : ''}>Revisar os <strong className="text-violet-400">@NPCs</strong></span></label>
        </div>
      </section>
      {renderList('Recados')}
      {renderList('Recapitulando')}
      <section><label className="mb-2 block text-sm font-semibold text-violet-300">Introdução</label><textarea rows={4} value={data.texts.Introdução} onChange={(event) => update({ ...data, texts: { ...data.texts, Introdução: event.target.value } })} placeholder="Escreva a introdução da sessão..." className={controlClass} /></section>
      <div><h3 className="mb-3 border-b border-zinc-800 pb-2 text-sm font-bold uppercase tracking-wider text-sky-400">Localizações e Cenas</h3><div className="space-y-3">{renderList('Local Atual')}{renderList('Locais Próximos')}{renderList('Locais Prováveis')}</div></div>
      <section><label className="mb-2 block text-sm font-semibold text-violet-300">Bloco de Notas</label><textarea rows={6} value={data.texts['Bloco de Notas']} onChange={(event) => update({ ...data, texts: { ...data.texts, 'Bloco de Notas': event.target.value } })} placeholder="Registre observações, lembretes e detalhes importantes..." className={controlClass} /></section>
      <section><label className="block text-sm font-semibold text-violet-300">Notas de Sessão</label><p className="mb-2 mt-1 text-xs text-zinc-500">Faça anotações à medida que as coisas progridem durante o jogo.</p><textarea rows={10} value={data.texts['Notas de Sessão']} onChange={(event) => update({ ...data, texts: { ...data.texts, 'Notas de Sessão': event.target.value } })} placeholder="Registre aqui o andamento da sessão..." className={controlClass} /></section>
    </div>
  );
}
