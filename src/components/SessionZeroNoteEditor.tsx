const fields = [
  { key: 'theme', title: 'Tema central da campanha', placeholder: 'Resuma em uma frase o que define e move sua campanha', rows: 2 },
  { key: 'villains', title: 'Vilões', placeholder: 'Quem ou quais são os três principais impulsionadores desta campanha? Geralmente, esses são vilões. Você não quer compartilhar isso com seus jogadores. Em vez disso, crie uma carta de vilão para cada vilão. Adicione uma meta principal para cada vilão e três submetas que os levam a essa meta.', rows: 5 },
  { key: 'characters', title: 'Opções de personagem e regras da casa', placeholder: 'Quais são as especificidades da criação de personagens para este mundo? Quais são os limites de construção de personagem neste mundo? Quais regras da casa estão em jogo?', rows: 4 },
  { key: 'factions', title: 'Patronos e Facções', placeholder: 'Quem são os patronos e facções dos quais os personagens podem fazer parte? O que une os personagens para a aventura nesta campanha?', rows: 4 },
  { key: 'safety', title: 'Ferramentas de Segurança', placeholder: 'Discuta quais ferramentas de segurança você e seus jogadores se sentem confortáveis em usar durante esta campanha. Discuta todos os tópicos delicados a serem evitados.', rows: 4 },
  { key: 'inspirations', title: 'Inspirações para a Campanha', placeholder: 'Que livros, obras de arte, música, filmes e programas de TV inspiram sua campanha? Compartilhe-os com seus jogadores e use-os quando precisar de inspiração.', rows: 4 },
] as const;

const truthTitle = 'Seis verdades sobre a campanha';
const truthHelp = 'Quais são as seis coisas mais importantes que você deseja que seus jogadores entendam sobre o mundo e a campanha?';

function sectionValue(content: string, title: string) {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return content.match(new RegExp(`(?:^|\\n)## ${escaped}\\n([\\s\\S]*?)(?=\\n## |$)`, 'i'))?.[1] ?? '';
}

function parse(content: string) {
  const values = Object.fromEntries(fields.map((field) => [field.key, sectionValue(content, field.title)])) as Record<(typeof fields)[number]['key'], string>;
  const truths = sectionValue(content, truthTitle).split(/\n(?=- )/).filter((line) => /^-\s*/.test(line)).map((line) => line.replace(/^-\s*/, '').replace(/\n {2}/g, '\n')).slice(0, 6);
  return { values, truths: [...truths, ...Array(6 - truths.length).fill('')] };
}

function serialize(values: Record<string, string>, truths: string[]) {
  const blocks = [`## ${fields[0].title}\n${values.theme}`, `## ${truthTitle}\n${truths.map((truth) => `- ${truth.replace(/\n/g, '\n  ')}`).join('\n')}`];
  fields.slice(1).forEach((field) => blocks.push(`## ${field.title}\n${values[field.key]}`));
  return blocks.join('\n');
}

export function SessionZeroNoteEditor({ content, onChange }: { content: string; onChange: (content: string) => void }) {
  const { values, truths } = parse(content);
  const updateField = (key: string, value: string) => onChange(serialize({ ...values, [key]: value }, truths));
  const updateTruth = (index: number, value: string) => onChange(serialize(values, truths.map((truth, truthIndex) => truthIndex === index ? value : truth)));
  const inputClass = 'w-full rounded-lg border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15';

  return (
    <div className="space-y-6">
      <section><label className="mb-2 block text-sm font-semibold text-violet-300">{fields[0].title}</label><textarea rows={fields[0].rows} value={values.theme} onChange={(event) => updateField('theme', event.target.value)} placeholder={fields[0].placeholder} className={inputClass} /></section>
      <section>
        <label className="block text-sm font-semibold text-violet-300">{truthTitle}</label>
        <p className="mb-3 mt-1 text-xs leading-5 text-zinc-500">{truthHelp}</p>
        <div className="space-y-2">{truths.map((truth, index) => <div key={index} className="flex items-start gap-2"><span className="mt-2 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-violet-500/10 text-[10px] font-bold text-violet-400">{index + 1}</span><textarea rows={2} value={truth} onChange={(event) => updateTruth(index, event.target.value)} placeholder={`Verdade ${index + 1}`} className={inputClass} /></div>)}</div>
      </section>
      {fields.slice(1).map((field) => <section key={field.key}><label className="mb-2 block text-sm font-semibold text-violet-300">{field.title}</label><textarea rows={field.rows} value={values[field.key]} onChange={(event) => updateField(field.key, event.target.value)} placeholder={field.placeholder} className={inputClass} /></section>)}
    </div>
  );
}
