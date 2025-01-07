import { useState } from "react";
import { Usuario } from "../utils/types/Usuario";
import axiosInstance from "./axiosInstance";
import { AxiosError } from "axios";

interface UseAtualizarUsuarioHook {
    updateUsuario: (usuario : Usuario)=> Promise<Usuario>;
    loading: boolean;
    error: string | null;
  }
  
  const useAtualizarUsuario = (): UseAtualizarUsuarioHook => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const updateUsuario = async (user: Usuario) => {
        try {
          console.log(user);
            setLoading(true);
            const response = await axiosInstance.put(`/usuario`, {
              codUsuario: user.codUsuario,
              nome: user.nome,
              cnpjcpf: user.cnpjcpf,
              email: user.email,
              login: user.login,
              codCargo: user.cargo.codCargo,
              codEmpresas: user.empresas.map((empresa) => empresa.codEmpresa),
              dispositivos: user.dispositivos.map(dispositivo=>{
                return {
                  imei1: dispositivo.id.codImei1,
                  imei2: dispositivo.id.codImei2,
                  nomeDispositivo: dispositivo.nomeDispositivo,
                  ativo: dispositivo.ativo
                }
              }),
              ativo: user.ativo
            });
            setError(null);
            return response.data;
          } catch (err) {
            setError(
              err instanceof AxiosError ? err.response?.data.message : "Ocorreu um erro ao buscar os usuários."
            );
            return null;
          } finally {
            setLoading(false);
          }
    }

    return { updateUsuario, loading, error };
  };
  
  export default useAtualizarUsuario;
  