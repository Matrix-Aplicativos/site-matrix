import { useState, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";

export interface CargoUsuario {
  nome: string;
  authority?: string;
}

interface UseGetCargosPorUsuarioResult {
  cargos: CargoUsuario[];
  loading: boolean;
  error: string | null;
  getCargos: (
    codUsuario: number | string,
    codEmpresa: number | string,
  ) => Promise<CargoUsuario[]>;
}

const useGetCargosPorUsuario = (): UseGetCargosPorUsuarioResult => {
  const [cargos, setCargos] = useState<CargoUsuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCargos = useCallback(
    async (codUsuario: number | string, codEmpresa: number | string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<CargoUsuario[]>(
          `/usuario/cargos/${codUsuario}/${codEmpresa}`,
        );

        const data = response.data || [];
        setCargos(data);
        return data;
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message ||
          "Não foi possível carregar os cargos do usuário.";
        setError(errorMsg);
        console.error("Erro ao buscar cargos:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { cargos, loading, error, getCargos };
};

export default useGetCargosPorUsuario;
