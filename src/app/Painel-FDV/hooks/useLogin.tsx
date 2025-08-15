import { useState } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import { setCookie } from "cookies-next";
import { AxiosError } from "axios";

// Interfaces
interface LoginCredenciais {
  login: string;
  senha: string;
}

interface DefinirPrimeiraSenhaCredenciais {
  senha: string;
  confirmacaoSenha: string;
}

interface LoginResultado {
  token: string;
  primeiroAcesso: boolean;
}

interface UseLoginHook {
  loginUsuario: (
    credenciais: LoginCredenciais
  ) => Promise<LoginResultado | null>;
  definirPrimeiraSenhaUsuario: (
    credenciais: DefinirPrimeiraSenhaCredenciais
  ) => Promise<{ status?: number; id?: string; message?: string } | null>;
  solicitarRedefinicaoSenha: (login: string) => Promise<any | null>;
  redefinirSenha: (senha: string, token: string) => Promise<any | null>;
  loading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
  primeiroAcesso: boolean;
}

// Helper
const verificarForcaSenha = (senha: string) => {
  let pontuacao = 0;
  if (senha.length >= 8) pontuacao++;
  if (/[A-Z]/.test(senha)) pontuacao++;
  if (/[a-z]/.test(senha)) pontuacao++;
  if (/\d/.test(senha)) pontuacao++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(senha)) pontuacao++;
  if (pontuacao <= 2) return 1;
  if (pontuacao === 3) return 2;
  return 3;
};

const useLogin = (): UseLoginHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [primeiroAcesso, setPrimeiroAcesso] = useState(false);

  const loginUsuario = async (credenciais: LoginCredenciais) => {
    setLoading(true);
    setError(null);
    setToken(null);

    try {
      const response = await axiosInstance.post("/auth/login", credenciais);
      const { token, refreshToken, primeiroAcesso } = response.data;

      setToken(token);
      setRefreshToken(refreshToken);
      setPrimeiroAcesso(!!primeiroAcesso);

      setCookie("token", token, {
        maxAge: 60 * 10,
        secure: process.env.NODE_ENV === "production",
      });
      setCookie("refreshToken", refreshToken, {
        maxAge: 60 * 60,
        secure: process.env.NODE_ENV === "production",
      });

      return { token, primeiroAcesso };
    } catch (err) {
      console.error(err);
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
    credenciais: DefinirPrimeiraSenhaCredenciais
  ) => {
    setLoading(true);
    setError(null);

    const { senha, confirmacaoSenha } = credenciais;

    if (senha !== confirmacaoSenha) {
      setError("O campo de confirmação está diferente da senha.");
      setLoading(false);
      return null;
    }
    if (senha.length < 6) {
      setError("Sua senha deve conter no mínimo 6 caracteres.");
      setLoading(false);
      return null;
    }
    const forca = verificarForcaSenha(senha);
    if (forca < 2) {
      setError("Sua senha está muito fraca, tente uma senha mais forte.");
      setLoading(false);
      return null;
    }

    try {
      const response = await axiosInstance.post(
        "/usuario/definir-senha",
        { senha },
        { withCredentials: true }
      );
      return response.data;
    } catch (err) {
      console.error(err);
      setError(
        err instanceof AxiosError
          ? err.response?.data.message
          : "Ocorreu um erro ao definir a senha."
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const solicitarRedefinicaoSenha = async (login: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post("/auth/solicitar-recuperacao", {
        login,
      });
      return response.data;
    } catch (error) {
      console.error(error);
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
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        window.location.href = "/Painel-FDV";
        return null;
      }
      const response = await axiosInstance.post("/auth/recuperar-senha", {
        token,
        senha,
      });
      return response.data;
    } catch (error) {
      console.error(error);
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
    solicitarRedefinicaoSenha,
    redefinirSenha,
    loading,
    error,
    token,
    refreshToken,
    primeiroAcesso,
  };
};

export default useLogin;
