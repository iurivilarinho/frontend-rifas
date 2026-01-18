const FORM_TYPES = ["create", "edit", "view"] as const;
type FormType = (typeof FORM_TYPES)[number];

function isFormType(v: unknown): v is FormType {
  return typeof v === "string" && (FORM_TYPES as readonly string[]).includes(v);
}
