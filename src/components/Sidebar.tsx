import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import { BookOpen, ChevronDown, ChevronRight, Folder, FolderOpen, Plus, Trash2, X } from 'lucide-react';
import { CreateFileDialog } from './CreateFileDialog';
import type { CategoryNode, FileNode, SidebarAccent, SidebarProps, SidebarSectionType } from './sidebar.types';

const accentStyles: Record<SidebarAccent, { text: string; soft: string; ring: string }> = {
  purple: { text: 'text-violet-400', soft: 'hover:bg-violet-500/10', ring: 'focus-visible:ring-violet-500' },
  red: { text: 'text-rose-400', soft: 'hover:bg-rose-500/10', ring: 'focus-visible:ring-rose-500' },
  blue: { text: 'text-sky-400', soft: 'hover:bg-sky-500/10', ring: 'focus-visible:ring-sky-500' },
  green: { text: 'text-emerald-400', soft: 'hover:bg-emerald-500/10', ring: 'focus-visible:ring-emerald-500' },
};

function FileItem({ file, active, accent, onSelect, onDelete }: { file: FileNode; active: boolean; accent: SidebarAccent; onSelect: () => void; onDelete: () => void }) {
  return (
    <div className={`group flex h-8 items-center rounded-md transition-all duration-200 ${active ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100'}`}>
      <button type="button" onClick={onSelect} className={`flex min-w-0 flex-1 items-center gap-2 px-3 text-left text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset ${accentStyles[accent].ring}`} aria-current={active ? 'page' : undefined}>
        <span className="min-w-0 flex-1 truncate">{file.name}</span>
        {file.isDraft && <span className="shrink-0 rounded border border-amber-400/25 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-300">Rascunho</span>}
      </button>
      <button type="button" onClick={onDelete} aria-label={`Excluir ${file.name}`} className="mr-1 rounded p-1 text-zinc-500 opacity-0 transition-all hover:bg-rose-500/10 hover:text-rose-400 focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
    </div>
  );
}

function SidebarCategory({ category, accent, expanded, selectedItemId, onToggle, onCreate, onSelectFile, onDeleteFile }: { category: CategoryNode; accent: SidebarAccent; expanded: boolean; selectedItemId?: string; onToggle: () => void; onCreate: () => void; onSelectFile: (file: FileNode) => void; onDeleteFile: (file: FileNode) => void }) {
  const style = accentStyles[accent];
  return (
    <div>
      <div className={`group flex h-9 items-center rounded-md transition-all duration-200 ${style.soft}`}>
        <button type="button" onClick={onToggle} aria-expanded={expanded} className={`flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 text-left text-xs font-medium text-zinc-200 focus-visible:outline-none focus-visible:ring-2 ${style.ring}`}>
          {expanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-500" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-500" />}
          {expanded ? <FolderOpen className={`h-4 w-4 shrink-0 ${style.text}`} /> : <Folder className={`h-4 w-4 shrink-0 ${style.text}`} />}
          <span className="truncate">{category.label}</span>
        </button>
        <span aria-label={`${category.files.length} itens`} className={`mr-1 min-w-5 rounded-full border border-current/30 px-1.5 py-0.5 text-center text-[10px] leading-none ${style.text}`}>{category.files.length}</span>
        <button type="button" onClick={onCreate} aria-label={`Criar em ${category.label}`} title={`Criar ${category.createLabel}`} className={`mr-1 rounded-md p-1 ${style.text} transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 ${style.ring}`}><Plus className="h-3.5 w-3.5" /></button>
      </div>
      <div className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="ml-[1.7rem] border-l border-zinc-800 pl-2">
            {category.files.map((file) => <FileItem key={file.id} file={file} active={selectedItemId === file.id} accent={accent} onSelect={() => onSelectFile(file)} onDelete={() => onDeleteFile(file)} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarSection({ section, expanded, expandedCategories, selectedItemId, onToggle, onToggleCategory, onCreate, onSelectFile, onDeleteFile }: { section: SidebarSectionType; expanded: boolean; expandedCategories: Set<string>; selectedItemId?: string; onToggle: () => void; onToggleCategory: (id: string) => void; onCreate: (category: CategoryNode) => void; onSelectFile: (file: FileNode) => void; onDeleteFile: (file: FileNode) => void }) {
  const style = accentStyles[section.accent];
  return (
    <section>
      <button type="button" onClick={onToggle} aria-expanded={expanded} className={`flex h-9 w-full items-center gap-2 rounded-md px-1.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] ${style.text} transition-all duration-200 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 ${style.ring}`}>
        <span className="min-w-0 flex-1 truncate">{section.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? '' : '-rotate-90'}`} />
      </button>
      <div className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="overflow-hidden space-y-0.5">{section.categories.map((category) => <SidebarCategory key={category.id} category={category} accent={section.accent} expanded={expandedCategories.has(category.id)} selectedItemId={selectedItemId} onToggle={() => onToggleCategory(category.id)} onCreate={() => onCreate(category)} onSelectFile={onSelectFile} onDeleteFile={onDeleteFile} />)}</div></div>
    </section>
  );
}

export function Sidebar(props: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => new Set(props.sections.map((section) => section.id)));
  const [expandedCategories, setExpandedCategories] = useState(() => new Set(props.sections.flatMap((section) => section.categories.map((category) => category.id))));
  const [dialog, setDialog] = useState<{ type: 'campaign' } | { type: 'file'; category: CategoryNode } | null>(null);
  const closeDialog = useCallback(() => setDialog(null), []);
  const toggleSet = (setter: Dispatch<SetStateAction<Set<string>>>, id: string) => setter((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  return (
    <>
      <aside aria-label="Navegação principal" className={`absolute z-30 flex h-full w-[19rem] flex-col border-r border-zinc-800/80 bg-zinc-950 shadow-2xl shadow-black/30 transition-transform duration-300 md:static md:translate-x-0 ${props.isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="border-b border-zinc-800/80 p-4">
          <div className="flex h-9 items-center justify-between">
            <div className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-500/10 text-violet-400"><BookOpen className="h-5 w-5" /></span><h1 className="text-sm font-extrabold tracking-widest text-white">BOOKMASTER</h1></div>
            <button type="button" onClick={props.onClose} aria-label="Fechar menu" className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 md:hidden"><X className="h-5 w-5" /></button>
          </div>
          <label htmlFor="active-campaign" className="mt-4 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Campanha ativa</label>
          <div className="mt-2 flex gap-2">
            <select id="active-campaign" value={props.selectedCampaignId} onChange={(event) => props.onSelectCampaign(event.target.value)} className="h-10 min-w-0 flex-1 cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20">
              {!props.campaigns.length && <option value="">Nenhuma campanha</option>}
              {props.campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name} ({campaign.system})</option>)}
            </select>
            <button type="button" onClick={() => setDialog({ type: 'campaign' })} aria-label="Criar campanha" title="Criar campanha" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-violet-600 text-white transition-all hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"><Plus className="h-4 w-4" /></button>
            {props.onDeleteCampaign && props.selectedCampaignId && props.campaigns.length > 1 && <button type="button" onClick={props.onDeleteCampaign} aria-label="Excluir campanha ativa" title="Excluir campanha ativa" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-rose-500/20 text-rose-400 transition hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"><Trash2 className="h-4 w-4" /></button>}
          </div>
        </div>
        <nav className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-3 py-4">
          {props.sections.map((section) => <SidebarSection key={section.id} section={section} expanded={expandedSections.has(section.id)} expandedCategories={expandedCategories} selectedItemId={props.selectedItemId} onToggle={() => toggleSet(setExpandedSections, section.id)} onToggleCategory={(id) => toggleSet(setExpandedCategories, id)} onCreate={(category) => setDialog({ type: 'file', category })} onSelectFile={props.onSelectFile} onDeleteFile={props.onDeleteFile} />)}
        </nav>
      </aside>
      <CreateFileDialog open={Boolean(dialog)} title={dialog?.type === 'campaign' ? 'Nova campanha' : `Novo item em ${dialog?.category.label ?? ''}`} description={dialog?.type === 'campaign' ? 'Crie um novo espaço para sua aventura.' : `Informe o nome do novo ${dialog?.category.createLabel.toLowerCase() ?? 'item'}.`} onClose={closeDialog} onCreate={async (name) => { if (dialog?.type === 'campaign') await props.onCreateCampaign(name); else if (dialog?.type === 'file') await props.onCreateFile(dialog.category, name); }} />
    </>
  );
}
