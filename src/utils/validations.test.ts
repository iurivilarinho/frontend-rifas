import { describe, it, expect } from "vitest";
import { isValidCPF } from "./validations";

describe("isValidCPF", () => {
  it("aceita CPFs válidos conhecidos", () => {
    expect(isValidCPF("529.982.247-25")).toBe(true);
    expect(isValidCPF("11144477735")).toBe(true);
  });

  it("rejeita CPFs com todos os dígitos iguais", () => {
    expect(isValidCPF("00000000000")).toBe(false);
    expect(isValidCPF("11111111111")).toBe(false);
    expect(isValidCPF("99999999999")).toBe(false);
  });

  it("rejeita CPFs com tamanho incorreto", () => {
    expect(isValidCPF("123")).toBe(false);
    expect(isValidCPF("123456789012")).toBe(false);
    expect(isValidCPF("")).toBe(false);
  });

  it("rejeita CPFs com dígitos verificadores errados", () => {
    expect(isValidCPF("12345678900")).toBe(false);
    expect(isValidCPF("52998224726")).toBe(false);
  });

  it("aceita CPF com máscara", () => {
    expect(isValidCPF("111.444.777-35")).toBe(true);
  });
});
