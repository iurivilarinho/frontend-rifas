import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect, useMemo, useRef } from "react";

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

  const readyToEmitChanges = useRef(false);
  const lastLoadedRef = useRef<{ key?: string; md?: string }>({});

  const editor = useCreateBlockNote({ initialContent: undefined });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const last = lastLoadedRef.current;
      const sameKey = (docKey ?? "") === (last.key ?? "");
      const sameMd = (value ?? "") === (last.md ?? "");
      if (sameKey && sameMd) return;

      readyToEmitChanges.current = false;

      if (!value?.trim()) {
        editor.replaceBlocks(editor.document, []);
        lastLoadedRef.current = { key: docKey, md: value ?? "" };
        readyToEmitChanges.current = true;
        return;
      }

      const blocks = await editor.tryParseMarkdownToBlocks(value);
      if (cancelled) return;

      editor.replaceBlocks(editor.document, blocks ?? []);
      lastLoadedRef.current = { key: docKey, md: value };
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
      className={["my-3 mb-6", className].filter(Boolean).join(" ")}
      {...blockFilesHandlers}
    >
      <BlockNoteView
        editor={editor}
        editable={editable}
        className={`w-full rounded-lg border shadow ${
          disabled ? "bg-gray-50" : "bg-white"
        } ${error ? "border-red-300" : "border-green-200"}`}
        style={{ minHeight, padding: 12 }}
        onChange={async () => {
          if (!editable) return;
          if (!readyToEmitChanges.current) return;

          const md = await editor.blocksToMarkdownLossy();
          onChange(md);
        }}
      />
    </div>
  );
};
