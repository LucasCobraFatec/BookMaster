import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';

interface CreateFileDialogProps {
  open: boolean;
  title: string;
  description?: string;
  submitLabel?: string;
  onClose: () => void;
  onCreate: (name: string) => Promise<void> | void;
}

export function CreateFileDialog({ open, title, description, submitLabel = 'Criar', onClose, onCreate }: CreateFileDialogProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const handleClose = useCallback(() => {
    setName('');
    setError('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && handleClose();
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, handleClose]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Digite um nome para continuar.');
      inputRef.current?.focus();
      return;
    }
    setIsSubmitting(true);
    try {
      await onCreate(trimmedName);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && handleClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} className="w-full max-w-sm rounded-xl border border-zinc-700/70 bg-zinc-900 p-5 shadow-2xl shadow-black/60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-sm font-semibold text-zinc-50">{title}</h2>
            {description && <p id={descriptionId} className="mt-1 text-xs leading-5 text-zinc-400">{description}</p>}
          </div>
          <button type="button" onClick={handleClose} aria-label="Fechar janela" className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="new-item-name" className="mb-2 block text-xs font-medium text-zinc-300">Nome do arquivo/item</label>
          <input ref={inputRef} id="new-item-name" value={name} onChange={(event) => { setName(event.target.value); setError(''); }} aria-invalid={Boolean(error)} aria-describedby={error ? 'new-item-error' : undefined} className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="Digite um nome..." />
          {error && <p id="new-item-error" role="alert" className="mt-2 text-xs text-rose-400">{error}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={handleClose} className="h-9 rounded-lg px-4 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="h-9 rounded-lg bg-violet-600 px-4 text-xs font-semibold text-white transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:cursor-wait disabled:opacity-60">{isSubmitting ? 'Criando...' : submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
