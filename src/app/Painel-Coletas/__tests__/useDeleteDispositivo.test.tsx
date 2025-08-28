import { renderHook, act } from "@testing-library/react";
import useDeleteDispositivo from "../hooks/useDeleteDispositivo"; 
import axiosInstance from "../../shared/axios/axiosInstanceColeta";

jest.mock("../../shared/axios/axiosInstanceColeta");

describe("useDeleteDispositivo", () => {
  const mockAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve deletar dispositivo com sucesso", async () => {
    mockAxios.delete.mockResolvedValueOnce({ status: 200 });

    const { result } = renderHook(() => useDeleteDispositivo(123));

    await act(async () => {
      await result.current.deleteDispositivo("456");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBe(true);
    expect(result.current.error).toBe(null);
    expect(mockAxios.delete).toHaveBeenCalledWith("/dispositivo/123/456");
  });

  it("deve lidar com erro ao deletar dispositivo", async () => {
    mockAxios.delete.mockRejectedValueOnce(new Error("Erro de API"));

    const { result } = renderHook(() => useDeleteDispositivo(123));

    await act(async () => {
      await result.current.deleteDispositivo("456");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBe(false);
    expect(result.current.error).toContain("Erro de API");
  });
});
