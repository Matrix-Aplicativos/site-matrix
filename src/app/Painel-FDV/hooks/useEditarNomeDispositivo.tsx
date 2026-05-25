import { useCallback, useState } from "react";
import { AxiosError } from "axios";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";

interface UseEditarNomeDispositivoHook {
  loading: boolean;
  error: string | null;
  success: boolean;
  editarNomeDispositivo: (params: {
    codEmpresa: number;
    codDispositivo: string;
    nomeDispositivo: string;
  }) => Promise<void>;
}

const useEditarNomeDispositivo = (): UseEditarNomeDispositivoHook => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const editarNomeDispositivo = useCallback(
    async ({
      codEmpresa,
      codDispositivo,
      nomeDispositivo,
    }: {
      codEmpresa: number;
      codDispositivo: string;
      nomeDispositivo: string;
    }) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(false);

        await axiosInstance.patch(
          `/dispositivo/${codEmpresa}/${codDispositivo}/${encodeURIComponent(nomeDispositivo)}`
        );

        setSuccess(true);
      } catch (err) {
        setError(
          err instanceof AxiosError
            ? err.message
            : "Ocorreu um erro ao editar o nome do dispositivo."
        );
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, error, success, editarNomeDispositivo };
};

export default useEditarNomeDispositivo;
