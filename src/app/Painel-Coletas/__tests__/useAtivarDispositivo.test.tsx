import { renderHook, act, waitFor } from "@testing-library/react";
import useAtivarDispositivo from "../hooks/useAtivarDispositivo";
import axiosInstance from "../../../app/shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";

jest.mock("../shared/axios/axiosInstanceColeta");

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe("useAtivarDispositivo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockDispositivo = {
    codDispositivo: "123",
    nomeDispositivo: "Tablet XPTO",
    codEmpresaApi: 1,
    ativo: true,
  };

  it("deve ativar dispositivo com sucesso", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useAtivarDispositivo());

    act(() => {
      result.current.ativarDispositivo(mockDispositivo);
    });

    // loading deve ser true durante a chamada
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/dispositivo/ativar",
      mockDispositivo
    );
    expect(result.current.success).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("deve lidar com erro ao ativar dispositivo (AxiosError)", async () => {
    mockedAxios.post.mockRejectedValueOnce(
      new AxiosError("Falha de rede", "500")
    );

    const { result } = renderHook(() => useAtivarDispositivo());

    await act(async () => {
      await result.current.ativarDispositivo(mockDispositivo);
    });

    expect(result.current.success).toBe(false);
    expect(result.current.error).toContain("Falha de rede");
    expect(result.current.loading).toBe(false);
  });

  it("deve lidar com erro genérico ao ativar dispositivo", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Erro inesperado"));

    const { result } = renderHook(() => useAtivarDispositivo());

    await act(async () => {
      await result.current.ativarDispositivo(mockDispositivo);
    });

    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe(
      "Ocorreu um erro ao ativar o dispositivo."
    );
    expect(result.current.loading).toBe(false);
  });
});
