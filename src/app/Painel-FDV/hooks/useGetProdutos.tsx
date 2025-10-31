import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import { AxiosError } from "axios";

// Interface 'Produto'
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

interface UseGetProdutosHook {
  produtos: Produto[] | null;
  loading: boolean;
  error: string | null;
  paginaAtual: number;
  qtdPaginas: number;
  qtdElementos: number;
  refetch: () => void;
}

const useGetProdutos = (
  codEmpresa: number,
  pagina: number,
  porPagina: number,
  orderBy?: string,
  direction?: "asc" | "desc", 
  filtros?: Record<string, string | boolean>,
  enabled: boolean = true
): UseGetProdutosHook => {
  const [produtos, setProdutos] = useState<Produto[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [apiPaginaAtual, setApiPaginaAtual] = useState(1);
  const [apiQtdPaginas, setApiQtdPaginas] = useState(1);
  const [apiQtdElementos, setApiQtdElementos] = useState(0);

  const fetchProdutos = useCallback(async () => {
    if (!enabled || !codEmpresa) {
      setProdutos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true); 

      const queryParams = new URLSearchParams({
        pagina: pagina.toString(),
        porPagina: porPagina.toString(),
      });

      if (orderBy) queryParams.append("orderBy", orderBy);
      if (direction) queryParams.append("direction", direction); 

      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            queryParams.append(key, String(value));
          }
        });
      } 

      const response = await axiosInstance.get(
        `/item/empresa/${codEmpresa}?${queryParams}`
      );

      const responseData = response.data;

      if (
        !responseData ||
        typeof responseData.conteudo === "undefined" ||
        !Array.isArray(responseData.conteudo)
      ) {
        throw new Error(
          "Formato de dados inválido da API. 'conteudo' não foi encontrado."
        );
      }

      setProdutos(responseData.conteudo);
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
      setApiPaginaAtual(1);
      setApiQtdPaginas(1);
      setApiQtdElementos(0);
    } finally {
      setLoading(false);
    } 
  }, [codEmpresa, pagina, porPagina, orderBy, direction, filtros, enabled]);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]); 

  return {
    produtos,
    loading,
    error,
    paginaAtual: apiPaginaAtual,
    qtdPaginas: apiQtdPaginas,
    qtdElementos: apiQtdElementos,
    refetch: fetchProdutos,
  };
};


export default useGetProdutos;