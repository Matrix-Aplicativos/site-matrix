"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useAxiosRequest from "./useAxiosRequest";

interface ColetaApiResponse<TItem> {
  conteudo: TItem[];
  qtdPaginas: number;
  qtdElementos: number;
}

interface ColetaFilters {
  situacao?: string;
  origem?: string;
  descricao?: string;
  dataCadastroIni?: string;
  dataCadastroFim?: string;
}

interface UseTableParams<TItem> {
  codEmpresa?: number;
  tipo?: string | string[] | null;
  enabled?: boolean;
  endpoint?: string | ((ctx: { codEmpresa?: number }) => string);
  responseAdapter?: (data: any) => { rows: TItem[]; totalPages: number; totalItems: number };
  queryParamsBuilder?: (ctx: {
    page: number;
    pageSize: number;
    sort: { key: string; direction: "asc" | "desc" } | null;
    filters: ColetaFilters;
    tipo: string | string[] | null;
  }) => URLSearchParams;
  actionUrls?: {
    delete?: (row: TItem) => string;
    reopen?: (row: TItem) => string;
  };
}

interface UseTableResult<TItem> {
  rows: TItem[];
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  sort: { key: string; direction: "asc" | "desc" } | null;
  filters: ColetaFilters;
  currentTipo: string | string[] | null;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSort: (key: string) => void;
  setFilters: (next: Partial<ColetaFilters>) => void;
  setTipo: (next: string | string[] | null) => void;
  reset: () => void;
  reload: () => Promise<void>;
  actionLoading: boolean;
  remove: (row: TItem) => Promise<void>;
  reopen: (row: TItem) => Promise<void>;
}

const initialFilters: ColetaFilters = {
  situacao: "",
  origem: "",
  descricao: "",
  dataCadastroIni: "",
  dataCadastroFim: "",
};

const appendParam = (params: URLSearchParams, key: string, value?: string) => {
  if (!value) return;
  params.append(key, value);
};

export default function useTable<TItem>({
  codEmpresa,
  tipo = null,
  enabled = true,
  endpoint,
  responseAdapter,
  queryParamsBuilder,
  actionUrls,
}: UseTableParams<TItem>): UseTableResult<TItem> {
  const [rows, setRows] = useState<TItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [sort, setSortState] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [filters, setFiltersState] = useState<ColetaFilters>(initialFilters);
  const [currentTipo, setCurrentTipo] = useState<string | string[] | null>(null);
  const endpointRef = useRef(endpoint);
  const queryParamsBuilderRef = useRef(queryParamsBuilder);
  const responseAdapterRef = useRef(responseAdapter);

  const { loading, error, execute } = useAxiosRequest<ColetaApiResponse<TItem>>();
  const { loading: actionLoading, execute: executeAction } = useAxiosRequest<unknown>();

  const shouldLoad = Boolean(codEmpresa) && enabled;

  useEffect(() => {
    endpointRef.current = endpoint;
    queryParamsBuilderRef.current = queryParamsBuilder;
    responseAdapterRef.current = responseAdapter;
  }, [endpoint, queryParamsBuilder, responseAdapter]);

  const fetchRows = useCallback(async () => {
    if (!shouldLoad || !codEmpresa) {
      setRows([]);
      setTotalPages(0);
      setTotalItems(0);
      return;
    }

    const effectiveTipo = currentTipo ?? tipo;
    const params = queryParamsBuilderRef.current
      ? queryParamsBuilderRef.current({ page, pageSize, sort, filters, tipo: effectiveTipo })
      : (() => {
          const defaultParams = new URLSearchParams({
            pagina: String(page),
            porPagina: String(pageSize),
          });
          if (Array.isArray(effectiveTipo)) {
            effectiveTipo.forEach((t) => defaultParams.append("tipo", t));
          } else {
            appendParam(defaultParams, "tipo", effectiveTipo ?? undefined);
          }
          if (sort) {
            appendParam(defaultParams, "orderBy", sort.key);
            appendParam(defaultParams, "direction", sort.direction);
          }
          appendParam(defaultParams, "situacao", filters.situacao);
          appendParam(defaultParams, "origem", filters.origem);
          appendParam(defaultParams, "descricao", filters.descricao);
          appendParam(defaultParams, "dataCadastroIni", filters.dataCadastroIni);
          appendParam(defaultParams, "dataCadastroFim", filters.dataCadastroFim);
          return defaultParams;
        })();

    const endpointSource = endpointRef.current;
    const endpointPath =
      typeof endpointSource === "function"
        ? endpointSource({ codEmpresa })
        : endpointSource || `/coleta/empresa/${codEmpresa}`;

    const response = await execute({
      method: "GET",
      url: `${endpointPath}?${params.toString()}`,
    });

    if (responseAdapterRef.current) {
      const mapped = responseAdapterRef.current(response.data);
      setRows(mapped.rows || []);
      setTotalPages(mapped.totalPages || 0);
      setTotalItems(mapped.totalItems || 0);
      return;
    }

    const defaultData = response.data as ColetaApiResponse<TItem>;
    setRows(defaultData?.conteudo || []);
    setTotalPages(defaultData?.qtdPaginas || 0);
    setTotalItems(defaultData?.qtdElementos || 0);
  }, [
    shouldLoad,
    codEmpresa,
    page,
    pageSize,
    tipo,
    currentTipo,
    sort,
    filters,
    execute,
  ]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const setSort = useCallback((key: string) => {
    setSortState((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }
      return { key, direction: current.direction === "asc" ? "desc" : "asc" };
    });
    setPage(1);
  }, []);

  const setFilters = useCallback((next: Partial<ColetaFilters>) => {
    setFiltersState((current) => ({ ...current, ...next }));
    setPage(1);
  }, []);

  const reset = useCallback(() => {
    setPage(1);
    setPageSize(20);
    setSortState(null);
    setFiltersState(initialFilters);
    setCurrentTipo(null);
  }, []);

  const remove = useCallback(
    async (row: TItem) => {
      if (!actionUrls?.delete) return;
      await executeAction({ method: "DELETE", url: actionUrls.delete(row) });
      await fetchRows();
    },
    [actionUrls, executeAction, fetchRows],
  );

  const reopen = useCallback(
    async (row: TItem) => {
      if (!actionUrls?.reopen) return;
      await executeAction({ method: "PATCH", url: actionUrls.reopen(row) });
      await fetchRows();
    },
    [actionUrls, executeAction, fetchRows],
  );

  return useMemo(
    () => ({
      rows,
      loading,
      error,
      page,
      pageSize,
      totalPages,
      totalItems,
      sort,
      filters,
      currentTipo,
      setPage,
      setPageSize: (size: number) => {
        setPageSize(size);
        setPage(1);
      },
      setSort,
      setFilters,
      setTipo: setCurrentTipo,
      reset,
      reload: fetchRows,
      actionLoading,
      remove,
      reopen,
    }),
    [
      rows,
      loading,
      error,
      page,
      pageSize,
      totalPages,
      totalItems,
      sort,
      filters,
      currentTipo,
      setSort,
      setFilters,
      reset,
      fetchRows,
      actionLoading,
      remove,
      reopen,
    ],
  );
}
