import { useState, useCallback } from "react";
import axiosInstance from "./axiosInstanceFDV";
import { AxiosError } from "axios";

interface DispositivoAtivacao {
  codDispositivo: string;
  nomeDispositivo: string;
  codEmpresaApi: number;
  ativo: boolean;
}

interface useAtivarDispositivoHook {
  loading: boolean;
  error: string | null;
  success: boolean;
  ativarDispositivo: (dados: DispositivoAtivacao) => Promise<void>;
}

const useAtivarDispositivo = (): useAtivarDispositivoHook => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const ativarDispositivo = useCallback(async (dados: DispositivoAtivacao) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await axiosInstance.post(
        `/dispositivo/ativar`,
        dados
      );
      
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof AxiosError
          ? err.message
          : "Ocorreu um erro ao ativar o dispositivo."
      );
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, success, ativarDispositivo };
};

export default useAtivarDispositivo;