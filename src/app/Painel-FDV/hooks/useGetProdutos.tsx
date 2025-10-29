import { useState, useEffect, useCallback } from "react"; // [MODIFICADO] Importa useCallback
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import { AxiosError } from "axios";

// A interface 'Produto' permanece a mesma que você definiu
interface Produto {
  codItemApi: number;
  codIntegracao: number;
  codEmpresaApi: number;
  codItemErp: string;
  descricaoItem: string;
  descricaoMarca: string;
  codBarra: string;
  codReferencia: string;
  codFabricante: string;
  grupo: string;
  subGrupo: string;
  familia: string;
  departamento: string;
  unidade: string;
  precoVenda: number;
  precoRevenda: number;
  precoPromocao: number;
  custo: number;
  dataInicioPromocao: string;
  dataFimPromocao: string;
  saldoDisponivel: number;
  porcentagemDescontoMax: number;
  imagens: [
    {
      codImagem: number;
      nome: string;
    }
  ];
  ativo: true;
}

// [MODIFICADO] Interface de retorno atualizada para incluir refetch
interface UseGetProdutosHook {
  produtos: Produto[] | null;
  loading: boolean;
  error: string | null;
  paginaAtual: number;
  qtdPaginas: number;
  qtdElementos: number;
  refetch: () => void; // [NOVO]
}

const useGetProdutos = (
  codEmpresa: number,
  pagina: number,
  porPagina: number,
  orderBy?: string,
  direction?: "asc" | "desc"
): UseGetProdutosHook => {
  const [produtos, setProdutos] = useState<Produto[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para paginação
  const [apiPaginaAtual, setApiPaginaAtual] = useState(1);
  const [apiQtdPaginas, setApiQtdPaginas] = useState(1);
  const [apiQtdElementos, setApiQtdElementos] = useState(0);

  // [MODIFICADO] Função envolvida com useCallback para ser exportada como 'refetch'
  const fetchProdutos = useCallback(async () => {
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
        `/item/empresa/${codEmpresa}?${queryParams}`
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
      setProdutos(responseData.conteudo);

      // Define os dados de paginação
      setApiPaginaAtual(responseData.paginaAtual || 1);
      setApiQtdPaginas(responseData.qtdPaginas || 1);
      setApiQtdElementos(responseData.qtdElementos || 0);

      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : "Ocorreu um erro ao buscar os produtos.";

      setError(errorMessage);
      setProdutos(null);

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
      fetchProdutos();
    }
    // [MODIFICADO] O useEffect agora depende da função memoizada
  }, [codEmpresa, fetchProdutos]);

  // [MODIFICADO] Retorna os novos dados de paginação e a função refetch
  return {
    produtos,
    loading,
    error,
    paginaAtual: apiPaginaAtual,
    qtdPaginas: apiQtdPaginas,
    qtdElementos: apiQtdElementos,
    refetch: fetchProdutos, // [NOVO]
  };
};

export default useGetProdutos;
