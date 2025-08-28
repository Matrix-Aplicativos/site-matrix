import { renderHook, waitFor, act } from "@testing-library/react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import useGetColetas from "../hooks/useGetColetas";

jest.mock("../../shared/axios/axiosInstanceColeta");
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe("useGetColetas", () => {
  const codEmpresa = 1;
  const coletasMock = [
    { codConferencia: 101, descricao: "Coleta A" },
    { codConferencia: 102, descricao: "Coleta B" },
  ];

  it("busca coletas com sucesso (estrutura com .dados)", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { dados: coletasMock, totalItens: 20 },
    });

    const { result } = renderHook(() =>
      useGetColetas(codEmpresa, 1, 10, "descricao", "asc")
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.coletas).toEqual(coletasMock);
    expect(result.current.totalPaginas).toBe(2); // 20 / 10
    expect(result.current.error).toBeNull();
  });

  it("busca coletas com sucesso (resposta array direto)", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: coletasMock,
    });

    const { result } = renderHook(() => useGetColetas(codEmpresa, 1, 5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.coletas).toEqual(coletasMock);
    expect(result.current.totalPaginas).toBe(1);
  });

  it("adiciona filtro tipo quando for string", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { dados: coletasMock, totalItens: 2 },
    });

    renderHook(() =>
      useGetColetas(codEmpresa, 1, 5, undefined, undefined, "entrada")
    );

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining("tipo=entrada")
    );
  });

  it("adiciona múltiplos filtros tipo quando for array", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { dados: coletasMock, totalItens: 2 },
    });

    renderHook(() =>
      useGetColetas(codEmpresa, 1, 5, undefined, undefined, [
        "entrada",
        "saida",
      ])
    );

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringMatching(/tipo=entrada.*tipo=saida/)
    );
  });

  it("retorna erro quando API falha", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Falha API"));

    const { result } = renderHook(() => useGetColetas(codEmpresa, 1, 5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.coletas).toBeNull();
    expect(result.current.error).toMatch(/Falha API/);
  });

  it("não chama API quando enabled=false", () => {
    renderHook(() =>
      useGetColetas(codEmpresa, 1, 5, undefined, undefined, undefined, false)
    );
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it("permite refazer a busca manualmente com refetch", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { dados: coletasMock, totalItens: 2 },
    });

    const { result } = renderHook(() => useGetColetas(codEmpresa, 1, 5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.coletas).toEqual(coletasMock);

    // refetch manual
    mockedAxios.get.mockResolvedValueOnce({
      data: { dados: [coletasMock[0]], totalItens: 1 },
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.coletas).toEqual([coletasMock[0]]);
    expect(result.current.totalPaginas).toBe(1);
  });
});
