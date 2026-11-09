export function PreviewPlaceholder({ title }: { title: string }) {
  return (
    <h1
      data-slot="preview-placeholder"
      className="text-2xl font-bold leading-tight text-foreground"
    >
      {title}
    </h1>
  );
}
