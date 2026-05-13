import { apiBaseUrl } from "@/api/clients/apiClient";
import type { DocumentApiDto } from "./api/dtos/document";

/**
 * URL pública para o conteúdo binário de um documento.
 * Pode ser usada diretamente em `<img src>`, `background-image`, `<a href>`, etc.
 * O navegador cacheia normalmente (Cache-Control: max-age=30d definido no backend).
 */
export const createDocumentUrl = (
  documentId?: number | string | null,
): string | undefined => {
  if (documentId === null || documentId === undefined || documentId === "") {
    return undefined;
  }
  return `${apiBaseUrl}/documents/${documentId}/content`;
};

/**
 * Aceita tanto um id quanto um objeto DocumentApiDto (com `id` ou já com `document` base64).
 * Prefere a URL pública sempre que houver `id`. Cai pra data-URL como fallback.
 */
export const resolveDocumentSrc = (
  doc?:
    | DocumentApiDto
    | { id?: number | string | null }
    | number
    | string
    | null,
): string | undefined => {
  if (doc === null || doc === undefined) return undefined;

  if (typeof doc === "number" || typeof doc === "string") {
    return createDocumentUrl(doc);
  }

  if (doc.id !== undefined && doc.id !== null) {
    return createDocumentUrl(doc.id);
  }

  const fullDoc = doc as Partial<DocumentApiDto>;
  if (fullDoc.document && fullDoc.contentType) {
    if (Array.isArray(fullDoc.document)) {
      // Array de bytes (legacy) — converte pra data URL.
      const u8 = new Uint8Array(fullDoc.document as unknown as number[]);
      const blob = new Blob([u8], { type: fullDoc.contentType });
      return URL.createObjectURL(blob);
    }
    return `data:${fullDoc.contentType};base64,${fullDoc.document}`;
  }

  return undefined;
};
