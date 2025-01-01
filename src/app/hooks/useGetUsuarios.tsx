import { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";

interface Usuario {
  nome: string;
  cnpjcpf: string;
  email: string;
  login: string;
  codCargo: number;
  codEmpresas: number[]; // Array de IDs de empresas
}

interface UseGetUsuariosHook {
  usuarios: Usuario[] | null;
  loading: boolean;
  error: string | null;
}

const useGetUsuarios = (codEmpresa: number): UseGetUsuariosHook => {
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/usuario/empresa/${codEmpresa}`);
        setUsuarios(response.data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ocorreu um erro ao buscar os usuários."
        );
        setUsuarios(null);
      } finally {
        setLoading(false);
      }
    };

    if (codEmpresa) {
      fetchUsuarios();
    }
  }, [codEmpresa]);

  return { usuarios, loading, error };
};

export default useGetUsuarios;
