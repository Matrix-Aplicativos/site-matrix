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

const useGetPedidos = (
  codEmpresa: number | undefined,
  pagina: number,
  porPagina: number,
  orderBy?: string,
  direction?: "asc" | "desc",
  campoBusca?: string,
  valorBusca?: string,
  dataInicio?: string,
  dataFim?: string
): UseGetPedidosHook => {
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);

  const [apiPaginaAtual, setApiPaginaAtual] = useState(1);
  const [apiQtdPaginas, setApiQtdPaginas] = useState(1);
  const [apiQtdElementos, setApiQtdElementos] = useState(0);

  const fetchPedidos = useCallback(async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({
        pagina: pagina.toString(),
        porPagina: porPagina.toString(),
      });

      if (orderBy) queryParams.append("orderBy", orderBy);
      if (direction) queryParams.append("direction", direction);

      if (campoBusca && valorBusca) {
        queryParams.append(campoBusca, valorBusca);
      }
      if (dataInicio) {
        queryParams.append("dataCadastroIni", dataInicio);
      }
      if (dataFim) {
        queryParams.append("dataCadastroFim", dataFim);
      }

      const response = await axiosInstance.get<ApiResponsePedidos>(
        `/pedido/empresa/${codEmpresa}?${queryParams.toString()}`
      );

      const responseData = response.data;
      setPedidos(responseData.conteudo || []);
      setApiPaginaAtual(responseData.paginaAtual || 1);
      setApiQtdPaginas(responseData.qtdPaginas || 1);
      setApiQtdElementos(responseData.qtdElementos || 0);

      setError(null);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : "Ocorreu um erro ao buscar os pedidos.";
      setError(errorMessage);
      setPedidos(null); 

      setApiPaginaAtual(1);
      setApiQtdPaginas(1);
      setApiQtdElementos(0);
    } finally {
      setLoading(false);
    }
  }, [
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

  useEffect(() => {
    if (codEmpresa) {
      fetchPedidos();
    }
  }, [codEmpresa, fetchPedidos]); 

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
