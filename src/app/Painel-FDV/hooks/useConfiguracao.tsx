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
  const [validadeLicenca, setValidadeLicenca] = useState<Date | null>(null);
  const [loadingLicenca, setLoadingLicenca] = useState(true);
  const [errorLicenca, setErrorLicenca] = useState<Error | null>(null);

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

  useEffect(() => {
    const fetchValidadeLicenca = async () => {
      setLoadingLicenca(true);
      setErrorLicenca(null);
      try {
        const response = await axiosInstance.get<ConfiguracaoApi>(
          `/configuracao/${codEmpresa}/validade-licenca`
        );

        const dataString = response.data?.valor;

        if (dataString) {
          const parts = dataString.split("/");

          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            const parsedDate = new Date(year, month - 1, day);

            if (!isNaN(parsedDate.getTime())) {
              setValidadeLicenca(parsedDate);
            } else {
              setValidadeLicenca(null);
              setErrorLicenca(
                new Error("Data inválida recebida (ex: 31/02/2026).")
              );
            }
          } else {
            const parsedDate = new Date(dataString);
            if (!isNaN(parsedDate.getTime())) {
              setValidadeLicenca(parsedDate);
            } else {
              setValidadeLicenca(null);
              setErrorLicenca(
                new Error("Formato de data inválido para 'validade-licenca'.")
              );
            }
          }
        } else {
          setValidadeLicenca(null);
        }
      } catch (err) {
        setErrorLicenca(err instanceof Error ? err : new Error(String(err)));
        setValidadeLicenca(null);
      } finally {
        setLoadingLicenca(false);
      }
    };

    if (codEmpresa) {
      fetchValidadeLicenca();
    } else {
      setLoadingLicenca(false);
      setValidadeLicenca(null);
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
    validadeLicenca,
    getConfiguracao,
    loading,
    error,
    loadingLicenca,
    errorLicenca,
  };
};

export default useConfiguracao;
