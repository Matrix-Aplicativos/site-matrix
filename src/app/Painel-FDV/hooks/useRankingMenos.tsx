import { useState, useEffect } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";

export const useRankingItensMenos = (codEmpresa, periodoIni, periodoFim) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!codEmpresa || !periodoIni || !periodoFim) return;

    const fetchRankingItensMenos = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(
          `/pedido/${codEmpresa}/ranking-itens/menos`,
          {
            params: { periodoIni, periodoFim },
          }
        );
        setData(response.data || []);
      } catch (err) {
        console.error("❌ Erro ao buscar itens menos vendidos:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankingItensMenos();
  }, [codEmpresa, periodoIni, periodoFim]);

  return { data, error, isLoading };
};
