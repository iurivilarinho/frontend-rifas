/** Renderiza o texto dos termos (markdown enxuto: #/##/### viram títulos, resto vira parágrafo). */
export const TermsContent = ({ content }: { content: string }) => {
  const blocks = content
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
      {blocks.map((block, index) => {
        if (block.startsWith("### "))
          return (
            <h3 key={index} className="pt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
              {block.slice(4)}
            </h3>
          );
        if (block.startsWith("## "))
          return (
            <h3 key={index} className="pt-2 text-base font-semibold text-slate-900 dark:text-slate-50">
              {block.slice(3)}
            </h3>
          );
        if (block.startsWith("# "))
          return (
            <h2 key={index} className="text-lg font-bold text-slate-900 dark:text-slate-50">
              {block.slice(2)}
            </h2>
          );
        return (
          <p key={index} className="whitespace-pre-line">
            {block}
          </p>
        );
      })}
    </div>
  );
};
