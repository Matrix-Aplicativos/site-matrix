import axios from 'axios';
import { deleteCookie, getCookie,setCookie } from 'cookies-next';
let isRefreshing = false;
let failedQueue: { resolve: Function; reject: Function }[] = [];
const baseUrl = process.env.NEXT_PUBLIC_API_URL;
const tokenExpiration = process.env.NEXT_PUBLIC_TOKEN_EXPIRATION;
const refreshTokenExpiration = process.env.NEXT_PUBLIC_REFRESH_TOKEN_EXPIRATION;


const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};


const axiosInstance = axios.create({
  baseURL: baseUrl, 
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCookie('token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['Content-Type'] = 'application/json';
      config.withCredentials = true;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); 
  }
);

axiosInstance.interceptors.response.use(
  (response) => response, 
  async (error) => {
    console.error('Erro na resposta da API:', error.response || error.message);
    const originalRequest = error.config;
    if(error.response?.status === 403 &&
        !originalRequest._retry){
      if(isRefreshing){
        return new Promise((resolve,reject)=>{
          failedQueue.push({resolve,reject})
        })
        .then(token=>{
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        })
        .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const rt = getCookie('refreshToken');
        if (!rt) {
          throw new Error('Refresh token não encontrado.');
        }

        // Solicitar um novo token usando o refreshToken
        const response = await axios(`${baseUrl}/auth/refresh`,{method: "POST",data: {refreshToken: rt},headers: {"Content-Type": "application/json"}});
        const { token,refreshToken,codUsuario } = response.data;


        setCookie("token",token,{maxAge: tokenExpiration,secure: process.env.NODE_ENV === "production",sameSite: 'Strict'});
        setCookie("refreshToken",refreshToken,{maxAge: refreshTokenExpiration,secure: process.env.NODE_ENV === "production",sameSite: 'Strict'});
  
        // Processar a fila de requisições falhas
        processQueue(null, token);

        // Adicionar o novo token à requisição original
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        deleteCookie("refreshToken");
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error); 
  }
);

export default axiosInstance;
