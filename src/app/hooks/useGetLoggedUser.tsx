import { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";
import {deleteCookie} from 'cookies-next';
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

interface Empresa{
    codEmpresa : number,
    cnpj: string,
    razaoSocial: string,
    nomeFantasia: string,
    configuracoes: [
        {
            id: {
                codConfiguracao: number,
                codEmpresa: string
            },
            descricao: string,
            valor: number,
            dataCadastro: string,
            dataUltimaAlteracao: string,
            ativo: boolean
        }
    ],
    maxUsuarios: number,
    dataCadastro: string,
    dataUltimaAlteracao: string,
    ativo: boolean
}

interface Dispositivo{
    id: {
        codUsuario: number,
        codImei1: string,
        codImei2: string
    },
    nomeDispositivo: string,
    dataCadastro: string,
    ativo: boolean
}

interface Usuario {
    
        codUsuario: number,
        nome: string,
        cnpjcpf: string,
        email: string,
        login: string,
        senha: string,
        cargo: {
          codCargo: 0,
          nome: string,
          dataCadastro: string,
          dataUltimaAlteracao: string,
          ativo: boolean,
          authority: string
        },
        primeiroAcesso : boolean,
        empresas: Empresa[],
        dispostivos: Dispositivo[]
      
}

const useGetLoggedUser = (codUsuario : Number) => {
    const [usuario, setUsuario] = useState<Usuario | null>(null); 
    const [loading, setLoading] = useState(false); 
    const [error, setError] = useState<any>(null);
    const router = useRouter();
    useEffect(() => {
      const fetchUsuario = async () => {
        setLoading(true);
        setError(null);
        if(codUsuario === 0){
          return;
        }
        try {
          const response = await axiosInstance.get(`/usuario/${codUsuario}`);
          setUsuario(response.data);

        } catch (err) {
          setError(err instanceof AxiosError ? err.message : "Ocorreu um erro ao buscar o usuário Atual.");
          router.push("/Login");
        } finally {
          setLoading(false); 
        }
      };
  
      fetchUsuario();
    }, [codUsuario]); 
  
    return { usuario, loading, error };
  };
  
  export default useGetLoggedUser;
  