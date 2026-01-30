import { useState, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";

interface UpdateCargosResult {
  updateCargos: (
    codUsuario: number,
    codEmpresa: number,
    codCargos: number[],
  ) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

const useUpdateUsuarioCargos = (): UpdateCargosResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCargos = useCallback(
    async (
      codUsuario: number,
      codEmpresa: number,
      codCargos: number[],
    ): Promise<boolean> => {
      if (!codUsuario || !codEmpresa) {
        console.error("Código do usuário ou empresa não fornecidos.");
        setError("Dados insuficientes para atualização.");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        await axiosInstance.put(
          `/usuario/${codEmpresa}/${codUsuario}/cargos`,
          codCargos,
        );
        return true;
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "Falha ao atualizar as permissões do usuário.",
        );
        console.error("Erro ao atualizar cargos do usuário:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { updateCargos, loading, error };
};

export default useUpdateUsuarioCargos;
