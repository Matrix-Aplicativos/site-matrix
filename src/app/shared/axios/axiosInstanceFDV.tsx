import axios from "axios";
import { deleteCookie, getCookie, setCookie } from "cookies-next";

let isRefreshing = false;
let failedQueue: { resolve: Function; reject: Function }[] = [];

const baseUrl = process.env.NEXT_PUBLIC_API_FDV_URL;
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

const clearSessionAndRedirectToLogin = () => {
  deleteCookie("token");
  deleteCookie("refreshToken");
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("empresaSelecionada");
    window.location.href = "/Painel-FDV/Login";
  }
};

const axiosInstanceFDV = axios.create({
  baseURL: baseUrl,
});

axiosInstanceFDV.interceptors.request.use(
  (config) => {
    const token = getCookie("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["Content-Type"] = "application/json";
      config.withCredentials = true;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstanceFDV.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error(
      "Erro na resposta da API FDV:",
      error.response || error.message
    );
    const originalRequest = error.config;
    const status = error.response?.status;

    if ((status === 401 || status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstanceFDV(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const rt = getCookie("refreshToken");
        if (!rt) throw new Error("Refresh token FDV não encontrado.");

        const response = await axios.post(
          `${baseUrl}/auth/refresh`,
          { refreshToken: rt },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        const { token, refreshToken } = response.data;

        setCookie("token", token, {
          maxAge: Number(tokenExpiration),
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        setCookie("refreshToken", refreshToken, {
          maxAge: Number(refreshTokenExpiration),
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", token);
        }

        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstanceFDV(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearSessionAndRedirectToLogin();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstanceFDV;
