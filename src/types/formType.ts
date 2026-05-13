export const FORM_TYPES = ["create", "edit", "view"] as const;
export type FormType = (typeof FORM_TYPES)[number];

export const isFormType = (v: unknown): v is FormType =>
  typeof v === "string" && (FORM_TYPES as readonly string[]).includes(v);
