import { useEffect, useMemo, useState } from "react";
import { useGetDocumentById } from "@/lib/api/tanstackQuery/document";
import type { Document } from "@/types/document";

interface RifaThumbProps {
  documentId?: number;
  alt?: string;
  className?: string;
}

function bytesToObjectUrl(bytes: number[], contentType: string): string {
  const uint8 = new Uint8Array(bytes);
  const blob = new Blob([uint8], { type: contentType });
  return URL.createObjectURL(blob);
}

function buildImgSrc(doc: Document): string {
  if (Array.isArray(doc.document)) {
    return bytesToObjectUrl(doc.document, doc.contentType);
  }
  return `data:${doc.contentType};base64,${doc.document}`;
}

const RifaThumb = ({ documentId, alt, className }: RifaThumbProps) => {
  const {
    data: doc,
    isLoading,
    isFetching,
  } = useGetDocumentById(documentId ?? null);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const src = useMemo(() => {
    if (!doc) return "";
    return buildImgSrc(doc);
  }, [doc]);

  // se for objectURL, revoga ao trocar/desmontar (evita leak)
  useEffect(() => {
    setImgLoaded(false);

    if (!doc) {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
      return;
    }

    if (Array.isArray(doc.document)) {
      const url = bytesToObjectUrl(doc.document, doc.contentType);
      setObjectUrl(url);
      return;
    }

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(null);
  }, [doc]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const finalSrc = objectUrl ?? src;

  const showLoader = isLoading || isFetching || !imgLoaded;

  return (
    <div className={`relative ${className ?? ""}`}>
      {showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="w-6 h-6 border-2 border-t-transparent border-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Mantém o espaço e só mostra quando carregar */}
      <img
        src={finalSrc}
        alt={alt ?? "Imagem não disponível"}
        className="w-full h-full object-cover"
        style={{ visibility: imgLoaded ? "visible" : "hidden" }}
        onLoad={() => setImgLoaded(true)}
        onError={() => setImgLoaded(true)}
      />
    </div>
  );
};

export default RifaThumb;
