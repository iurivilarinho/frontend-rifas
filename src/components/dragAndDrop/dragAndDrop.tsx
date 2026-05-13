import { useMemo, useState } from "react";
import { Accept, useDropzone } from "react-dropzone";
import { Download } from "lucide-react";

import { apiClient } from "@/api/clients/apiClient";
import { Button } from "@/components/button/Button";
import { Notification, type NotificationProps } from "@/components/input/Notification";
import { Label } from "@/components/input/base/Label";
import { cn } from "@/lib/mergeClasses";
import CloseIcon from "@/assets/icons/closeIcon";
import UploadCloudIcon from "@/assets/icons/uploadCloud";
import UploadImageIcon from "@/assets/icons/uploadImageIcon";
import type { DocumentApiDto } from "@/features/document/api/dtos/document";

type DragFile = File | DocumentApiDto;

type DragAndDropProps = {
  id?: string;
  label?: string;
  value: DragFile[];
  onChange: (files: DragFile[]) => void;
  acceptedFileTypes?: Accept;
  notification?: NotificationProps;
  multiple?: boolean;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
};

const isNativeFile = (f: DragFile): f is File => f instanceof File;

const getFileKey = (f: DragFile, index: number) => {
  if (isNativeFile(f)) return `nw:${f.name}-${f.size}-${f.lastModified}-${index}`;
  return `ex:${f.id ?? f.name ?? "doc"}-${index}`;
};

const getFileName = (f: DragFile) =>
  isNativeFile(f) ? f.name : (f.name ?? "Arquivo");

const base64ToBlob = (base64: string, contentType: string): Blob => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: contentType });
};

const triggerBlobDownload = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const downloadDragFile = async (f: DragFile): Promise<void> => {
  if (isNativeFile(f)) {
    triggerBlobDownload(f, f.name);
    return;
  }
  if (!f.id) return;
  const { data } = await apiClient.get<DocumentApiDto>(`/documents/${f.id}`);
  const blob = Array.isArray(data.document)
    ? new Blob([new Uint8Array(data.document as unknown as number[])], {
        type: data.contentType,
      })
    : base64ToBlob(data.document, data.contentType);
  triggerBlobDownload(blob, data.name ?? f.name ?? "documento");
};

export const DragAndDrop = ({
  id,
  label,
  value,
  onChange,
  acceptedFileTypes,
  notification,
  multiple = true,
  maxFiles,
  disabled = false,
  className,
}: DragAndDropProps) => {
  const hasFiles = value.length > 0;

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (disabled) return;
      const next = multiple ? [...value, ...acceptedFiles] : acceptedFiles.slice(0, 1);
      const capped = typeof maxFiles === "number" ? next.slice(0, maxFiles) : next;
      onChange(capped);
    },
    noClick: true,
    accept: acceptedFileTypes ?? {},
    multiple,
    maxFiles: maxFiles ?? (multiple ? 0 : 1),
    disabled,
  });

  const handleRemove = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const handleDownload = async (key: string, file: DragFile) => {
    if (downloadingKey) return;
    setDownloadingKey(key);
    try {
      await downloadDragFile(file);
    } catch (e) {
      console.error("[DragAndDrop] download failed", e);
    } finally {
      setDownloadingKey(null);
    }
  };

  const fileItems = useMemo(
    () =>
      value.map((f, index) => ({
        key: getFileKey(f, index),
        name: getFileName(f),
        file: f,
        index,
      })),
    [value],
  );

  return (
    <div className={cn("grid w-full min-w-0 gap-3", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div
        {...getRootProps({
          className: cn(
            "w-full min-w-0 overflow-hidden rounded-md border-2 border-dashed p-4 sm:p-6",
            disabled
              ? "cursor-not-allowed opacity-60"
              : isDragActive
                ? "border-primary bg-muted"
                : "border-border",
          ),
        })}
      >
        <input id={id} {...getInputProps()} />

        {!hasFiles ? (
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <UploadCloudIcon className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Arraste e solte arquivos aqui
            </p>
            <p className="text-sm font-semibold text-muted-foreground">ou</p>
            <Button size="sm" onClick={open} type="button" disabled={disabled}>
              Procure
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <ul className="flex flex-col gap-1">
              {fileItems.map((f) => (
                <li
                  key={f.key}
                  className="flex w-full min-w-0 items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5"
                >
                  <UploadImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span
                    title={f.name}
                    className="block flex-1 min-w-0 truncate text-sm text-foreground"
                  >
                    {f.name}
                  </span>
                  <button
                    type="button"
                    disabled={downloadingKey === f.key}
                    onClick={() => handleDownload(f.key, f.file)}
                    aria-label={`Baixar ${f.name}`}
                    title="Baixar"
                    className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleRemove(f.index)}
                    aria-label="Remover arquivo"
                    title="Remover"
                    className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="pt-1">
              <Button size="sm" onClick={open} type="button" disabled={disabled}>
                {multiple ? "Adicionar mais" : "Trocar arquivo"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {notification && <Notification {...notification} />}
    </div>
  );
};
