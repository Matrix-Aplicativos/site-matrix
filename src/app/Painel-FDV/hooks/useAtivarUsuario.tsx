import { useState, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import { AxiosError } from "axios";

interface useAtivarUsuarioHook {
  loading: boolean;
  error: string | null;
  success: boolean;
  ativarUsuario: (
    codUsuario: string,
    ativo: boolean,
    onSuccess?: (codUsuario: string) => void
  ) => Promise<void>;
}

const useAtivarUsuario = (): useAtivarUsuarioHook => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const ativarUsuario = useCallback(
    async (
      codUsuario: string,
      ativo: boolean,
      onSuccess?: (codUsuario: string) => void
    ) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(false);

        await axiosInstance.patch(`/usuario/${codUsuario}`, { ativo });

        setSuccess(true);
        if (onSuccess) {
          onSuccess(codUsuario);
        }
      } catch (err) {
        setError(
          err instanceof AxiosError
            ? err.response?.data?.message || err.message
            : "Ocorreu um erro ao ativar/inativar o usuário."
        );
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, error, success, ativarUsuario };
};

export default useAtivarUsuario;
