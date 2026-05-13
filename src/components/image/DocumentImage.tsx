import { useState } from "react";
import { ImageOff } from "lucide-react";

import { cn } from "@/lib/mergeClasses";
import { createDocumentUrl } from "@/features/document";

type DocumentImageProps = {
  documentId?: number;
  alt?: string;
  className?: string;
};

export const DocumentImage = ({ documentId, alt, className }: DocumentImageProps) => {
  const src = createDocumentUrl(documentId);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "flex h-full min-h-40 w-full items-center justify-center bg-muted text-muted-foreground",
          className,
        )}
      >
        <ImageOff className="h-8 w-8" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt ?? "Imagem"}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
      className={cn("h-full w-full object-cover", className)}
    />
  );
};
