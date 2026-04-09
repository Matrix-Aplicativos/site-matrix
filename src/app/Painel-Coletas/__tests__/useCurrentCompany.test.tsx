import { renderHook } from "@testing-library/react";
import useCurrentCompany from "../hooks/useCurrentCompany";

describe("useCurrentCompany", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("deve retornar empresa quando existir empresaSelecionada no localStorage", () => {
    localStorage.setItem(
      "empresaSelecionada",
      JSON.stringify({ codEmpresa: 42, nomeFantasia: "Empresa Teste" }),
    );
    const { result } = renderHook(() => useCurrentCompany());
    expect(result.current.empresa?.codEmpresa).toBe(42);
    expect(result.current.loading).toBe(false);
  });

  it("deve retornar empresa null quando localStorage não possuir empresaSelecionada", () => {
    const { result } = renderHook(() => useCurrentCompany());
    expect(result.current.empresa).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("deve retornar empresa null quando JSON estiver inválido", () => {
    localStorage.setItem("empresaSelecionada", "{invalido");
    const { result } = renderHook(() => useCurrentCompany());
    expect(result.current.empresa).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
