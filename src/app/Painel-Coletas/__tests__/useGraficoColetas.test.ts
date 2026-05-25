import { renderHook, waitFor } from "@testing-library/react";
import useGraficoColetas from "../hooks/useGraficoColetas";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";

jest.mock("../../shared/axios/axiosInstanceColeta");
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe("useGraficoColetas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("não chama API quando parâmetros essenciais não são fornecidos", async () => {
    const { result } = renderHook(() =>
      useGraficoColetas(undefined, null, null, "DIA"),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.dados).toBeNull();
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it("retorna dados com sucesso", async () => {
    const dadosMock = [
      {
        periodo: "2026-04-01",
        totalColetas: 7,
        contagemPorTipo: [{ tipo: "Inventário", quantidade: 7 }],
      },
    ];
    mockedAxios.get.mockResolvedValueOnce({ data: dadosMock });

    const { result } = renderHook(() =>
      useGraficoColetas(1, "2026-04-01", "2026-04-30", "DIA"),
    );
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.dados).toEqual(dadosMock);
    expect(mockedAxios.get).toHaveBeenCalledWith("/coleta/grafico/1", {
      params: expect.any(URLSearchParams),
    });
  });

  it("retorna erro quando a API falha", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Falha API"));

    const { result } = renderHook(() =>
      useGraficoColetas(1, "2026-04-01", "2026-04-30", "MES"),
    );
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.dados).toBeNull();
    expect(result.current.error).toMatch(/Falha API/i);
  });
});
