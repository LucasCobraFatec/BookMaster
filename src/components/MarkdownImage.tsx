function getImageSource(source: string) {
  const trimmed = source.trim();
  if (/^(https?:|data:image\/|\/)/i.test(trimmed)) return trimmed;
  return `/${trimmed.replace(/^\.?\//, '')}`;
}

export function MarkdownImage({ source, alt, width }: { source: string; alt: string; width?: number }) {
  return <figure className="my-4 max-w-full">
    <img src={getImageSource(source)} alt={alt || 'Imagem anexada à nota'} loading="lazy" style={width ? { width: `${width}px` } : undefined} className="max-w-full rounded-lg border border-rpg-card bg-rpg-card/30 object-contain" />
    {alt && <figcaption className="mt-1 text-xs text-rpg-muted">{alt}</figcaption>}
  </figure>;
}
