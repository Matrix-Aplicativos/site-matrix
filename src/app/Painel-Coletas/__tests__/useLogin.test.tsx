import { renderHook, act } from "@testing-library/react";

import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { setCookie } from "cookies-next";
import { AxiosError } from "axios";
import useLogin from "../hooks/useLogin";

// Mock de axios e cookies
jest.mock("../../shared/axios/axiosInstanceColeta");
jest.mock("cookies-next", () => ({
  setCookie: jest.fn(),
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe("useLogin Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve realizar login com sucesso e salvar tokens nos cookies", async () => {
    const responseData = {
      token: "fake-token",
      refreshToken: "fake-refresh",
      primeiroAcesso: true,
    };
    mockedAxios.post.mockResolvedValueOnce({ data: responseData });

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      const res = await result.current.loginUsuario({
        login: "teste",
        senha: "123456",
      });
      expect(res).toEqual({
        token: "fake-token",
        primeiroAcesso: true,
      });
    });

    expect(result.current.token).toBe("fake-token");
    expect(result.current.refreshToken).toBe("fake-refresh");
    expect(result.current.primeiroAcesso).toBe(true);
    expect(setCookie).toHaveBeenCalledWith(
      "token",
      "fake-token",
      expect.any(Object)
    );
    expect(setCookie).toHaveBeenCalledWith(
      "refreshToken",
      "fake-refresh",
      expect.any(Object)
    );
  });

  it("deve retornar erro ao falhar no login", async () => {
    mockedAxios.post.mockRejectedValueOnce(
      new AxiosError("Unauthorized", "401", undefined, {}, {
        data: { message: "Credenciais inválidas" },
      } as any)
    );

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      const res = await result.current.loginUsuario({
        login: "teste",
        senha: "errado",
      });
      expect(res).toBeNull();
    });

    expect(result.current.error).toBe("Credenciais inválidas");
  });

  it("deve definir primeira senha com sucesso", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { status: 200, message: "Senha definida" },
    });

    const { result } = renderHook(() => useLogin());

    let response: any;
    await act(async () => {
      response = await result.current.definirPrimeiraSenhaUsuario({
        senha: "Senha123!",
        confirmacaoSenha: "Senha123!",
      });
    });

    expect(response).toEqual({ status: 200, message: "Senha definida" });
  });

  it("deve falhar se senha e confirmação não coincidirem", async () => {
    const { result } = renderHook(() => useLogin());

    let response: any;
    await act(async () => {
      response = await result.current.definirPrimeiraSenhaUsuario({
        senha: "123456",
        confirmacaoSenha: "654321",
      });
    });

    expect(response).toBeNull();
    expect(result.current.error).toBe(
      "O campo de confirmação está diferente da senha."
    );
  });

  it("deve falhar se senha for muito curta", async () => {
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.definirPrimeiraSenhaUsuario({
        senha: "123",
        confirmacaoSenha: "123",
      });
    });

    expect(result.current.error).toBe(
      "Sua senha deve conter no mínimo 6 caracteres."
    );
  });

  it("deve falhar se senha for muito fraca", async () => {
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.definirPrimeiraSenhaUsuario({
        senha: "123456",
        confirmacaoSenha: "123456",
      });
    });

    expect(result.current.error).toBe(
      "Sua senha está muito fraca, tente uma senha mais forte."
    );
  });

  it("deve solicitar redefinição de senha com sucesso", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      status: 200,
      data: { message: "Email enviado" },
    });

    const { result } = renderHook(() => useLogin());

    let response: any;
    await act(async () => {
      response = await result.current.solicitarRedefinicaoSenha("teste");
    });

    expect(response).toEqual({ success: true, message: "Email enviado" });
  });

  it("deve retornar erro ao solicitar redefinição de senha", async () => {
    mockedAxios.post.mockRejectedValueOnce(
      new AxiosError("Erro", "400", undefined, {}, {
        data: { message: "Erro ao solicitar" },
      } as any)
    );

    const { result } = renderHook(() => useLogin());

    let response: any;
    await act(async () => {
      response = await result.current.solicitarRedefinicaoSenha("teste");
    });

    expect(response).toEqual({ success: false });
    expect(result.current.error).toBe("Erro ao solicitar");
  });

  it("deve redefinir senha com sucesso", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { status: 200, message: "Senha alterada" },
    });

    const { result } = renderHook(() => useLogin());

    let response: any;
    await act(async () => {
      response = await result.current.redefinirSenha(
        "NovaSenha123!",
        "fake-token"
      );
    });

    expect(response).toEqual({ status: 200, message: "Senha alterada" });
  });

  it("deve falhar ao redefinir senha sem token", async () => {
    delete (window as any).location;
    (window as any).location = { href: "" };

    const { result } = renderHook(() => useLogin());

    let response: any;
    await act(async () => {
      response = await result.current.redefinirSenha("NovaSenha123!", "");
    });

    expect(response).toBeNull();
    expect(window.location.href).toBe("/Painel-Coletas");
  });

  it("deve falhar ao redefinir senha com erro do servidor", async () => {
    mockedAxios.post.mockRejectedValueOnce(
      new AxiosError("Erro", "400", undefined, {}, {
        data: { message: "Erro redefinição" },
      } as any)
    );

    const { result } = renderHook(() => useLogin());

    let response: any;
    await act(async () => {
      response = await result.current.redefinirSenha(
        "NovaSenha123!",
        "fake-token"
      );
    });

    expect(response).toBeNull();
    expect(result.current.error).toBe("Erro redefinição");
  });
});
