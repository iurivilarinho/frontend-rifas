import { describe, it, expect } from "vitest";
import { maskCPF, maskPhoneBR, onlyDigits } from "./formatters";

describe("onlyDigits", () => {
  it("remove tudo que não for dígito", () => {
    expect(onlyDigits("(11) 99999-9999")).toBe("11999999999");
    expect(onlyDigits("abc123def456")).toBe("123456");
    expect(onlyDigits("")).toBe("");
  });
});

describe("maskCPF", () => {
  it("formata CPF completo", () => {
    expect(maskCPF("12345678909")).toBe("123.456.789-09");
  });

  it("formata parcialmente conforme dígitos vão chegando", () => {
    expect(maskCPF("123")).toBe("123");
    expect(maskCPF("1234")).toBe("123.4");
    expect(maskCPF("1234567")).toBe("123.456.7");
  });

  it("limita a 11 dígitos", () => {
    expect(maskCPF("123456789091234")).toBe("123.456.789-09");
  });

  it("ignora caracteres não numéricos", () => {
    expect(maskCPF("abc123.456.789-09xyz")).toBe("123.456.789-09");
  });
});

describe("maskPhoneBR", () => {
  it("formata celular com 11 dígitos", () => {
    expect(maskPhoneBR("11999999999")).toBe("(11) 99999-9999");
  });

  it("formata fixo com 10 dígitos", () => {
    expect(maskPhoneBR("1133334444")).toBe("(11) 3333-4444");
  });

  it("formata parcialmente", () => {
    expect(maskPhoneBR("11")).toBe("(11) ");
    expect(maskPhoneBR("11999")).toBe("(11) 999");
  });
});
