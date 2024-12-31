import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/v1', 
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); 
  }
);

axiosInstance.interceptors.response.use(
  (response) => response, 
  (error) => {
    console.error('Erro na resposta da API:', error.response || error.message);
    return Promise.reject(error); 
  }
);

export default axiosInstance;
