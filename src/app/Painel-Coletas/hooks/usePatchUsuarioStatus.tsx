import { useState, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";
import { getCookie } from "cookies-next";

interface UsePatchUsuarioStatusHook {
  loading: boolean;
  error: string | null;
  success: boolean;
  toggleStatus: (codUsuario: number, novoStatus: boolean) => Promise<boolean>;
}

const usePatchUsuarioStatus = (): UsePatchUsuarioStatusHook => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const toggleStatus = useCallback(
    async (codUsuario: number, novoStatus: boolean) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(false);

        const token = getCookie("token");

        await axiosInstance.patch(
          `/usuario/${codUsuario}`,
          { ativo: novoStatus },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSuccess(true);
        return true; // Retorna true indicando que deu certo
      } catch (err) {
        const errorMessage =
          err instanceof AxiosError
            ? err.response?.data?.message || err.message
            : "Ocorreu um erro ao atualizar o status do usuário.";

        setError(errorMessage);
        setSuccess(false);
        return false; // Retorna false indicando falha
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, error, success, toggleStatus };
};

export default usePatchUsuarioStatus;
