import { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";

export const useRankingItensMais = (codEmpresa: unknown, periodoIni: unknown, periodoFim: unknown) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!codEmpresa || !periodoIni || !periodoFim) return;

    const fetchRankingItensMais = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(
          `/pedido/${codEmpresa}/ranking-itens/mais`,
          {
            params: { periodoIni, periodoFim },
          }
        );
        setData(response.data || []);
      } catch (err) {
        console.error("❌ Erro ao buscar itens mais vendidos:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankingItensMais();
  }, [codEmpresa, periodoIni, periodoFim]);

  return { data, error, isLoading };
};
