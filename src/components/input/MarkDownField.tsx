import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect, useMemo, useRef } from "react";

import { mergeClasses } from "@/lib/mergeClasses";

interface EditorBlockMdProps {
  value?: string; // markdown atual (RHF)
  onChange: (value: string) => void;
  disabled?: boolean; // para view mode
  error?: boolean; // campo obrigatório etc (visual)
  docKey?: string; // id do registro (evita reload indevido)
  minHeight?: number; // opcional
  className?: string; // opcional (pra espaçamento externo)
}

export const EditorBlockNoteMd = ({
  value,
  onChange,
  disabled = false,
  error = false,
  docKey,
  minHeight = 260,
  className,
}: EditorBlockMdProps) => {
  const editable = !disabled;

  /** True somente depois que o conteúdo inicial já foi parseado pro editor. */
  const readyToEmitChanges = useRef(false);
  /** Último markdown que carregamos do `value` pro editor. */
  const lastLoadedMdRef = useRef<string | undefined>(undefined);
  /** Último docKey carregado. */
  const lastLoadedKeyRef = useRef<string | undefined>(undefined);
  /** Último markdown emitido pelo próprio editor (evita laço). */
  const lastEmittedMdRef = useRef<string | undefined>(undefined);

  const editor = useCreateBlockNote({ initialContent: undefined });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const incomingMd = value ?? "";
      const keyChanged = (docKey ?? "") !== (lastLoadedKeyRef.current ?? "");

      // Eco do nosso próprio onChange: o RHF reemitiu o markdown que acabamos
      // de produzir. Não recarrega — isso é o que estava resetando o cursor.
      if (!keyChanged && incomingMd === (lastEmittedMdRef.current ?? "")) {
        return;
      }
      // Já está sincronizado com a última carga.
      if (!keyChanged && incomingMd === (lastLoadedMdRef.current ?? "")) {
        return;
      }

      readyToEmitChanges.current = false;

      if (!incomingMd.trim()) {
        editor.replaceBlocks(editor.document, []);
      } else {
        const blocks = await editor.tryParseMarkdownToBlocks(incomingMd);
        if (cancelled) return;
        editor.replaceBlocks(editor.document, blocks ?? []);
      }

      lastLoadedMdRef.current = incomingMd;
      lastLoadedKeyRef.current = docKey;
      lastEmittedMdRef.current = incomingMd;
      readyToEmitChanges.current = true;
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [editor, value, docKey]);

  const blockFilesHandlers = useMemo(
    () => ({
      onDrop: (e: React.DragEvent) => {
        if (!editable) return;
        if (e.dataTransfer?.files?.length) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      onPaste: (e: React.ClipboardEvent) => {
        if (!editable) return;
        const items = e.clipboardData?.items ?? [];
        const hasFile = Array.from(items).some((it) => it.kind === "file");
        if (hasFile) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
    }),
    [editable],
  );

  return (
    <div
      className={mergeClasses("my-3 mb-6", className)}
      {...blockFilesHandlers}
    >
      <BlockNoteView
        editor={editor}
        editable={editable}
        className={mergeClasses(
          "w-full rounded-lg border shadow-sm",
          disabled ? "bg-muted" : "bg-card",
          error ? "border-destructive" : "border-border",
        )}
        style={{ minHeight, padding: 12 }}
        onChange={async () => {
          if (!editable) return;
          if (!readyToEmitChanges.current) return;

          const md = await editor.blocksToMarkdownLossy();
          // Guarda ANTES de propagar pra que o useEffect detecte como eco.
          lastEmittedMdRef.current = md;
          onChange(md);
        }}
      />
    </div>
  );
};
