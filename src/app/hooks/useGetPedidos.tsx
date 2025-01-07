import { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';
import { Pedido } from '../utils/types/Pedido';

const useGetPedidos = (codEmpresa : Number,pagina : Number) => {
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 

  useEffect(() => {
    if (!codEmpresa) return; 

    const fetchPedidos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/pedido/${codEmpresa}?pagina=${pagina}&porPagina=10`);
        setPedidos(response.data); 
        console.log(response.data);
      } catch (err) {
        setError(
          err instanceof AxiosError ? err.response?.data.message : "Ocorreu um erro ao buscar os pedidos."
        ); 
      } finally {
        setLoading(false); 
      }
    };

    fetchPedidos();
  }, [codEmpresa,pagina]); 

  return { pedidos, loading, error };
};

export default useGetPedidos;
