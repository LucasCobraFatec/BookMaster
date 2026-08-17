import { ImagePlus, Minus, Move, Plus, RotateCcw, Upload, X } from 'lucide-react';
import { useRef, useState, type ChangeEvent, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';

interface ImageCropperProps {
  aspect?: number;
  circular?: boolean;
  label?: string;
  onApply: (image: string) => void | Promise<void>;
  className?: string;
  children?: React.ReactNode;
}

interface ImageSize { width: number; height: number }
interface Position { x: number; y: number }
type FitMode = 'cover' | 'contain';

const frameWidth = 560;

function readImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Não foi possível ler a imagem.'));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function ImageCropper({ aspect = 1, circular = false, label = 'Selecionar imagem', onApply, className = '', children }: ImageCropperProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ pointerId: number; start: Position; origin: Position } | null>(null);
  const [source, setSource] = useState('');
  const [size, setSize] = useState<ImageSize>({ width: 1, height: 1 });
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [fitMode, setFitMode] = useState<FitMode>('cover');
  const [busy, setBusy] = useState(false);
  const frameHeight = frameWidth / aspect;

  const baseScale = fitMode === 'cover'
    ? Math.max(frameWidth / size.width, frameHeight / size.height)
    : Math.min(frameWidth / size.width, frameHeight / size.height);
  const displayedWidth = size.width * baseScale * zoom;
  const displayedHeight = size.height * baseScale * zoom;
  const maxX = Math.max(0, (displayedWidth - frameWidth) / 2);
  const maxY = Math.max(0, (displayedHeight - frameHeight) / 2);
  const clamp = (next: Position): Position => ({ x: Math.max(-maxX, Math.min(maxX, next.x)), y: Math.max(-maxY, Math.min(maxY, next.y)) });
  const changeZoom = (nextZoom: number) => {
    const nextWidth = size.width * baseScale * nextZoom;
    const nextHeight = size.height * baseScale * nextZoom;
    const nextMaxX = Math.max(0, (nextWidth - frameWidth) / 2);
    const nextMaxY = Math.max(0, (nextHeight - frameHeight) / 2);
    setPosition((current) => ({ x: Math.max(-nextMaxX, Math.min(nextMaxX, current.x)), y: Math.max(-nextMaxY, Math.min(nextMaxY, current.y)) }));
    setZoom(nextZoom);
  };

  const choose = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const dataUrl = await readImage(file);
    setSource(dataUrl);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setFitMode('cover');
  };

  const loaded = () => {
    const image = imageRef.current;
    if (image) setSize({ width: image.naturalWidth, height: image.naturalHeight });
  };

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, start: { x: event.clientX, y: event.clientY }, origin: position };
  };
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setPosition(clamp({ x: drag.origin.x + event.clientX - drag.start.x, y: drag.origin.y + event.clientY - drag.start.y }));
  };
  const pointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };

  const apply = async () => {
    const image = imageRef.current;
    if (!image) return;
    setBusy(true);
    const outputWidth = aspect === 1 ? 900 : 1400;
    const outputHeight = Math.round(outputWidth / aspect);
    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const context = canvas.getContext('2d');
    if (!context) { setBusy(false); return; }
    const scaleToOutput = outputWidth / frameWidth;
    context.fillStyle = '#09090b';
    context.fillRect(0, 0, outputWidth, outputHeight);
    context.drawImage(image, (position.x - displayedWidth / 2 + frameWidth / 2) * scaleToOutput, (position.y - displayedHeight / 2 + frameHeight / 2) * scaleToOutput, displayedWidth * scaleToOutput, displayedHeight * scaleToOutput);
    await onApply(canvas.toDataURL('image/webp', 0.9));
    setBusy(false);
    setSource('');
  };

  return <>
    <button type="button" onClick={() => inputRef.current?.click()} aria-label={label} className={className}>
      {children ?? <><ImagePlus className="h-5 w-5" /><span>{label}</span></>}
    </button>
    <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={choose} className="hidden" />
    {source && createPortal(<div className="fixed inset-0 z-[10000] grid place-items-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && setSource('')}>
      <div role="dialog" aria-modal="true" aria-label="Ajustar imagem" className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-violet-500/35 bg-zinc-950 shadow-2xl">
        <header className="flex items-start justify-between border-b border-zinc-800 p-4 sm:p-5"><div><h2 className="text-base font-black text-white">Ajustar imagem</h2><p className="mt-1 text-xs text-zinc-400">Escolha mostrar tudo ou preencher o quadro; depois ajuste zoom e posição.</p></div><button type="button" onClick={() => setSource('')} aria-label="Fechar" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"><X className="h-5 w-5" /></button></header>
        <div className="p-4 sm:p-6">
          <div className="mx-auto max-w-[560px]">
            <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 p-1.5"><button type="button" onClick={() => { setFitMode('contain'); setZoom(1); setPosition({ x: 0, y: 0 }); }} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${fitMode === 'contain' ? 'bg-violet-600 text-white shadow' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>Imagem inteira</button><button type="button" onClick={() => { setFitMode('cover'); setZoom(1); setPosition({ x: 0, y: 0 }); }} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${fitMode === 'cover' ? 'bg-violet-600 text-white shadow' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>Preencher quadro</button></div>
            <div onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} className={`relative w-full touch-none cursor-grab select-none overflow-hidden bg-zinc-900 active:cursor-grabbing ${circular ? 'rounded-full' : 'rounded-xl'}`} style={{ aspectRatio: String(aspect) }}>
              <img ref={imageRef} src={source} onLoad={loaded} alt="Imagem para ajustar" draggable={false} className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none" style={{ width: displayedWidth, height: displayedHeight, transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))` }} />
              <div className={`pointer-events-none absolute inset-0 border-2 border-white/90 ${circular ? 'rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,.52)]' : 'rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,.52)]'}`} />
              <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-35">{Array.from({ length: 9 }).map((_, index) => <span key={index} className="border border-white/30" />)}</div>
              <span className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/65 px-3 py-1 text-[10px] font-semibold text-white"><Move className="h-3 w-3" />Arraste a foto</span>
            </div>
            <div className="mt-5 flex items-center gap-3"><Minus className="h-4 w-4 text-zinc-500" /><input aria-label="Zoom da imagem" type="range" min="1" max="3" step="0.01" value={zoom} onChange={(event) => changeZoom(Number(event.target.value))} className="h-2 flex-1 cursor-pointer accent-violet-500" /><Plus className="h-4 w-4 text-zinc-500" /><span className="w-12 text-right text-xs font-bold text-zinc-300">{Math.round(zoom * 100)}%</span></div>
            <div className="mt-3 flex items-center justify-between gap-3"><button type="button" onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }); }} className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"><RotateCcw className="h-3.5 w-3.5" />Centralizar novamente</button><span className="text-[10px] text-zinc-500">{fitMode === 'contain' ? 'A imagem completa será preservada' : 'O quadro ficará totalmente preenchido'}</span></div>
          </div>
        </div>
        <footer className="flex flex-wrap justify-between gap-2 border-t border-zinc-800 p-4"><button type="button" onClick={() => inputRef.current?.click()} className="flex h-10 items-center gap-2 rounded-lg border border-zinc-700 px-4 text-xs font-bold text-zinc-300 hover:bg-zinc-900"><Upload className="h-4 w-4" />Escolher outra</button><div className="flex gap-2"><button type="button" onClick={() => setSource('')} className="h-10 rounded-lg px-4 text-xs font-bold text-zinc-400 hover:bg-zinc-900">Cancelar</button><button type="button" disabled={busy} onClick={apply} className="h-10 rounded-lg bg-violet-600 px-5 text-xs font-black text-white hover:bg-violet-500 disabled:opacity-50">{busy ? 'Aplicando...' : 'Aplicar ajuste'}</button></div></footer>
      </div>
    </div>, document.body)}
  </>;
}
