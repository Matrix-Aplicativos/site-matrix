"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useAxiosRequest from "./useAxiosRequest";

export interface OptionItem {
  label: string;
  value: string;
}

interface UseOptionsParams<TResponse, TOption extends OptionItem = OptionItem> {
  url: string;
  enabled?: boolean;
  mapper?: (item: TResponse) => TOption;
}

interface UseOptionsResult<TOption extends OptionItem = OptionItem> {
  options: TOption[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const optionsCache = new Map<string, OptionItem[]>();

function defaultMapper(item: unknown): OptionItem {
  if (item && typeof item === "object") {
    const candidate = item as Record<string, unknown>;
    const label = String(candidate.nome ?? candidate.descricao ?? candidate.label ?? "");
    const value = String(candidate.cod ?? candidate.id ?? candidate.value ?? "");
    return { label, value };
  }
  return { label: "", value: "" };
}

export default function useOptions<TResponse, TOption extends OptionItem = OptionItem>({
  url,
  enabled = true,
  mapper,
}: UseOptionsParams<TResponse, TOption>): UseOptionsResult<TOption> {
  const [options, setOptions] = useState<TOption[]>([]);
  const { loading, error, execute } = useAxiosRequest<TResponse[]>();

  const mapItem = useMemo(() => mapper ?? ((item: TResponse) => defaultMapper(item) as TOption), [mapper]);

  const loadOptions = useCallback(async () => {
    if (!enabled) return;

    const cached = optionsCache.get(url);
    if (cached) {
      setOptions(cached as TOption[]);
      return;
    }

    const response = await execute({ method: "GET", url });
    const mapped = (response.data || [])
      .map(mapItem)
      .filter((item) => item.label && item.value);

    optionsCache.set(url, mapped as OptionItem[]);
    setOptions(mapped);
  }, [enabled, url, execute, mapItem]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  return { options, loading, error, reload: loadOptions };
}
