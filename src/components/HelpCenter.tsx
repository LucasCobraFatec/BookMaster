import { Check, Copy, HelpCircle, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

interface HelpBlock { title: string; paragraphs: string[]; steps?: string[]; code?: string; codeLabel?: string; }
interface HelpSection { id: string; title: string; summary: string; blocks: HelpBlock[]; }

const tableJson = `[
  {
    "name": "Encontros na Floresta",
    "formula": "1d6",
    "results": [
      { "range": [1, 2], "text": "Patrulha de [[Goblin]]", "weight": 2 },
      { "range": [3, 5], "text": "Um viajante oferece informações", "weight": 3 },
      { "range": [6, 6], "text": "Ruínas cobertas por névoa", "weight": 1 },
      { "range": [7, 7], "text": "Resultado desativado", "weight": 1, "locked": true }
    ]
  }
]`;

const tableCsv = `tableName,formula,min,max,weight,locked,text
"Encontros","1d6","1","2","2","false","Patrulha de Goblins"
"Encontros","1d6","3","5","3","false","Viajante perdido"
"Encontros","1d6","6","6","1","false","Ruínas antigas"`;

const tableText = `# Peso | resultado
3 | Moedas antigas
2 | Poção de cura
1 | [[Item: Espada da Aurora]]
Encontro sem peso informado`;

const characterJson = `{
  "name": "Goblin Batedor",
  "type": "monster",
  "hp": 18,
  "hpMax": 18,
  "hpTemp": 0,
  "ca": 15,
  "initiative": 2,
  "speed": "9 metros",
  "alignment": "Neutro e Mau",
  "languages": "Comum, Goblin",
  "challengeRating": "1/2",
  "attributes": {
    "strength": 8,
    "dexterity": 14,
    "constitution": 10,
    "intelligence": 10,
    "wisdom": 8,
    "charisma": 8
  },
  "skills": "Furtividade +6, Percepção +1",
  "senses": "Visão no escuro 18 m, Percepção passiva 11",
  "resistances": "",
  "immunities": "",
  "features": "Escapada Ágil. Pode usar Desengajar ou Esconder como ação bônus.",
  "actions": "Cimitarra. +4 para atingir, dano 1d6 + 2 cortante.",
  "bonusActions": "Desengajar ou Esconder.",
  "reactions": "",
  "biography": "Um batedor enviado para vigiar as estradas.",
  "equipment": "Cimitarra, arco curto e armadura de couro."
}`;

const playerJson = `{
  "name": "Lia Valente",
  "type": "pc",
  "playerName": "Marina",
  "class": "Guerreira",
  "subclass": "Campeã",
  "level": 3,
  "species": "Humana",
  "background": "Soldado",
  "alignment": "Neutro e Bom",
  "hp": 28,
  "hpMax": 28,
  "hpTemp": 0,
  "ca": 17,
  "initiative": 2,
  "speed": "9 metros",
  "proficiencyBonus": 2,
  "xp": 900,
  "attributes": {
    "strength": 16,
    "dexterity": 14,
    "constitution": 15,
    "intelligence": 10,
    "wisdom": 12,
    "charisma": 8
  },
  "biography": "Veterana da guarda de [[Porto Cinzento]].",
  "languages": "Comum, Anão",
  "feats": "Sentinela",
  "equipment": "Espada longa, escudo, cota de malha, mochila de explorador.",
  "playerSheet": {
    "version": 1,
    "shield": true,
    "armorBase": 15,
    "armorDexCap": 2,
    "hitDie": 10,
    "initiativeAdjustment": 0,
    "size": "Médio",
    "passivePerception": 13,
    "hitDiceSpent": 0,
    "hitDiceMax": 3,
    "deathSuccesses": [false, false, false],
    "deathFailures": [false, false, false],
    "skills": {
      "Força:Salvaguarda": { "trained": true, "bonus": 0 },
      "Força:Atletismo": { "trained": true, "bonus": 0 },
      "Destreza:Salvaguarda": { "trained": false, "bonus": 0 },
      "Destreza:Acrobacia": { "trained": false, "bonus": 0 },
      "Destreza:Furtividade": { "trained": false, "bonus": 0 },
      "Destreza:Prestidigitação": { "trained": false, "bonus": 0 },
      "Constituição:Salvaguarda": { "trained": true, "bonus": 0 },
      "Inteligência:Salvaguarda": { "trained": false, "bonus": 0 },
      "Inteligência:Arcanismo": { "trained": false, "bonus": 0 },
      "Inteligência:História": { "trained": true, "bonus": 0 },
      "Inteligência:Investigação": { "trained": false, "bonus": 0 },
      "Inteligência:Natureza": { "trained": false, "bonus": 0 },
      "Inteligência:Religião": { "trained": false, "bonus": 0 },
      "Sabedoria:Salvaguarda": { "trained": false, "bonus": 0 },
      "Sabedoria:Lidar com Animais": { "trained": false, "bonus": 0 },
      "Sabedoria:Intuição": { "trained": true, "bonus": 0 },
      "Sabedoria:Medicina": { "trained": false, "bonus": 0 },
      "Sabedoria:Percepção": { "trained": true, "bonus": 0 },
      "Sabedoria:Sobrevivência": { "trained": false, "bonus": 0 },
      "Carisma:Salvaguarda": { "trained": false, "bonus": 0 },
      "Carisma:Atuação": { "trained": false, "bonus": 0 },
      "Carisma:Enganação": { "trained": false, "bonus": 0 },
      "Carisma:Intimidação": { "trained": true, "bonus": 0 },
      "Carisma:Persuasão": { "trained": false, "bonus": 0 }
    },
    "armorTraining": {
      "light": true,
      "medium": true,
      "heavy": true,
      "shields": true
    },
    "weaponsTraining": "Armas simples e marciais",
    "toolsTraining": "Veículos terrestres, jogo de cartas",
    "classFeatures": "Retomar o Fôlego; Surto de Ação; Crítico Aprimorado",
    "speciesTraits": "Versátil; um talento adicional; um idioma adicional",
    "attacks": [
      {
        "id": "ataque-espada",
        "name": "Espada longa",
        "bonus": "+5",
        "damage": "1d8 + 3 cortante",
        "notes": "Versátil: 1d10 + 3"
      },
      {
        "id": "ataque-arco",
        "name": "Arco longo",
        "bonus": "+4",
        "damage": "1d8 + 2 perfurante",
        "notes": "Alcance 45/180 m"
      }
    ],
    "spellcastingAbility": "",
    "spellcastingModifier": 0,
    "spellSaveDc": 0,
    "spellAttackBonus": 0,
    "spellSlots": [
      { "level": 1, "max": 0, "spent": [] },
      { "level": 2, "max": 0, "spent": [] },
      { "level": 3, "max": 0, "spent": [] },
      { "level": 4, "max": 0, "spent": [] },
      { "level": 5, "max": 0, "spent": [] },
      { "level": 6, "max": 0, "spent": [] },
      { "level": 7, "max": 0, "spent": [] },
      { "level": 8, "max": 0, "spent": [] },
      { "level": 9, "max": 0, "spent": [] }
    ],
    "spells": [],
    "personality": "Corajosa e protetora; nunca abandona um aliado.",
    "coins": { "cp": 5, "sp": 12, "gp": 85, "pp": 0 }
  }
}`;

const sections: HelpSection[] = [
  { id: 'inicio', title: 'Primeiros passos e campanhas', summary: 'Organize uma campanha e navegue pelas pastas.', blocks: [
    { title: 'Campanha ativa', paragraphs: ['Use o seletor no topo do menu lateral para trocar de campanha. Notas, tabelas e fichas pertencem à campanha selecionada.'], steps: ['Clique em + para criar uma campanha e informe um nome.', 'Abra as pastas por assunto e use o + de cada pasta para criar conteúdo.', 'Clique em um item para abrir; os ícones ao lado permitem duplicar fichas ou excluir itens.'] },
    { title: 'Backup e restauração', paragraphs: ['Use Exportar backup para salvar toda a campanha ativa em um arquivo JSON. O arquivo inclui notas, WikiLinks, fichas, imagens incorporadas, tabelas, sessões e registros. Em uma nova versão do BookMaster, clique em Importar backup e selecione esse arquivo. A restauração cria uma nova campanha e não sobrescreve dados existentes.'], steps: ['Selecione a campanha que deseja proteger.', 'Clique em Exportar backup e guarde o JSON em local seguro.', 'Na outra instalação, clique em Importar backup e escolha o arquivo.', 'Confira a campanha com o nome “(Restaurada)” no seletor.'] },
    { title: 'Tipos de conteúdo', paragraphs: ['O Grimório reúne preparação de campanha, sessões, história, locais, masmorras, mapas e itens. Fichas & Bestiário reúne jogadores, NPCs, monstros e vilões. Tabelas de Rolagem guarda sorteios reutilizáveis.'] },
  ]},
  { id: 'notas', title: 'Notas, mapas e sessões', summary: 'Registre a aventura com formulários estruturados.', blocks: [
    { title: 'Editar e salvar', paragraphs: ['Abra uma nota, clique em editar, preencha os setores e salve. Alguns tipos possuem formulários próprios para manter as informações organizadas.'], steps: ['Sessão zero: tema, verdades, personagens, facções e ferramentas de segurança.', 'Sessão: recados, recapitulando, locais, introdução e bloco de notas.', 'Locais, masmorras e itens: use os campos especializados e WikiLinks.', 'Mapas: carregue uma imagem, adicione marcadores e vincule-os a notas.'] },
    { title: 'Texto formatado', paragraphs: ['Notas livres aceitam Markdown básico: # para títulos, **negrito**, *itálico*, listas com - e WikiLinks com colchetes duplos.'] },
  ]},
  { id: 'wikilinks', title: 'WikiLinks entre conteúdos', summary: 'Conecte notas, fichas e tabelas pelo nome.', blocks: [
    { title: 'Como criar', paragraphs: ['Digite o nome exato entre colchetes duplos. Ao visualizar a nota, o link fica clicável. A busca ignora diferenças entre maiúsculas/minúsculas e espaços externos.'], codeLabel: 'Exemplos de WikiLinks', code: `[[Rei Aldren]]\n[[Goblin]]\n[[Tabela: Tesouros Antigos]]\nA espada pertence a [[Lia Valente]].` },
    { title: 'Quando o destino não existe', paragraphs: ['O programa oferece criar uma nota quando não encontra o destino. Antes de confirmar, confira a grafia e se você está na campanha correta. Para tabelas, use o prefixo “Tabela:” seguido do nome cadastrado.'] },
  ]},
  { id: 'fichas', title: 'Fichas e importação', summary: 'Crie, importe, revise e duplique personagens e criaturas.', blocks: [
    { title: 'Criação e duplicação', paragraphs: ['Crie jogadores, NPCs, monstros ou vilões pelos botões da pasta. O botão de cópia antes da lixeira cria uma ficha independente com os mesmos dados. Alterar ou excluir a cópia não modifica a original.'] },
    { title: 'Importar ficha', paragraphs: ['Em Fichas & Bestiário, clique em Importar ficha. São aceitos PDF com texto selecionável, JSON e TXT. Depois da análise, revise a prévia antes de criar. PDFs escaneados como imagem ainda precisam de OCR externo.'] },
    { title: 'Modelo JSON de monstro/NPC/vilão', paragraphs: ['Use type “monster”, “npc” ou “villain”. Campos extras reconhecidos incluem features, actions, biography, feats, equipment, bonusActions e reactions.'], codeLabel: 'JSON de monstro', code: characterJson },
    { title: 'Modelo JSON completo de jogador', paragraphs: ['Use type “pc”. O objeto playerSheet corresponde às cinco abas da ficha: Atributos, Perícias, Habilidades, Magia e Pessoal. Mantenha os nomes internos dos campos; você pode trocar os valores e adicionar linhas em attacks e spells.'], codeLabel: 'JSON completo de jogador', code: playerJson },
  ]},
  { id: 'tabelas', title: 'Tabelas de rolagem', summary: 'Crie resultados com peso, intervalo, trava e WikiLinks.', blocks: [
    { title: 'Criar e sortear', paragraphs: ['Abra Tabelas de Rolagem, informe o nome e clique em + Criar. Adicione linhas pelo + da tabela. Detalhes é o resultado; Peso define a chance; Intervalo é calculado automaticamente; a trava retira a linha do sorteio. Clique em Sortear resultado para abrir o resultado em uma janela.'] },
    { title: 'Importar e exportar', paragraphs: ['Use Importar/Exportar para colar conteúdo ou selecionar um arquivo. JSON pode trazer uma lista de tabelas. CSV usa uma linha por resultado. Texto simples aceita “peso | descrição”; sem peso, cada linha vale 1.'] },
    { title: 'Modelo JSON de tabela', paragraphs: ['range informa o início e o fim do intervalo. weight controla o peso. locked true mantém a linha guardada, mas fora dos sorteios.'], codeLabel: 'JSON de tabela', code: tableJson },
    { title: 'Modelo CSV', paragraphs: ['Preserve o cabeçalho e use uma linha para cada resultado.'], codeLabel: 'CSV de tabela', code: tableCsv },
    { title: 'Modelo de texto colado', paragraphs: ['Linhas iniciadas por # são comentários.'], codeLabel: 'Texto de tabela', code: tableText },
  ]},
  { id: 'batalha', title: 'Rastreador de batalha', summary: 'Prepare aliados, inimigos, iniciativa, PV e turnos.', blocks: [
    { title: 'Preparar o combate', paragraphs: ['Clique em Batalha e arraste fichas para Aliados ou Inimigos. Em cada token escolha iniciativa Normal, Vantagem ou Desvantagem. Você pode rolar ou editar o resultado manualmente; passe o mouse sobre o valor para conferir os dados e o modificador.'] },
    { title: 'Duplicar criaturas sem duplicar fichas', paragraphs: ['Use o botão de cópia do token para criar várias instâncias da mesma ficha. Goblin vira Goblin A, Goblin B, Goblin C. Cada token possui PV, iniciativa, condições e morte independentes, mas somente a ficha Goblin permanece no bestiário.'] },
    { title: 'Durante a batalha', paragraphs: ['A ordem usa os resultados preparados. Avance ou volte turnos pelas setas. Iniciativa, PV e CA podem ser corrigidos manualmente. Alterar a iniciativa reorganiza a fila. Adicione estados pelo botão + status; no início do turno, escolha quais permanecem.'] },
    { title: 'Derrotados e morte', paragraphs: ['Monstros, NPCs e vilões com 0 PV ficam mortos/cinzentos e são pulados; curá-los acima de 0 os reativa. Jogadores com 0 PV ficam derrotados e fazem salvaguardas nas rodadas seguintes. Marque diretamente três sucessos ou falhas; três sucessos devolvem 1 PV e aplicam Fadigado, enquanto três falhas causam morte. Cura manual também encerra o estado derrotado.'] },
  ]},
  { id: 'boas-praticas', title: 'Boas práticas e solução de problemas', summary: 'Evite links quebrados e importações incompletas.', blocks: [
    { title: 'Antes da sessão', paragraphs: ['Crie e selecione a campanha correta, revise fichas importadas, teste os WikiLinks e faça um sorteio de cada tabela. Prepare os tokens e confira a iniciativa antes de iniciar a batalha.'] },
    { title: 'Se algo não aparecer', paragraphs: ['Confira se o item pertence à campanha ativa, se o nome do WikiLink está correto e se o JSON usa os nomes de campo mostrados nos modelos. Na importação de PDF, confirme que o texto pode ser selecionado. Nunca feche a prévia de importação sem revisar os valores detectados.'] },
  ]},
];

function CodeExample({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return <div className="mt-3 overflow-hidden rounded-xl border border-zinc-700 bg-black/40"><div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2"><span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</span><button type="button" onClick={copy} className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold text-sky-300 hover:bg-sky-500/10">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? 'Copiado' : 'Copiar'}</button></div><pre className="max-h-80 overflow-auto p-4 text-xs leading-5 text-zinc-300"><code>{value}</code></pre></div>;
}

export function HelpCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(sections[0].id);
  const filtered = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    if (!search) return sections;
    return sections.filter((section) => JSON.stringify(section).toLocaleLowerCase().includes(search));
  }, [query]);
  const active = filtered.find((section) => section.id === activeId) ?? filtered[0];
  if (!open) return null;

  return createPortal(<div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-label="Central de ajuda" className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-sky-500/30 bg-zinc-950 shadow-2xl"><header className="flex flex-wrap items-center gap-4 border-b border-zinc-800 p-4"><div className="flex min-w-52 items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/10 text-sky-400"><HelpCircle /></span><div><h2 className="font-black text-white">Central de Ajuda</h2><p className="text-[10px] text-zinc-500">Manual prático do BookMaster</p></div></div><label className="relative min-w-52 flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar WikiLinks, batalha, JSON, tabelas..." className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-900 pl-10 pr-3 text-xs text-white outline-none focus:border-sky-400" /></label><button type="button" onClick={onClose} aria-label="Fechar ajuda" className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white"><X /></button></header><div className="grid min-h-0 flex-1 md:grid-cols-[17rem_1fr]"><nav className="overflow-y-auto border-b border-zinc-800 p-3 md:border-b-0 md:border-r"><p className="mb-2 px-2 text-[9px] font-black uppercase tracking-[.16em] text-zinc-600">Setores do tutorial</p>{filtered.map((section) => <button key={section.id} type="button" onClick={() => setActiveId(section.id)} className={`mb-1 w-full rounded-xl px-3 py-2.5 text-left transition ${active?.id === section.id ? 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}><strong className="block text-xs">{section.title}</strong><span className="mt-1 block text-[10px] leading-4 opacity-70">{section.summary}</span></button>)}{!filtered.length && <p className="rounded-xl border border-dashed border-zinc-700 p-4 text-center text-xs text-zinc-500">Nenhum assunto encontrado.</p>}</nav><main className="overflow-y-auto p-5 sm:p-7">{active && <><div className="mb-6 border-b border-zinc-800 pb-5"><p className="text-[10px] font-black uppercase tracking-[.18em] text-sky-400">Tutorial</p><h1 className="mt-2 text-2xl font-black text-white">{active.title}</h1><p className="mt-2 text-sm text-zinc-400">{active.summary}</p></div><div className="space-y-5">{active.blocks.map((block) => <section key={block.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/45 p-5"><h3 className="font-black text-zinc-100">{block.title}</h3>{block.paragraphs.map((paragraph) => <p key={paragraph} className="mt-2 text-sm leading-6 text-zinc-400">{paragraph}</p>)}{block.steps && <ol className="mt-3 space-y-2">{block.steps.map((step, index) => <li key={step} className="flex gap-3 text-sm leading-5 text-zinc-300"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sky-500/15 text-[10px] font-black text-sky-300">{index + 1}</span><span>{step}</span></li>)}</ol>}{block.code && <CodeExample label={block.codeLabel ?? 'Exemplo'} value={block.code} />}</section>)}</div></>}</main></div></div></div>, document.body);
}
