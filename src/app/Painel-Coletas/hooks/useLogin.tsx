import { useState } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { setCookie } from "cookies-next";
import { AxiosError } from "axios";

interface LoginCredenciais {
  login: string;
  senha: string;
}

interface UseLoginHook {
  loginUsuario: (credenciais: LoginCredenciais) => Promise<string | null>;
  definirPrimeiraSenhaUsuario(
    credenciais: LoginCredenciais
  ): Promise<{ status: number; id: string; message: string } | null>;
  solicitarRedefinicaoSenha: (login: string) => Promise<any | null>;
  redefinirSenha: (
    senha: string,
    token: string
  ) => Promise<any | null>;
  loading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
  statusIdentificacao: Number | null;
}

const useLogin = (): UseLoginHook => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [statusIdentificacao, setStatusIdentificacao] = useState<Number | null>(
    null
  );

  const loginUsuario = async (
    credenciais: LoginCredenciais
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);
    setToken(null);

    try {
      const response = await axiosInstance.post("/auth/login", credenciais);
      const { token, refreshToken } = response.data;
      setToken(token);
      setRefreshToken(refreshToken);
      setCookie("token", token, {
        maxAge: 60 * 10,
        secure: process.env.NODE_ENV === "production",
      });
      setCookie("refreshToken", refreshToken, {
        maxAge: 60 * 60,
        secure: process.env.NODE_ENV === "production",
      });

      console.log("Logou");
      return token;
    } catch (err) {
      console.log(err);
      setError(
        err instanceof AxiosError
          ? err.response?.data.message
          : "Ocorreu um erro ao realizar o login."
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const definirPrimeiraSenhaUsuario = async (
    credenciais: LoginCredenciais
  ): Promise<{ status: number; id: string; message: string } | null> => {
    setLoading(true);
    setError(null);
    setStatusIdentificacao(null);
    try {
      const response = await axiosInstance.post(
        "/auth/definir-senha",
        { login: credenciais.login, senha: credenciais.senha },
        { withCredentials: true }
      );
      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (err) {
      setError("Ocorreu um erro ao definir a senha.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const solicitarRedefinicaoSenha = async (login: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.post(
        `/v1/auth/solicitar-redefinicao/${login}`
      );

      return response.data;
    } catch (error) {
      setError(
        error instanceof AxiosError
          ? error.response?.data.message
          : "Erro ao solicitar redefinição de senha"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const redefinirSenha = async (senha: string, token: string) => {
    try {
      // Verifica se token está vazio
      if (!token) {
        window.location.href = "/Painel-Coletas"; 
        return null;
      }

      setLoading(true);
      setError(null);

      const payload = { token, senha };
      const response = await axiosInstance.post(
        "/v1/auth/recuperar-senha",
        payload
      );

      return response.data;
    } catch (error) {
      setError(
        error instanceof AxiosError
          ? error.response?.data.message
          : "Erro ao redefinir senha"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loginUsuario,
    definirPrimeiraSenhaUsuario,
    loading,
    error,
    token,
    solicitarRedefinicaoSenha,
    redefinirSenha,
    refreshToken,
    statusIdentificacao,
  };
};

export default useLogin;
