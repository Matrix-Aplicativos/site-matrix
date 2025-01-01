import { useState } from "react";
import axiosInstance from "./axiosInstance";

interface LoginCredenciais {
  login: string;
  senha: string;
}

interface UseLoginHook {
  loginUsuario: (credenciais: LoginCredenciais) => Promise<string | null>;
  loading: boolean;
  error: string | null;
  token: string | null;
}

const useLogin = (): UseLoginHook => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const loginUsuario = async (credenciais: LoginCredenciais): Promise<string | null> => {
    setLoading(true);
    setError(null);
    setToken(null);

    try {
      const response = await axiosInstance.post("/auth/login/autenticacao", credenciais);
      const { token } = response.data; 
      setToken(token);
      return token;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocorreu um erro ao realizar o login."
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loginUsuario, loading, error, token };
};

export default useLogin;