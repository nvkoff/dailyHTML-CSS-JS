import { cn } from "@/lib/utils";

export function CodeBlock({
  code,
  language,
  className,
}: {
  code: string;
  language?: string;
  className?: string;
}) {
  return (
    <pre
      className={cn(
        "rounded-md border bg-muted/60 p-4 text-sm overflow-x-auto",
        className,
      )}
      data-language={language}
    >
      <code className="font-mono leading-relaxed whitespace-pre">{code}</code>
    </pre>
  );
}
