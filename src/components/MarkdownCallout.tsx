import { AlertTriangle, Info, Lightbulb, ScrollText, ShieldAlert } from 'lucide-react';

const calloutStyles = {
  NOTE: { icon: Info, label: 'Nota', className: 'border-sky-500/50 bg-sky-500/10 text-sky-100' },
  TIP: { icon: Lightbulb, label: 'Dica', className: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-100' },
  WARNING: { icon: AlertTriangle, label: 'Atenção', className: 'border-amber-500/50 bg-amber-500/10 text-amber-100' },
  DANGER: { icon: ShieldAlert, label: 'Perigo', className: 'border-red-500/50 bg-red-500/10 text-red-100' },
  INFO: { icon: ScrollText, label: 'Informação', className: 'border-violet-500/50 bg-violet-500/10 text-violet-100' },
} as const;

export type CalloutType = keyof typeof calloutStyles;

export function MarkdownCallout({ type, title, children }: { type: CalloutType; title?: string; children: React.ReactNode }) {
  const style = calloutStyles[type];
  const Icon = style.icon;
  return <aside className={`my-3 rounded-r-lg border-l-4 p-3 ${style.className}`}>
    <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-wider"><Icon className="h-4 w-4" />{title || style.label}</div>
    <div className="text-sm leading-relaxed text-rpg-text">{children}</div>
  </aside>;
}
