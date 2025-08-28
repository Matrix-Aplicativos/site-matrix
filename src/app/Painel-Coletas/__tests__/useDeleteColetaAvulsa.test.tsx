import { renderHook, act } from "@testing-library/react";
import useDeleteColetaAvulsa from "../hooks/useDeleteColetaAvulsa";
import axiosInstance from "../../../app/shared/axios/axiosInstanceColeta";

jest.mock("../../../app/shared/axios/axiosInstanceColeta");

describe("useDeleteColetaAvulsa", () => {
  const mockAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve deletar coleta avulsa com sucesso", async () => {
    mockAxios.delete.mockResolvedValueOnce({ status: 200 });

    const { result } = renderHook(() => useDeleteColetaAvulsa());

    let response: boolean | null = null;

    await act(async () => {
      response = await result.current.deletarColeta(101);
    });

    expect(response).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(mockAxios.delete).toHaveBeenCalledWith("coleta/101");
  });

  it("deve lidar com erro ao deletar coleta avulsa", async () => {
    mockAxios.delete.mockRejectedValueOnce(new Error("Erro na API"));

    const { result } = renderHook(() => useDeleteColetaAvulsa());

    let error: Error | null = null;

    await act(async () => {
      try {
        await result.current.deletarColeta(202);
      } catch (err: any) {
        error = err;
      }
    });

    expect(error).toBeInstanceOf(Error);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toContain("Erro na API");
  });
});
