import axios from "axios";
import { deleteCookie, getCookie, setCookie } from "cookies-next";

let isRefreshing = false;
let failedQueue: { resolve: Function; reject: Function }[] = [];

const baseUrl = process.env.NEXT_PUBLIC_API_COLETA_URL;
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

const axiosInstanceColeta = axios.create({
  baseURL: baseUrl,
});

axiosInstanceColeta.interceptors.request.use(
  (config) => {
    const token = getCookie("token_coleta");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["Content-Type"] = "application/json";
      config.withCredentials = true;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstanceColeta.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error(
      "Erro na resposta da API Coleta:",
      error.response || error.message
    );
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstanceColeta(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const rt = getCookie("refreshToken_coleta");
        if (!rt) throw new Error("Refresh token Coleta não encontrado.");

        const response = await axios.post(
          `${baseUrl}/auth/refresh`,
          { refreshToken: rt },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        const { token, refreshToken } = response.data;

        setCookie("token_coleta", token, {
          maxAge: Number(tokenExpiration),
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict", 
        });

        setCookie("refreshToken_coleta", refreshToken, {
          maxAge: Number(refreshTokenExpiration),
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict", 
        });

        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstanceColeta(originalRequest);
      } catch (err) {
        deleteCookie("refreshToken_coleta");
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstanceColeta;
