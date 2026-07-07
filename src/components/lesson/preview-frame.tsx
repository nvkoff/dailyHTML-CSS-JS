"use client";

const BASE_STYLES = `
  html, body { margin: 0; padding: 12px; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; background: #fafafa; color: #0a0a0a; }
  * { box-sizing: border-box; }
`;

export function PreviewFrame({
  html,
  css,
  title,
  height = 180,
}: {
  html: string;
  css: string;
  title?: string;
  height?: number;
}) {
  const doc = `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_STYLES}${css}</style></head><body>${html}</body></html>`;
  return (
    <iframe
      title={title ?? "preview"}
      srcDoc={doc}
      sandbox=""
      className="w-full rounded-md border bg-white"
      style={{ height, colorScheme: "light" }}
    />
  );
}
