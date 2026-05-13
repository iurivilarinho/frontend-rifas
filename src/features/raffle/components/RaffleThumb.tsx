import { useState } from "react";
import { ImageOff } from "lucide-react";

import { cn } from "@/lib/mergeClasses";
import { createDocumentUrl } from "@/features/document";

type RaffleThumbProps = {
  documentId?: number;
  alt?: string;
  className?: string;
};

export const RaffleThumb = ({ documentId, alt, className }: RaffleThumbProps) => {
  const src = createDocumentUrl(documentId);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-muted text-muted-foreground",
          className,
        )}
      >
        <ImageOff className="h-6 w-6" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt ?? "Imagem da rifa"}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
      className={cn("h-full w-full object-cover", className)}
    />
  );
};
