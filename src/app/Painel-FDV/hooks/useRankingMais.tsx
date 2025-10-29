import { useState, useEffect } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";

interface RankingItem {
  // Define the structure of your ranking item here
  item: {
    descricaoItem: string;
    descricaoMarca: string;
  };
  qtdItem: number;
}

export const useRankingItensMais = (
  // <-- CORREÇÃO: Tipagem correta
  codEmpresa: number | string,
  periodoIni: string,
  periodoFim: string
) => {
  const [data, setData] = useState<RankingItem[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Já estava 'false', ótimo.

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
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankingItensMais();
  }, [codEmpresa, periodoIni, periodoFim]);

  return { data, error, isLoading };
};
