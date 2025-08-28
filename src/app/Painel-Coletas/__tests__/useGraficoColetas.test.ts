import { renderHook } from "@testing-library/react";
import useGraficoColetas from "../hooks/useGraficoColetas";

describe("useGraficoColetas", () => {
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth();

  it("retorna vazio quando coletas é null", () => {
    const { result } = renderHook(() => useGraficoColetas(null, "mensal"));

    expect(result.current.labels).toEqual([]);
    expect(result.current.datasets).toEqual([]);
  });

  it("retorna labels corretos para view mensal", () => {
    const { result } = renderHook(() => useGraficoColetas([], "mensal"));

    const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
    expect(result.current.labels.length).toBe(diasNoMes);
  });

  it("retorna labels corretos para view anual", () => {
    const { result } = renderHook(() => useGraficoColetas([], "anual"));

    expect(result.current.labels).toEqual([
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ]);
  });

  it("contabiliza coletas corretamente no modo mensal", () => {
    const hoje = new Date();
    const dia = hoje.getDate();

    const coletas = [
      { dataCadastro: new Date(anoAtual, mesAtual, dia).toISOString() },
      { dataCadastro: new Date(anoAtual, mesAtual, dia).toISOString() },
    ];

    const { result } = renderHook(() => useGraficoColetas(coletas, "mensal"));

    expect(result.current.datasets[0].data[dia - 1]).toBe(2);
  });

  it("contabiliza coletas corretamente no modo anual", () => {
    const coletas = [
      { dataCadastro: new Date(anoAtual, 0, 10).toISOString() }, // Jan
      { dataCadastro: new Date(anoAtual, 0, 15).toISOString() }, // Jan
      { dataCadastro: new Date(anoAtual, 5, 5).toISOString() }, // Jun
    ];

    const { result } = renderHook(() => useGraficoColetas(coletas, "anual"));

    expect(result.current.datasets[0].data[0]).toBe(2); // Janeiro
    expect(result.current.datasets[0].data[5]).toBe(1); // Junho
  });

  it("ignora datas inválidas ou de anos diferentes", () => {
    const coletas = [
      { dataCadastro: "data-invalida" },
      { dataCadastro: new Date(anoAtual - 1, mesAtual, 1).toISOString() },
    ];

    const { result } = renderHook(() => useGraficoColetas(coletas, "anual"));

    // Nenhum dado deve ter sido contabilizado
    expect(result.current.datasets[0].data.reduce((a, b) => a + b, 0)).toBe(0);
  });
});
