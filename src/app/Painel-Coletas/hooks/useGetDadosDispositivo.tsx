import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";

export interface DadosDispositivo {
  totalDispositivos: number;
  licencasPadrao: number;
  licencasMulti: number;
  licencasPadraoUtilizadas: number;
  licencasMultiUtilizadas: number;
  vencimentoLicencas: string;
}

interface UseGetDadosDispositivoResult {
  dados: DadosDispositivo | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const initialState: DadosDispositivo = {
  totalDispositivos: 0,
  licencasPadrao: 0,
  licencasMulti: 0,
  licencasPadraoUtilizadas: 0,
  licencasMultiUtilizadas: 0,
  vencimentoLicencas: "",
};

const useGetDadosDispositivo = (
  codEmpresa: number
): UseGetDadosDispositivoResult => {
  const [dados, setDados] = useState<DadosDispositivo | null>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDados = useCallback(async () => {
    if (!codEmpresa || codEmpresa === 0) {
      setDados(initialState);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get<DadosDispositivo>(
        `/dispositivo/${codEmpresa}/dados`
      );
      setDados(response.data || initialState);
    } catch (err) {
      setError("Não foi possível carregar os dados dos dispositivos.");
      console.error("Erro ao buscar dados dos dispositivos:", err);
      setDados(initialState); 
    } finally {
      setLoading(false);
    }
  }, [codEmpresa]);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  return { dados, loading, error, refetch: fetchDados };
};

export default useGetDadosDispositivo;
