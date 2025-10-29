import { useState, useEffect, useCallback } from "react"; // [MODIFICADO] Importa useCallback
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import { AxiosError } from "axios";
import { Pedido } from "../utils/types/Pedido";

// 1. Interface da Resposta da API (baseado no padrão)
interface ApiResponsePedidos {
  conteudo: Pedido[];
  paginaAtual: number;
  qtdPaginas: number;
  qtdElementos: number;
}

// 2. [MODIFICADO] Interface do Retorno do Hook (atualizada)
interface UseGetPedidosHook {
  pedidos: Pedido[] | null;
  loading: boolean; // Renomeado de isLoading para 'loading' (padrão dos outros)
  error: string | null;
  paginaAtual: number;
  qtdPaginas: number;
  qtdElementos: number;
  refetch: () => void; // [NOVO]
}

// 3. Parâmetros atualizados para incluir filtros
const useGetPedidos = (
  codEmpresa: number,
  pagina: number,
  porPagina: number,
  orderBy?: string,
  direction?: "asc" | "desc",
  // Filtros específicos da página
  campoBusca?: string,
  valorBusca?: string,
  dataInicio?: string,
  dataFim?: string
): UseGetPedidosHook => {
  // 4. Estados atualizados
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null); // Inicia como null
  const [loading, setLoading] = useState(true); // Renomeado
  const [error, setError] = useState<string | null>(null);

  // Estados de paginação
  const [apiPaginaAtual, setApiPaginaAtual] = useState(1);
  const [apiQtdPaginas, setApiQtdPaginas] = useState(1);
  const [apiQtdElementos, setApiQtdElementos] = useState(0);

  // [MODIFICADO] Função envolvida com useCallback para ser exportada como 'refetch'
  const fetchPedidos = useCallback(async () => {
    try {
      setLoading(true);

      // 5. Constrói os query params, incluindo filtros
      const queryParams = new URLSearchParams({
        pagina: pagina.toString(),
        porPagina: porPagina.toString(),
      });

      if (orderBy) queryParams.append("orderBy", orderBy);
      if (direction) queryParams.append("direction", direction);

      // Adiciona os filtros da página (assumindo os nomes dos campos da API)
      if (campoBusca && valorBusca) {
        // Ex: 'codPedido=123' ou 'status=4'
        queryParams.append(campoBusca, valorBusca);
      }
      if (dataInicio) {
        // Assumindo que a API espera 'dataCadastroIni' e 'dataCadastroFim'
        queryParams.append("dataCadastroIni", dataInicio);
      }
      if (dataFim) {
        queryParams.append("dataCadastroFim", dataFim);
      }

      // 6. Faz a chamada, esperando a nova estrutura
      const response = await axiosInstance.get<ApiResponsePedidos>(
        `/pedido/empresa/${codEmpresa}?${queryParams.toString()}`
      );

      // 7. Extrai os dados da resposta paginada
      const responseData = response.data;
      setPedidos(responseData.conteudo || []); // Pega do 'conteudo'
      setApiPaginaAtual(responseData.paginaAtual || 1);
      setApiQtdPaginas(responseData.qtdPaginas || 1);
      setApiQtdElementos(responseData.qtdElementos || 0);

      setError(null);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
      // 8. Tratamento de erro padronizado
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : "Ocorreu um erro ao buscar os pedidos.";
      setError(errorMessage);
      setPedidos(null); // Limpa em caso de erro

      // Limpa paginação
      setApiPaginaAtual(1);
      setApiQtdPaginas(1);
      setApiQtdElementos(0);
    } finally {
      setLoading(false);
    }
  }, [
    // [MODIFICADO] Dependências do useCallback
    codEmpresa,
    pagina,
    porPagina,
    orderBy,
    direction,
    campoBusca,
    valorBusca,
    dataInicio,
    dataFim,
  ]);

  // 9. [MODIFICADO] Dependências do useEffect atualizadas
  useEffect(() => {
    if (codEmpresa) {
      fetchPedidos();
    }
  }, [codEmpresa, fetchPedidos]); // Agora depende da função memoizada

  // 10. [MODIFICADO] Retorno atualizado
  return {
    pedidos,
    loading,
    error,
    paginaAtual: apiPaginaAtual,
    qtdPaginas: apiQtdPaginas,
    qtdElementos: apiQtdElementos,
    refetch: fetchPedidos, // [NOVO]
  };
};

export default useGetPedidos;
