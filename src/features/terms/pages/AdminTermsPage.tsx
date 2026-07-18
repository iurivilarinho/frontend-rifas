import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/button/Button";

import { usePublishTerms, useTermsHistory } from "../api/useTermsService";
import { TermsContent } from "../components/TermsContent";
import type { TermsVersion } from "../api/terms";

export const AdminTermsPage = () => {
  const navigate = useNavigate();
  const { data: history, isLoading } = useTermsHistory(true);
  const publish = usePublishTerms();

  const [title, setTitle] = useState("Termos de Uso");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(false);

  const current = history?.[0];
  const nextVersion = current ? current.version + 1 : 1;

  const onPublish = () => {
    if (!title.trim() || !content.trim()) return;
    publish.mutate(
      { title: title.trim(), content: content.trim() },
      { onSuccess: () => { setContent(""); setPreview(false); } },
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Termos de Uso</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Publicar uma nova versão substitui a anterior e faz todos os usuários aceitarem de novo para
        continuar. As versões antigas ficam no histórico.
      </p>

      <div className="rounded-lg border border-slate-200 p-5 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Publicar nova versão <span className="text-sm font-normal text-slate-500">(será a v{nextVersion})</span>
          </h2>
          <button
            type="button"
            className="text-sm font-medium text-amber-600 hover:text-amber-700"
            onClick={() => setPreview((v) => !v)}
          >
            {preview ? "Editar" : "Pré-visualizar"}
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Conteúdo</label>
            {preview ? (
              <div className="min-h-[16rem] rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                {content.trim() ? <TermsContent content={content} /> : (
                  <p className="text-sm text-slate-400">Nada para pré-visualizar ainda.</p>
                )}
              </div>
            ) : (
              <textarea
                rows={16}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={"# Termos de Uso\n\nUse # para títulos e linhas em branco para separar parágrafos."}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            )}
            <p className="mt-1 text-xs text-slate-500">
              Formatação: <code>#</code> título, <code>##</code> subtítulo, linha em branco separa parágrafos.
            </p>
          </div>
          <Button disabled={publish.isPending || !title.trim() || !content.trim()} onClick={onPublish}>
            {publish.isPending ? "Publicando..." : "Publicar nova versão"}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 p-5 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Histórico de versões</h2>
        {isLoading ? (
          <p className="mt-3 text-sm text-slate-400">Carregando...</p>
        ) : !history?.length ? (
          <p className="mt-3 text-sm text-slate-500">Nenhuma versão publicada ainda.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
            {history.map((v) => (
              <HistoryRow key={v.id} version={v} isCurrent={v.id === current?.id} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const HistoryRow = ({ version, isCurrent }: { version: TermsVersion; isCurrent: boolean }) => {
  const [open, setOpen] = useState(false);
  return (
    <li className="py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
            Versão {version.version}
            {isCurrent && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Vigente</span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {version.title}
            {version.publishedBy ? ` — por ${version.publishedBy}` : ""}
          </p>
        </div>
        <button type="button" className="shrink-0 text-sm font-medium text-amber-600 hover:text-amber-700" onClick={() => setOpen((v) => !v)}>
          {open ? "Ocultar" : "Ver texto"}
        </button>
      </div>
      {open && (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
          <TermsContent content={version.content} />
        </div>
      )}
    </li>
  );
};
