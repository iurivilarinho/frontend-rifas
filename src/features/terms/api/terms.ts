export interface TermsVersion {
  id: number;
  version: number;
  title: string;
  content: string;
  publishedAt: string;
  publishedBy?: string | null;
}

export interface TermsStatus {
  requiresAcceptance: boolean;
  current: TermsVersion | null;
  acceptedVersion?: number | null;
  acceptedAt?: string | null;
}

export interface PublishTermsPayload {
  title: string;
  content: string;
}
