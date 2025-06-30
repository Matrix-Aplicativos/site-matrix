import { useState } from "react";
import { Usuario } from "../utils/types/Usuario";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import { AxiosError } from "axios";

interface UseAtualizarUsuarioHook {
  updateUsuario: (usuario: Usuario) => Promise<Usuario>;
  loading: boolean;
  error: string | null;
}

const useAtualizarUsuario = (): UseAtualizarUsuarioHook => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const updateUsuario = async (user: Usuario) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(`/usuario`, {
        codUsuario: user.codUsuario,
        codUsuarioErp: user.codUsuarioErp,
        nome: user.nome,
        cnpjcpf: user.cpf,
        email: user.email,
        login: user.login,

        ativo: user.ativo,
      });
      setError(null);
      return response.data;
    } catch (err) {
      setError(
        err instanceof AxiosError
          ? err.response?.data.message
          : "Ocorreu um erro ao buscar os usuários."
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateUsuario, loading, error };
};

export default useAtualizarUsuario;
