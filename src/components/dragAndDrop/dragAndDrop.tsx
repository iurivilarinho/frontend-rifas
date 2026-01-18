import { Accept, useDropzone } from "react-dropzone";
import { Notification, NotificationProps } from "../input/notification";
import { mergeClasses } from "@/lib/mergeClasses";
import UploadCloudIcon from "@/assets/icons/uploadCloud";
import UploadImageIcon from "@/assets/icons/uploadImageIcon";
import { Button } from "../button/button";
import { useState, useEffect } from "react";
import CloseIcon from "@/assets/icons/closeIcon";
import { Label } from "../input/Label";

// Aceita tanto arquivos novos (File) quanto arquivos do backend (Document)
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
  initialFiles?: Document[]; // Arquivos iniciais
}

const DragAndDrop = ({
  id,
  label,
  onAddFile,
  acceptedFileTypes,
  notification,
  initialFiles = [], // Inicializa como array vazio por padrão
}: DragAndDropProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<Document[]>(initialFiles);

  useEffect(() => {
    setExistingFiles(initialFiles); // Atualiza os arquivos existentes
  }, [initialFiles]);

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const updatedFiles = [...selectedFiles, ...acceptedFiles]; // Adiciona os novos arquivos
      setSelectedFiles(updatedFiles);
      if (onAddFile) {
        onAddFile(updatedFiles);
      }
    },
    noClick: true,
    accept: acceptedFileTypes ?? {},
  });

  const handleRemoveFile = (fileName: string, isExisting: boolean) => {
    if (isExisting) {
      // Remove um arquivo existente
      const updatedExistingFiles = existingFiles.filter(
        (file) => file.nome !== fileName,
      );
      setExistingFiles(updatedExistingFiles);
    } else {
      // Remove um arquivo novo
      const updatedFiles = selectedFiles.filter(
        (file) => file.name !== fileName,
      );
      setSelectedFiles(updatedFiles);
      if (onAddFile) {
        onAddFile(updatedFiles); // Atualiza a lista de arquivos novos
      }
    }
  };

  return (
    <div className="grid w-full gap-3">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div
        {...getRootProps({
          className: mergeClasses(
            "flex flex-col items-center justify-center border-2 border-dashed rounded-md text-center gap-2 p-6",
            isDragActive ? "border-primary bg-muted" : "border-slate-300",
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
          <Button size="sm" onClick={open} type="button">
            Procure
          </Button>
        </>
      </div>

      {/* Exibindo arquivos existentes */}
      {existingFiles.length > 0 && (
        <div className="mt-2 grid gap-2">
          {existingFiles.map((file) => (
            <div key={file.nome} className="flex items-center gap-2">
              <UploadImageIcon />
              <span className="text-sm text-muted-foreground">{file.nome}</span>
              <button
                type="button"
                onClick={() => handleRemoveFile(file.nome, true)} // Arquivo existente
                className="ml-2 text-muted-foreground"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Exibindo arquivos novos */}
      {selectedFiles.length > 0 && (
        <div className="mt-2 grid gap-2">
          {selectedFiles.map((file) => (
            <div key={file.name} className="flex items-center gap-2">
              <UploadImageIcon />
              <span className="text-sm text-muted-foreground">{file.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveFile(file.name, false)} // Arquivo novo
                className="ml-2 text-muted-foreground"
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
