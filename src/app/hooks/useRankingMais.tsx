import { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";

export const useRankingItensMais = (codEmpresa, periodoIni, periodoFim) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!codEmpresa || !periodoIni || !periodoFim) return;

    const fetchRankingItensMais = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(
          `/pedido/${codEmpresa}/ranking-itens/mais`, {
            params: {
              periodoIni, 
              periodoFim
            }
          }
        );
        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankingItensMais();
  }, [codEmpresa, periodoIni, periodoFim]);

  return { data, error, isLoading };
};
