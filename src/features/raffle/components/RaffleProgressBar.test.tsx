import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RaffleProgressBar } from "./RaffleProgressBar";

describe("RaffleProgressBar", () => {
  it("renderiza o label", () => {
    render(<RaffleProgressBar label="Vendido" porcentagem={42} />);
    expect(screen.getByText("Vendido")).toBeInTheDocument();
  });

  it("aplica a porcentagem como largura no preenchimento", () => {
    const { container } = render(<RaffleProgressBar label="Vendido" porcentagem={75} />);
    const fill = container.querySelector(".bg-primary") as HTMLDivElement;
    expect(fill).not.toBeNull();
    expect(fill.getAttribute("style")).toContain("width: 75%");
  });

  it("aceita porcentagem zero", () => {
    const { container } = render(<RaffleProgressBar label="Sem vendas" porcentagem={0} />);
    const fill = container.querySelector(".bg-primary") as HTMLDivElement;
    expect(fill.getAttribute("style")).toContain("width: 0%");
  });

  it("limita porcentagem a no máximo 100", () => {
    const { container } = render(<RaffleProgressBar porcentagem={250} />);
    const fill = container.querySelector(".bg-primary") as HTMLDivElement;
    expect(fill.getAttribute("style")).toContain("width: 100%");
  });
});
