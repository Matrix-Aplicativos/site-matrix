import { useState, useEffect } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";

interface RankingItem {
  item: {
    descricaoItem: string;
    descricaoMarca: string;
  };
  qtdItem: number;
}

export const useRankingItensMais = (
  codEmpresa: number | string | undefined,
  periodoIni: string,
  periodoFim: string,
  isHookEnabled: boolean // <-- 1. ARGUMENTO ADICIONADO
) => {
  const [data, setData] = useState<RankingItem[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 2. GUARDA ATUALIZADA
    if (!codEmpresa || !periodoIni || !periodoFim || !isHookEnabled) {
      setData([]); // Limpa os dados se estiver desabilitado
      setIsLoading(false);
      return;
    }

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
  }, [codEmpresa, periodoIni, periodoFim, isHookEnabled]); // <-- 3. DEPENDÊNCIA ADICIONADA

  return { data, error, isLoading };
};
