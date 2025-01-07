import { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";
import { Cargo } from "../utils/types/Cargo";
import { Dispositivo } from "../utils/types/Dispositivo";
import { Empresa } from "../utils/types/Empresa";
import { Usuario } from "../utils/types/Usuario";



interface UseGetUsuariosHook {
  usuarios: Usuario[] | null;
  loading: boolean;
  error: string | null;
}

const useGetUsuarios = (codEmpresa: Number,pagina: Number): UseGetUsuariosHook => {
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/usuario/empresa/${codEmpresa}?pagina=${pagina}&porPagina=5`);
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
  }, [codEmpresa,pagina]);

  return { usuarios, loading, error };
};

export default useGetUsuarios;
