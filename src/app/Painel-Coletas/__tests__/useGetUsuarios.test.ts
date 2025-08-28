import { renderHook, waitFor } from "@testing-library/react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import useGetUsuarios from "../hooks/useGetUsuarios";

jest.mock("../../shared/axios/axiosInstanceColeta");
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe("useGetUsuarios", () => {
  const codEmpresa = 1;
  const pagina = 1;
  const porPagina = 10;

  it("retorna usuários quando a API responde com sucesso (data direto)", async () => {
    const fakeUsuarios = [{ id: 1, nome: "João" }];
    mockedAxios.get.mockResolvedValueOnce({ data: fakeUsuarios });

    const { result } = renderHook(() =>
      useGetUsuarios(codEmpresa, pagina, porPagina)
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.usuarios).toEqual(fakeUsuarios);
    expect(result.current.error).toBeNull();
  });

  it("retorna usuários quando a API responde com sucesso (data dentro de .data)", async () => {
    const fakeUsuarios = [{ id: 2, nome: "Maria" }];
    mockedAxios.get.mockResolvedValueOnce({ data: { data: fakeUsuarios } });

    const { result } = renderHook(() =>
      useGetUsuarios(codEmpresa, pagina, porPagina)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.usuarios).toEqual(fakeUsuarios);
    expect(result.current.error).toBeNull();
  });

  it("retorna erro quando formato de dados for inválido", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { data: { invalido: true } },
    });

    const { result } = renderHook(() =>
      useGetUsuarios(codEmpresa, pagina, porPagina)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.usuarios).toBeNull();
    expect(result.current.error).toMatch(/Formato de dados inválido/);
  });

  it("retorna erro quando a API falha", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Falha na API"));

    const { result } = renderHook(() =>
      useGetUsuarios(codEmpresa, pagina, porPagina)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.usuarios).toBeNull();
    expect(result.current.error).toMatch(/Falha na API/);
  });

  it("não chama API se codEmpresa não for informado", () => {
    renderHook(() => useGetUsuarios(0, pagina, porPagina));
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });
});
