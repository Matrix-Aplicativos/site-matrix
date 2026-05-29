"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useAxiosRequest from "./useAxiosRequest";

interface ColetaApiResponse<TItem> {
  conteudo: TItem[];
  qtdPaginas: number;
  qtdElementos: number;
}

export interface ColetaFilters {
  situacao?: string;
  origem?: string;
  descricao?: string;
  dataCadastroIni?: string;
  dataCadastroFim?: string;
}

export interface TableRowsPayload<TItem> {
  rows: TItem[];
  totalPages: number;
  totalItems: number;
}

export const normalizePagedResponse = <TItem,>(data: unknown): TableRowsPayload<TItem> => {
  const source = (data ?? {}) as Partial<ColetaApiResponse<TItem>>;
  return {
    rows: source.conteudo || [],
    totalPages: source.qtdPaginas || 0,
    totalItems: source.qtdElementos || 0,
  };
};

interface UseTableParams<TItem> {
  codEmpresa?: number;
  tipo?: string | string[] | null;
  enabled?: boolean;
  endpoint?: string | ((ctx: { codEmpresa?: number }) => string);
  responseAdapter?: (data: unknown) => TableRowsPayload<TItem>;
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

const FETCH_ALL_PAGE_SIZE = 100;

const sortMergedRows = <TItem,>(
  rows: TItem[],
  sort: { key: string; direction: "asc" | "desc" },
): TItem[] => {
  const { key, direction } = sort;
  return [...rows].sort((a, b) => {
    const av = (a as Record<string, unknown>)[key];
    const bv = (b as Record<string, unknown>)[key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;

    let cmp = 0;
    if (typeof av === "number" && typeof bv === "number") {
      cmp = av - bv;
    } else {
      cmp = String(av).localeCompare(String(bv), "pt-BR");
    }
    return direction === "asc" ? cmp : -cmp;
  });
};

const mapResponse = <TItem,>(
  data: unknown,
  responseAdapter?: (data: unknown) => TableRowsPayload<TItem>,
): TableRowsPayload<TItem> =>
  responseAdapter ? responseAdapter(data) : normalizePagedResponse<TItem>(data);

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

    const endpointSource = endpointRef.current;
    const endpointPath =
      typeof endpointSource === "function"
        ? endpointSource({ codEmpresa })
        : endpointSource || `/coleta/empresa/${codEmpresa}`;

    const buildParams = (
      requestPage: number,
      requestPageSize: number,
      requestTipo: string | string[] | null,
    ) => {
      if (queryParamsBuilderRef.current) {
        return queryParamsBuilderRef.current({
          page: requestPage,
          pageSize: requestPageSize,
          sort,
          filters,
          tipo: requestTipo,
        });
      }

      const singleTipo = Array.isArray(requestTipo)
        ? requestTipo.length === 1
          ? requestTipo[0]
          : undefined
        : (requestTipo ?? undefined);

      const defaultParams = new URLSearchParams({
        pagina: String(requestPage),
        porPagina: String(requestPageSize),
      });
      appendParam(defaultParams, "tipo", singleTipo);
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
    };

    const fetchAllRowsForTipo = async (singleTipo: string): Promise<TItem[]> => {
      const allRows: TItem[] = [];
      let pageNum = 1;
      let totalPages = 1;

      while (pageNum <= totalPages) {
        const response = await execute({
          method: "GET",
          url: `${endpointPath}?${buildParams(pageNum, FETCH_ALL_PAGE_SIZE, singleTipo).toString()}`,
        });
        const mapped = mapResponse<TItem>(
          response.data,
          responseAdapterRef.current,
        );
        allRows.push(...mapped.rows);
        totalPages = mapped.totalPages || 1;
        pageNum += 1;
      }

      return allRows;
    };

    if (Array.isArray(effectiveTipo) && effectiveTipo.length > 1) {
      const results = await Promise.all(
        effectiveTipo.map((singleTipo) => fetchAllRowsForTipo(singleTipo)),
      );
      let merged = results.flat();
      if (sort) {
        merged = sortMergedRows(merged, sort);
      }

      const totalItems = merged.length;
      const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 0;
      const start = (page - 1) * pageSize;
      setRows(merged.slice(start, start + pageSize));
      setTotalPages(totalPages);
      setTotalItems(totalItems);
      return;
    }

    const requestTipo = Array.isArray(effectiveTipo)
      ? effectiveTipo[0]
      : effectiveTipo;
    const params = buildParams(page, pageSize, requestTipo);

    const response = await execute({
      method: "GET",
      url: `${endpointPath}?${params.toString()}`,
    });

    const mapped = mapResponse<TItem>(
      response.data,
      responseAdapterRef.current,
    );
    setRows(mapped.rows);
    setTotalPages(mapped.totalPages);
    setTotalItems(mapped.totalItems);
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
