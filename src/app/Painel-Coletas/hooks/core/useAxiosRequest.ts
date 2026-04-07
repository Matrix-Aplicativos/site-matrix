"use client";

import { useCallback, useState } from "react";
import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import axiosInstanceColeta from "@/app/shared/axios/axiosInstanceColeta";

export interface UseAxiosRequestState<TData> {
  data: TData | null;
  loading: boolean;
  error: string | null;
}

export interface UseAxiosRequestResult<TData, TPayload = unknown>
  extends UseAxiosRequestState<TData> {
  execute: (
    config: AxiosRequestConfig<TPayload>,
  ) => Promise<AxiosResponse<TData>>;
  setData: React.Dispatch<React.SetStateAction<TData | null>>;
  clearError: () => void;
}

const defaultErrorMessage = "Ocorreu um erro na requisição.";

function getAxiosErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message || fallback;
  }
  return fallback;
}

export default function useAxiosRequest<TData = unknown, TPayload = unknown>(
  initialData: TData | null = null,
): UseAxiosRequestResult<TData, TPayload> {
  const [data, setData] = useState<TData | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const execute = useCallback(
    async (config: AxiosRequestConfig<TPayload>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstanceColeta.request<TData, AxiosResponse<TData>, TPayload>(
          config,
        );
        setData(response.data);
        return response;
      } catch (requestError) {
        const message = getAxiosErrorMessage(requestError, defaultErrorMessage);
        setError(message);
        throw requestError;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { data, loading, error, execute, setData, clearError };
}
