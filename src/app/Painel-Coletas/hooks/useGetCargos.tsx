import { useState, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";

// Interface baseada no JSON fornecido: { "codCargo": 0, "nomeCargo": "string" }
export interface CargoDisponivel {
  codCargo: number;
  nomeCargo: string;
}

interface UseGetCargosDisponiveisResult {
  cargos: CargoDisponivel[];
  loading: boolean;
  error: string | null;
  getCargos: (codEmpresa: number) => Promise<CargoDisponivel[]>;
}

const useGetCargosDisponiveis = (): UseGetCargosDisponiveisResult => {
  const [cargos, setCargos] = useState<CargoDisponivel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCargos = useCallback(async (codEmpresa: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<CargoDisponivel[]>(
        `/usuario/${codEmpresa}/cargos`,
      );
      const data = response.data || [];
      setCargos(data);
      return data;
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Não foi possível carregar a lista de cargos da empresa.";
      setError(msg);
      console.error("Erro ao buscar cargos da empresa:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { cargos, loading, error, getCargos };
};

export default useGetCargosDisponiveis;
