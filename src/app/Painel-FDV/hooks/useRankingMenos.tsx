import { useState, useEffect } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";

interface RankingItem {
  item: {
    descricaoItem: string;
    descricaoMarca: string;
  };
  qtdItem: number;
}

export const useRankingItensMenos = (
  codEmpresa: number | string, // Explicit type for company code
  periodoIni: string, // Explicit type for start date (ISO string)
  periodoFim: string // Explicit type for end date (ISO string)
) => {
  const [data, setData] = useState<RankingItem[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!codEmpresa || !periodoIni || !periodoFim) return;

    const fetchRankingItensMenos = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get<RankingItem[]>(
          `/pedido/${codEmpresa}/ranking-itens/menos`,
          {
            params: { periodoIni, periodoFim },
          }
        );
        setData(response.data || []);
      } catch (err) {
        console.error("❌ Erro ao buscar itens menos vendidos:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankingItensMenos();
  }, [codEmpresa, periodoIni, periodoFim]);

  return { data, error, isLoading };
};
