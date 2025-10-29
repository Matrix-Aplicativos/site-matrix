import { useState, useEffect, useCallback } from "react"; // [MODIFICADO] Importa useCallback
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import { AxiosError } from "axios";
import { Rota } from "../utils/types/Rota";
import { Segmento } from "../utils/types/Segmento";
import { Classificacao } from "../utils/types/Classificacao";

// A interface 'Cliente' permanece a mesma
interface Cliente {
  codIntegracao: number;
  codEmpresaApi: number;
  codClienteApi: number;
  codClienteErp: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpjcpf: string;
  fone1: string;
  fone2: string;
  email: string;
  bairro: string;
  endereco: string;
  complemento: string;
  cep: string;
  limiteCredito: number;
  status: string;
  tipo: number;
  rota: Rota;
  segmento: Segmento;
  classificacao: Classificacao;
  areceber: [
    {
      id: {
        numDocumento: number;
        numParcela: number;
      };
      observacao: string;
      dataLancamento: string;
      dataVencimento: string;
      valor: number;
      dataCadastro: string;
      dataUltimaAlteracao: string;
    }
  ];
  ativo: true;
}

// [MODIFICADO] Interface de retorno atualizada para incluir refetch
interface UseGetClientesHook {
  clientes: Cliente[] | null;
  loading: boolean;
  error: string | null;
  paginaAtual: number;
  qtdPaginas: number;
  qtdElementos: number;
  refetch: () => void; // [NOVO]
}

const useGetClientes = (
  codEmpresa: number,
  pagina: number,
  porPagina: number,
  orderBy?: string,
  direction?: "asc" | "desc"
): UseGetClientesHook => {
  const [clientes, setClientes] = useState<Cliente[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para paginação
  const [apiPaginaAtual, setApiPaginaAtual] = useState(1);
  const [apiQtdPaginas, setApiQtdPaginas] = useState(1);
  const [apiQtdElementos, setApiQtdElementos] = useState(0);

  // [MODIFICADO] Função envolvida com useCallback para ser exportada como 'refetch'
  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = [
        `pagina=${pagina}`,
        `porPagina=${porPagina}`,
        orderBy ? `orderBy=${orderBy}` : null,
        direction ? `direction=${direction}` : null,
      ]
        .filter(Boolean)
        .join("&");

      const response = await axiosInstance.get(
        `/cliente/empresa/${codEmpresa}?${queryParams}`
      );

      // *** AJUSTE PRINCIPAL ***
      const responseData = response.data;

      // Valida a estrutura da API
      if (
        !responseData ||
        typeof responseData.conteudo === "undefined" ||
        !Array.isArray(responseData.conteudo)
      ) {
        throw new Error(
          "Formato de dados inválido da API. 'conteudo' não foi encontrado."
        );
      }

      // Define os dados com base na chave "conteudo"
      setClientes(responseData.conteudo);

      // Define os dados de paginação
      setApiPaginaAtual(responseData.paginaAtual || 1);
      setApiQtdPaginas(responseData.qtdPaginas || 1);
      setApiQtdElementos(responseData.qtdElementos || 0);

      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : "Ocorreu um erro ao buscar os clientes.";

      setError(errorMessage);
      setClientes(null);

      // Limpa paginação em caso de erro
      setApiPaginaAtual(1);
      setApiQtdPaginas(1);
      setApiQtdElementos(0);
    } finally {
      setLoading(false);
    }
  }, [codEmpresa, pagina, porPagina, orderBy, direction]); // Dependências do useCallback

  useEffect(() => {
    if (codEmpresa) {
      fetchClientes();
    }
    // [MODIFICADO] O useEffect agora depende da função memoizada
  }, [codEmpresa, fetchClientes]);

  // [MODIFICADO] Retorna os novos dados de paginação e a função refetch
  return {
    clientes,
    loading,
    error,
    paginaAtual: apiPaginaAtual,
    qtdPaginas: apiQtdPaginas,
    qtdElementos: apiQtdElementos,
    refetch: fetchClientes, // [NOVO]
  };
};

export default useGetClientes;
