import { useState } from "react";
import axiosInstance from "./axiosInstance";

interface NovoUsuario {
  nome: string;
  cnpjcpf: string;
  email: string;
  login: string;
  codCargo: number;
  codEmpresa: number; 
  codUsuarioErp: string;
}

interface useNovoUsuarioHook {
  createNovoUsuario: (novoUsuario: NovoUsuario) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const useNovoUsuario = (): useNovoUsuarioHook => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const createNovoUsuario = async (novoUsuario: NovoUsuario): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axiosInstance.post("/usuario/cadastro", novoUsuario);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocorreu um erro ao criar o usuário."
      );
    } finally {
      setLoading(false);
    }
  };

  return { createNovoUsuario, loading, error, success };
};

export default useNovoUsuario;