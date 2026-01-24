import { useEffect, useMemo, useState } from "react";
import { useGetDocumentById } from "@/lib/api/tanstackQuery/document";
import type { Document } from "@/types/document";
import Loading from "../Loading";

interface DisplayImageProps {
  documentId: number;
  alt?: string;
  className?: string; // opcional para reutilizar em thumb/carousel
}

function bytesToObjectUrl(bytes: number[], contentType: string): string {
  const uint8 = new Uint8Array(bytes);
  const blob = new Blob([uint8], { type: contentType });
  return URL.createObjectURL(blob);
}

function buildImgSrc(doc: Document): { src: string; isObjectUrl: boolean } {
  if (Array.isArray(doc.document)) {
    return {
      src: bytesToObjectUrl(doc.document, doc.contentType),
      isObjectUrl: true,
    };
  }
  return {
    src: `data:${doc.contentType};base64,${doc.document}`,
    isObjectUrl: false,
  };
}

const DisplayImage = ({ documentId, alt, className }: DisplayImageProps) => {
  const {
    data: doc,
    isLoading,
    isFetching,
    isError,
  } = useGetDocumentById(documentId);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const built = useMemo(() => {
    if (!doc) return { src: "", isObjectUrl: false };
    return buildImgSrc(doc);
  }, [doc]);

  // controla objectURL + reset do carregamento
  useEffect(() => {
    setImgLoaded(false);

    if (!doc) {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
      return;
    }

    if (built.isObjectUrl) {
      // built.src já é object URL
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setObjectUrl(built.src);
      return;
    }

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(null);
  }, [doc, built.src, built.isObjectUrl]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const finalSrc = objectUrl ?? built.src;
  const showLoader = isLoading || isFetching || !imgLoaded;

  return (
    <div
      className={`relative flex justify-center items-center ${className ?? ""}`}
    >
      {showLoader && <Loading />}

      {isError ? (
        <div className="w-80 h-64 flex items-center justify-center bg-slate-200 rounded-md">
          <p className="text-sm">Falha ao carregar imagem</p>
        </div>
      ) : (
        <img
          src={finalSrc}
          alt={alt ?? doc?.name ?? "Imagem"}
          className="w-80 h-64 object-cover rounded-md"
          style={{ visibility: imgLoaded ? "visible" : "hidden" }}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(true)}
        />
      )}
    </div>
  );
};

export default DisplayImage;
