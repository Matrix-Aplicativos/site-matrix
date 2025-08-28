import { renderHook, waitFor } from "@testing-library/react";

import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { useRouter } from "next/navigation";
import useGetLoggedUser from "../hooks/useGetLoggedUser";

jest.mock("../../shared/axios/axiosInstanceColeta");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;
const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

describe("useGetLoggedUser", () => {
  const fakeUsuario = {
    codUsuario: 1,
    nome: "Teste",
    cnpjcpf: "12345678901",
    email: "teste@teste.com",
    login: "teste",
    senha: "123",
    cargo: {
      codCargo: 1,
      nome: "Admin",
      dataCadastro: "2025-01-01",
      dataUltimaAlteracao: "2025-01-02",
      ativo: true,
      authority: "ROLE_ADMIN",
    },
    primeiroAcesso: false,
    empresas: [],
    dispostivos: [],
  };

  it("busca usuário com sucesso", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: fakeUsuario });

    const { result } = renderHook(() => useGetLoggedUser(1));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.usuario).toEqual(fakeUsuario);
    expect(result.current.error).toBeNull();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("não chama API se codUsuario for 0", () => {
    renderHook(() => useGetLoggedUser(0));
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it("define erro e redireciona quando API falha", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Falha na API"));

    const { result } = renderHook(() => useGetLoggedUser(2));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.usuario).toBeNull();
    expect(result.current.error).toMatch(/Falha na API/);
    expect(mockPush).toHaveBeenCalledWith("/Login");
  });
});
