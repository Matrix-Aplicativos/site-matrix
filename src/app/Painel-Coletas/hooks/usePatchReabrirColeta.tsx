import { useState } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";

const usePatchReabrirColeta = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reabrirColeta = async (codColeta: number) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.patch(`/coleta/${codColeta}/reabrir`);
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Erro ao reabrir coleta";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { reabrirColeta, loading, error };
};

export default usePatchReabrirColeta;
