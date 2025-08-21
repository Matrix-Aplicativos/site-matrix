import { useState } from "react";
import axios, { AxiosError } from "axios";

interface UseRedefinirSenhaHook {
  redefinirSenha: (senha: string, token: string) => Promise<any | null>;
  loading: boolean;
  error: string | null;
}

const useRedefinirSenha = (): UseRedefinirSenhaHook => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_COLETA_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const redefinirSenha = async (senha: string, token: string) => {
    if (!token) {
      window.location.href = "/";
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/recuperar-senha", {
        token,
        senha,
      });
      return response.data;
    } catch (err) {
      console.error(err);
      setError(
        err instanceof AxiosError
          ? err.response?.data?.message || "Token inválido ou expirado"
          : "Erro ao redefinir senha"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    redefinirSenha,
    loading,
    error,
  };
};

export default useRedefinirSenha;
