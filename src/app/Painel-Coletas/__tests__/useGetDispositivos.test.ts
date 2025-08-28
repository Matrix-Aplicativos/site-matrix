import { renderHook, waitFor, act } from "@testing-library/react";

import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import useGetDispositivos from "../hooks/useGetDispositivos";

jest.mock("../../shared/axios/axiosInstanceColeta");
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe("useGetDispositivos", () => {
  const codEmpresa = 1;
  const dispositivosMock = [
    {
      codDispositivo: "abc123",
      nomeDispositivo: "Tablet",
      codEmpresaApi: 1,
      ativo: true,
    },
    {
      codDispositivo: "def456",
      nomeDispositivo: "Celular",
      codEmpresaApi: 1,
      ativo: false,
    },
  ];

  it("busca dispositivos com sucesso (estrutura com .dados)", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { dados: dispositivosMock, totalItens: 10 },
    });

    const { result } = renderHook(() => useGetDispositivos(codEmpresa, 1, 5));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.dispositivos).toEqual(dispositivosMock);
    expect(result.current.totalPaginas).toBe(2); // 10 itens / 5 por página
    expect(result.current.error).toBeNull();
  });

  it("busca dispositivos com sucesso (resposta como array direto)", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: dispositivosMock,
    });

    const { result } = renderHook(() => useGetDispositivos(codEmpresa, 1, 5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.dispositivos).toEqual(dispositivosMock);
    expect(result.current.totalPaginas).toBe(1);
  });

  it("retorna erro quando API falha", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Falha na API"));

    const { result } = renderHook(() => useGetDispositivos(codEmpresa, 1, 5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.dispositivos).toBeNull();
    expect(result.current.error).toMatch(/Falha na API/);
  });

  it("não chama API se enabled for false", () => {
    renderHook(() =>
      useGetDispositivos(codEmpresa, 1, 5, undefined, undefined, false)
    );
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it("permite refazer a busca manualmente com refetch", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { dados: dispositivosMock, totalItens: 5 },
    });

    const { result } = renderHook(() => useGetDispositivos(codEmpresa, 1, 5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.dispositivos).toEqual(dispositivosMock);

    // simula chamada manual
    mockedAxios.get.mockResolvedValueOnce({
      data: { dados: [dispositivosMock[0]], totalItens: 1 },
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.dispositivos).toEqual([dispositivosMock[0]]);
    expect(result.current.totalPaginas).toBe(1);
  });
});
