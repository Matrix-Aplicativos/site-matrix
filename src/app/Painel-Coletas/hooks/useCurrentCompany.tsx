"use client";

import { useState, useEffect } from "react";
import { Empresa } from "../utils/types/Usuario";

interface UseCurrentCompanyReturn {
  empresa: Empresa | null;
  loading: boolean;
}

export default function useCurrentCompany(): UseCurrentCompanyReturn {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const empresaData = localStorage.getItem("empresaSelecionada");

    try {
      if (empresaData) {
        const empresaObj: Empresa = JSON.parse(empresaData);
        setEmpresa(empresaObj);
      } else {
        setEmpresa(null);
      }
    } catch (error) {
      console.error("HOOK useCurrentCompany: Falha ao converter JSON", error);
      setEmpresa(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { empresa, loading };
}
