import { useState, useEffect } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import {
  ConfiguracaoApi,
  parseConfiguracoesResponse,
} from "../utils/types/ConfiguracaoApi";

const useConfiguracao = (codEmpresa: number | undefined) => {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/configuracao/${codEmpresa}`);
        setConfiguracoes(parseConfiguracoesResponse(response.data));
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    if (codEmpresa) {
      fetchData();
    } else {
      setLoading(false);
      setConfiguracoes([]);
    }
  }, [codEmpresa]);

  const getConfiguracao = (key: string | number) => {
    if (typeof key === "number") {
      return configuracoes.find((config) => config.codigo === key);
    }
    return configuracoes.find((config) => config.descricao === key);
  };

  const maximoDispositivos = parseInt(
    getConfiguracao("maximo-de-dispositivos")?.valor || "0"
  );
  const maximoDispositivosMulti = parseInt(
    getConfiguracao("maximo-de-dispositivos-multi")?.valor || "0"
  );
  const permiteVendaSemEstoque =
    getConfiguracao("permite-venda-sem-estoque")?.valor === "S";

  return {
    configuracoes,
    maximoDispositivos,
    maximoDispositivosMulti,
    permiteVendaSemEstoque,
    getConfiguracao,
    loading,
    error,
  };
};

export default useConfiguracao;
