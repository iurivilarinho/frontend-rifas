import { Accept, useDropzone } from "react-dropzone";
import { Notification, NotificationProps } from "../input/notification";
import { mergeClasses } from "@/lib/mergeClasses";
import UploadCloudIcon from "@/assets/icons/uploadCloud";
import UploadImageIcon from "@/assets/icons/uploadImageIcon";
import { Button } from "../button/button";
import { useState, useEffect } from "react";
import CloseIcon from "@/assets/icons/closeIcon";
import { Label } from "../input/Label";

interface Document {
  nome: string;
  contentType: string;
}

interface DragAndDropProps {
  id?: string;
  label?: string;
  onAddFile?: (files: File[]) => void;
  acceptedFileTypes?: Accept;
  notification?: NotificationProps;
  initialFiles?: Document[];

  multiple?: boolean; // ✅ novo
  maxFiles?: number; // ✅ novo (ex.: 1 para capa)
  disabled?: boolean; // ✅ novo
}

const DragAndDrop = ({
  id,
  label,
  onAddFile,
  acceptedFileTypes,
  notification,
  initialFiles = [],
  multiple = true,
  maxFiles,
  disabled = false,
}: DragAndDropProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<Document[]>(initialFiles);

  useEffect(() => {
    setExistingFiles(initialFiles);
  }, [initialFiles]);

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (disabled) return;

      // ✅ se for capa (single), substitui
      const nextFiles = multiple
        ? [...selectedFiles, ...acceptedFiles]
        : acceptedFiles.slice(0, 1);

      // ✅ respeitar maxFiles, se definido
      const capped =
        typeof maxFiles === "number" ? nextFiles.slice(0, maxFiles) : nextFiles;

      setSelectedFiles(capped);
      onAddFile?.(capped);
    },
    noClick: true,
    accept: acceptedFileTypes ?? {},
    multiple, // ✅
    maxFiles: maxFiles ?? (multiple ? 0 : 1), // 0 = sem limite no react-dropzone
    disabled, // ✅ bloqueia drag/drop
  });

  const handleRemoveFile = (fileName: string, isExisting: boolean) => {
    if (disabled) return;

    if (isExisting) {
      const updatedExistingFiles = existingFiles.filter(
        (f) => f.nome !== fileName,
      );
      setExistingFiles(updatedExistingFiles);

      // ✅ se quiser que o parent saiba que removeu existente, você pode disparar onAddFile também,
      // mas como existente não está em selectedFiles, geralmente você trata removidos separadamente.
    } else {
      const updatedFiles = selectedFiles.filter((f) => f.name !== fileName);
      setSelectedFiles(updatedFiles);
      onAddFile?.(updatedFiles);
    }
  };

  return (
    <div className="grid w-full gap-3">
      {label && <Label htmlFor={id}>{label}</Label>}

      <div
        {...getRootProps({
          className: mergeClasses(
            "flex flex-col items-center justify-center border-2 border-dashed rounded-md text-center gap-2 p-6",
            disabled
              ? "opacity-60 cursor-not-allowed"
              : isDragActive
                ? "border-primary bg-muted"
                : "border-slate-300",
          ),
        })}
      >
        <>
          <input id={id} {...getInputProps()} />
          <UploadCloudIcon className="h-10 w-10 text-muted-foreground" />
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground">
              Arraste e solte arquivos aqui
            </p>
            <p className="font-semibold text-muted-foreground">ou</p>
          </div>
          <Button size="sm" onClick={open} type="button" disabled={disabled}>
            Procure
          </Button>
        </>
      </div>

      {/* existentes */}
      {existingFiles.length > 0 && (
        <div className="mt-2 grid gap-2">
          {existingFiles.map((file) => (
            <div key={file.nome} className="flex items-center gap-2">
              <UploadImageIcon />
              <span className="text-sm text-muted-foreground">{file.nome}</span>
              <button
                type="button"
                onClick={() => handleRemoveFile(file.nome, true)}
                className="ml-2 text-muted-foreground"
                disabled={disabled}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* novos */}
      {selectedFiles.length > 0 && (
        <div className="mt-2 grid gap-2">
          {selectedFiles.map((file) => (
            <div key={file.name} className="flex items-center gap-2">
              <UploadImageIcon />
              <span className="text-sm text-muted-foreground">{file.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveFile(file.name, false)}
                className="ml-2 text-muted-foreground"
                disabled={disabled}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {notification && <Notification {...notification} />}
    </div>
  );
};

export default DragAndDrop;
