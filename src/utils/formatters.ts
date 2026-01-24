export const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const maskCPF = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);

  // 000.000.000-00
  const p1 = digits.slice(0, 3);
  const p2 = digits.slice(3, 6);
  const p3 = digits.slice(6, 9);
  const p4 = digits.slice(9, 11);

  let out = p1;
  if (p2) out += `.${p2}`;
  if (p3) out += `.${p3}`;
  if (p4) out += `-${p4}`;
  return out;
};

export const maskPhoneBR = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);

  // (00) 00000-0000  (11 dígitos) ou (00) 0000-0000 (10 dígitos)
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);

  const isMobile = rest.length > 8; // 9 dígitos após DDD
  const first = isMobile ? rest.slice(0, 5) : rest.slice(0, 4);
  const last = isMobile ? rest.slice(5, 9) : rest.slice(4, 8);

  let out = "";
  if (ddd) out += `(${ddd}`;
  if (ddd.length === 2) out += `) `;
  out += first;
  if (last) out += `-${last}`;
  return out;
};
