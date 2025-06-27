import { useState, useEffect } from 'react';
import axiosInstance from "@/shared/axios/axiosInstanceColeta";

interface Configuracao {
  codEmpresa: number;
  codConfiguracao: number;
  descricao: string;
  valor: string;
  ativo: boolean;
}

const useConfiguracao = (codEmpresa: number) => {
  const [configuracoes, setConfiguracoes] = useState<Configuracao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/configuracao/${codEmpresa}`);
        setConfiguracoes(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (codEmpresa) {
      fetchData();
    }
  }, [codEmpresa]);

  const getConfiguracao = (descricao: string) => {
    return configuracoes.find(config => config.descricao === descricao);
  };

  // Get max-dispositivos configuration and parse it to number
  const maximoDispositivos = parseInt(getConfiguracao('maximo-de-dispositivos')?.valor || '0');
  const configuracaoTeste1 = getConfiguracao('configuracao-teste1')?.ativo || false;
  const configuracaoTeste2 = getConfiguracao('configuracao-teste2')?.ativo || false;

  return { 
    configuracoes,        
    maximoDispositivos,      
    configuracaoTeste1,    
    configuracaoTeste2,     
    getConfiguracao,       
    loading, 
    error 
  };
};

export default useConfiguracao;