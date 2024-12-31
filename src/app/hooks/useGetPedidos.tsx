import { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';

const useGetPedidos = (codEmpresa) => {
  const [data, setData] = useState(null); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 

  useEffect(() => {
    if (!codEmpresa) return; 

    const fetchPedidos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/pedido/${codEmpresa}`);
        setData(response.data); 
      } catch (err) {
        setError(err); 
      } finally {
        setLoading(false); 
      }
    };

    fetchPedidos();
  }, [codEmpresa]); 

  return { data, loading, error };
};

export default useGetPedidos;
