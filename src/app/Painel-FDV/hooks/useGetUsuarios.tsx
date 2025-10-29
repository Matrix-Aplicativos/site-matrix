import { useState, useEffect, useCallback } from "react"; // [MODIFICADO] Importa useCallback
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import { AxiosError } from "axios";
import { UsuarioGet } from "../utils/types/UsuarioGet";

// [MODIFICADO] Interface de retorno atualizada para incluir dados de paginação e refetch
interface UseGetUsuariosHook {
  usuarios: UsuarioGet[] | null;
  loading: boolean;
  error: string | null;
  paginaAtual: number;
  qtdPaginas: number;
  qtdElementos: number;
  refetch: () => void; // [NOVO]
}

const useGetUsuarios = (
  codEmpresa: number,
  pagina: number,
  porPagina: number,
  orderBy?: string,
  direction?: "asc" | "desc"
): UseGetUsuariosHook => {
  const [usuarios, setUsuarios] = useState<UsuarioGet[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para armazenar os dados de paginação da API
  const [apiPaginaAtual, setApiPaginaAtual] = useState(1);
  const [apiQtdPaginas, setApiQtdPaginas] = useState(1);
  const [apiQtdElementos, setApiQtdElementos] = useState(0);

  // [MODIFICADO] Função envolvida com useCallback para ser exportada como 'refetch'
  const fetchUsuarios = useCallback(async () => {
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
        `/usuario/empresa/${codEmpresa}?${queryParams}`
      );

      // *** AJUSTE PRINCIPAL ***
      // Acessa o payload completo
      const responseData = response.data;

      // Valida se a estrutura da API está correta
      if (
        !responseData ||
        typeof responseData.conteudo === "undefined" ||
        !Array.isArray(responseData.conteudo)
      ) {
        throw new Error(
          "Formato de dados inválido da API. 'conteudo' não foi encontrado ou não é um array."
        );
      }

      // Define os dados com base na chave "conteudo"
      setUsuarios(responseData.conteudo);

      // Define os dados de paginação com valores padrão
      setApiPaginaAtual(responseData.paginaAtual || 1);
      setApiQtdPaginas(responseData.qtdPaginas || 1);
      setApiQtdElementos(responseData.qtdElementos || 0);

      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : "Ocorreu um erro ao buscar os usuários.";

      setError(errorMessage);
      setUsuarios(null);
      // Limpa paginação em caso de erro
      setApiPaginaAtual(1);
      setApiQtdPaginas(1);
      setApiQtdElementos(0);
    } finally {
      setLoading(false);
    }
  }, [codEmpresa, pagina, porPagina, orderBy, direction]); // Dependências do useCallback

  // [MODIFICADO] useEffect agora depende da função memoizada
  useEffect(() => {
    if (codEmpresa) {
      fetchUsuarios();
    }
  }, [codEmpresa, fetchUsuarios]);

  // [MODIFICADO] Retorna os novos dados de paginação e a função refetch
  return {
    usuarios,
    loading,
    error,
    paginaAtual: apiPaginaAtual,
    qtdPaginas: apiQtdPaginas,
    qtdElementos: apiQtdElementos,
    refetch: fetchUsuarios, // [NOVO]
  };
};

export default useGetUsuarios;
