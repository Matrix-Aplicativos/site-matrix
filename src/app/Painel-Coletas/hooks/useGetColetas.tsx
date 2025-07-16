import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";

interface Alocacao {
  codAlocEstoqueApi: number;
  codIntegracao: number;
  codEmpresaApi: number;
  codAlocEstoqueErp: string;
  descricao: string;
}

interface ItemConferencia {
  codItem: number;
  codConferencia: number;
  codIntegracao: number;
  codEmpresa: number;
  codItemErp: string;
  descricaoItem: string;
  descricaoMarca: string;
  codBarra: string;
  codReferencia: string;
  codFabricante: string;
  qtdAConferir: number;
  qtdConferida: number;
}

interface Usuario {
  codUsuario: number;
  codUsuarioErp: string;
  nome: string;
  cpf: string;
  email: string;
  login: string;
  tipoUsuario: {
    codTipoUsuario: number;
    nome: string;
    ativo: boolean;
  };
  empresas: {
    codEmpresa: number;
    codEmpresaErp: string;
    codIntegracao: number;
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string;
    bairro: string;
    municipio: {
      codMunicipio: string;
      uf: string;
      nome: string;
      dataCadastro: string;
      dataUltimaAlteracao: string;
    };
    dataCadastro: string;
    dataUltimaAlteracao: string;
    ativo: boolean;
    acessoMatrixColeta: boolean;
    acessoMatrixFv: boolean;
  }[];
  ativo: boolean;
}

interface Coleta {
  codConferencia: number;
  codIntegracao: number;
  codEmpresa: number;
  codConferenciaErp: string;
  origem: string;
  status: string;
  tipo: number;
  descricao: string;
  usuario: Usuario;
  dataInicio: string;
  dataFim: string;
  alocOrigem: Alocacao;
  alocDestino: Alocacao;
  itens: ItemConferencia[];
  dataCadastro: string;
}

interface UseGetColetasHook {
  coletas: Coleta[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalPaginas: number;
}

const useGetColetas = (
  codEmpresa: number,
  pagina: number = 1,
  porPagina: number = 100,
  orderBy?: string,
  sortDirection?: "asc" | "desc"
): UseGetColetasHook => {
  const [coletas, setColetas] = useState<Coleta[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState<number>(0);

  const fetchColetas = useCallback(async () => {
    if (!codEmpresa) return;

    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        pagina: pagina.toString(),
        porPagina: porPagina.toString(),
        orderBy: orderBy || "codColeta", 
        sortDirection: sortDirection || "desc",
      });

      const response = await axiosInstance.get(
        `/coleta/${codEmpresa}?${queryParams}`
      );

      // Handle response data
      const responseData = response.data;
      const dados = Array.isArray(responseData.dados)
        ? responseData.dados
        : Array.isArray(responseData)
        ? responseData
        : [];

      setColetas(dados);

      const total = responseData.totalItens
        ? Math.ceil(responseData.totalItens / porPagina)
        : 1;
      setTotalPaginas(total);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : "Ocorreu um erro ao buscar as conferências.";
      setError(errorMessage);
      setColetas(null);
    } finally {
      setLoading(false);
    }
  }, [codEmpresa, pagina, porPagina, orderBy, sortDirection]);

  useEffect(() => {
    fetchColetas();
  }, [fetchColetas]);

  return { coletas, loading, error, refetch: fetchColetas, totalPaginas };
};

export default useGetColetas;