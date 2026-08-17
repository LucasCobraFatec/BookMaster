import { ImagePlus, Pencil, X } from 'lucide-react';
import { ImageCropper } from './ImageCropper';

export function NoteImageField({ image, title, alt, onChange, aspect = 16 / 9 }: { image: string; title: string; alt: string; onChange: (image: string) => void; aspect?: number }) {
  return <section>
    <label className="mb-2 block text-sm font-semibold text-sky-300">{title}</label>
    {image ? <div>
      <div className="relative overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950" style={{ aspectRatio: String(aspect) }}><img src={image} alt={alt} className="h-full w-full object-contain" /></div>
      <div className="mt-2 flex gap-2"><ImageCropper aspect={aspect} label={`Trocar e ajustar ${title.toLocaleLowerCase()}`} onApply={onChange} className="flex h-9 items-center gap-2 rounded-lg border border-violet-500/30 px-3 text-xs font-bold text-violet-300 hover:bg-violet-500/10"><Pencil className="h-3.5 w-3.5" />Trocar ou reajustar</ImageCropper><button type="button" onClick={() => onChange('')} className="flex h-9 items-center gap-2 rounded-lg border border-rose-500/20 px-3 text-xs font-bold text-rose-400 hover:bg-rose-500/10"><X className="h-3.5 w-3.5" />Remover</button></div>
    </div> : <ImageCropper aspect={aspect} label={`Selecionar ${title.toLocaleLowerCase()}`} onApply={onChange} className="flex min-h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 text-zinc-500 transition hover:border-sky-500/60 hover:bg-sky-500/5 hover:text-sky-400"><ImagePlus className="mb-2 h-7 w-7" /><span className="text-xs font-semibold">Selecionar imagem no computador</span><span className="mt-1 text-[10px]">Depois ajuste zoom e posição</span></ImageCropper>}
  </section>;
}
