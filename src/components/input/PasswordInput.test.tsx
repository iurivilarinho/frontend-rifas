import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PasswordInput } from "./PasswordInput";

describe("PasswordInput", () => {
  it("has one toggle that reveals the field and hides it again on submit", () => {
    render(
      <form onSubmit={(event) => event.preventDefault()}>
        <PasswordInput id="pw" aria-label="Senha do teste" />
      </form>,
    );
    const field = screen.getByLabelText("Senha do teste");
    const toggle = screen.getByRole("button", { name: "Mostrar senha" });

    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(toggle).toHaveAttribute("aria-controls", "pw");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(field).toHaveAttribute("type", "password");

    fireEvent.click(toggle);
    expect(field).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar senha" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.submit(field.closest("form") as HTMLFormElement);
    expect(field).toHaveAttribute("type", "password");
  });
});
