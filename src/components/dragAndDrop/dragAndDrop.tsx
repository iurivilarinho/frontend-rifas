import { Accept, useDropzone } from "react-dropzone";
import { Notification, NotificationProps } from "../input/notification";
import { mergeClasses } from "@/lib/mergeClasses";
import UploadCloudIcon from "@/assets/icons/uploadCloud";
import UploadImageIcon from "@/assets/icons/uploadImageIcon";
import { Button } from "../button/button";
import { useMemo } from "react";
import CloseIcon from "@/assets/icons/closeIcon";
import { Label } from "../input/Label";
import { Document } from "../../types/document";

type DragFile = File | Document;

interface DragAndDropProps {
  id?: string;
  label?: string;

  // controlled:
  value: DragFile[];
  onChange: (files: DragFile[]) => void;

  acceptedFileTypes?: Accept;
  notification?: NotificationProps;

  multiple?: boolean;
  maxFiles?: number;
  disabled?: boolean;
}

const isNativeFile = (f: DragFile): f is File => f instanceof File;

const getFileKey = (f: DragFile, index: number) => {
  if (isNativeFile(f))
    return `nw:${f.name}-${f.size}-${f.lastModified}-${index}`;
  // Document: tente um id se existir; senão name + index
  return `ex:${(f as any)?.id ?? f.name ?? "doc"}-${index}`;
};

const getFileName = (f: DragFile) =>
  isNativeFile(f) ? f.name : (f.name ?? "Arquivo");

const DragAndDrop = ({
  id,
  label,
  value,
  onChange,
  acceptedFileTypes,
  notification,
  multiple = true,
  maxFiles,
  disabled = false,
}: DragAndDropProps) => {
  const hasFiles = value.length > 0;

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (disabled) return;

      const current = value;

      const next = multiple
        ? [...current, ...acceptedFiles]
        : acceptedFiles.slice(0, 1);

      const capped =
        typeof maxFiles === "number" ? next.slice(0, maxFiles) : next;

      onChange(capped);
    },
    noClick: true,
    accept: acceptedFileTypes ?? {},
    multiple,
    maxFiles: maxFiles ?? (multiple ? 0 : 1),
    disabled,
  });

  const handleRemove = (indexToRemove: number) => {
    const next = value.filter((_, idx) => idx !== indexToRemove);
    onChange(next);
  };

  const fileItems = useMemo(() => {
    return value.map((f, index) => ({
      key: getFileKey(f, index),
      name: getFileName(f),
      index,
    }));
  }, [value]);

  return (
    <div className="grid w-full gap-3">
      {label && <Label htmlFor={id}>{label}</Label>}

      <div
        {...getRootProps({
          className: mergeClasses(
            "rounded-md border-2 border-dashed p-6",
            disabled
              ? "cursor-not-allowed opacity-60"
              : isDragActive
                ? "border-primary bg-muted"
                : "border-slate-300",
          ),
        })}
      >
        <input id={id} {...getInputProps()} />

        {!hasFiles ? (
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <UploadCloudIcon className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              Arraste e solte arquivos aqui
            </p>
            <p className="font-semibold text-muted-foreground">ou</p>
            <Button size="sm" onClick={open} type="button" disabled={disabled}>
              Procure
            </Button>
          </div>
        ) : (
          <div className="grid gap-2">
            {fileItems.map((f) => (
              <div key={f.key} className="flex items-center gap-2">
                <UploadImageIcon />
                <span className="text-sm text-muted-foreground">{f.name}</span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    handleRemove(f.index);
                  }}
                  className="ml-auto text-muted-foreground"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
            ))}

            <div className="pt-2">
              <Button
                size="sm"
                onClick={open}
                type="button"
                disabled={disabled}
              >
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

export default DragAndDrop;
