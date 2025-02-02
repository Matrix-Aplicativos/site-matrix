import { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';

const useConfiguracao = (codEmpresa) => {
  const [valorConfiguracao, setValorConfiguracao] = useState(); 
  const [configuracaoTeste1, setConfiguracaoTeste1] = useState(false); 
  const [configuracaoTeste2, setConfiguracaoTeste2] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/configuracao/${codEmpresa}`);
        const configuracoes = response.data;

        const configuracaoMaxUsuarios = configuracoes.find(config => config.descricao === 'maximo-de-usuarios');
        if (configuracaoMaxUsuarios && configuracaoMaxUsuarios.ativo) {
          setValorConfiguracao(configuracaoMaxUsuarios.valor);
        }

        const configuracaoTeste1 = configuracoes.find(config => config.descricao === 'configuracao-teste1');
        if (configuracaoTeste1) {
          setConfiguracaoTeste1(configuracaoTeste1.ativo); 
        }

        const configuracaoTeste2 = configuracoes.find(config => config.descricao === 'configuracao-teste2');
        if (configuracaoTeste2) {
          setConfiguracaoTeste2(configuracaoTeste2.ativo);  
        }

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

  return { 
    valorConfiguracao, 
    configuracaoTeste1, 
    configuracaoTeste2, 
    loading, 
    error 
  };
};

export default useConfiguracao;
