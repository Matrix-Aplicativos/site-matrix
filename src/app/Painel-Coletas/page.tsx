"use client";

import React, { useState, useMemo, useEffect } from "react";
import RelatorioColetas from "./components/RelatorioColetas";
import { useLoading } from "../shared/Context/LoadingContext";
import LoadingOverlay from "../shared/components/LoadingOverlay";
import styles from "./Home.module.css";
import useGetColetas from "./hooks/useGetColetas";
import useCurrentCompany from "./hooks/useCurrentCompany";
import { isSameMonth, subMonths, isSameYear } from "date-fns"; // Import para datas

export default function HomePage() {
  const { showLoading, hideLoading } = useLoading();
  const [view, setView] = useState<"mensal" | "anual">("mensal");

  // --- CORREÇÃO 1: Usando o hook da maneira correta ---
  // O hook retorna o objeto 'empresa', não 'codEmpresa' diretamente.
  const { empresa, loading: companyLoading } = useCurrentCompany();

  // Pegamos o codEmpresa a partir do objeto 'empresa'.
  const codEmpresa = empresa?.codEmpresa;
  // ---------------------------------------------------

  // Get collection data only when company is available
  const { coletas, loading: coletasLoading } = useGetColetas(
    codEmpresa || 0,
    1
  );

  // Combined loading state
  const isLoading = companyLoading || coletasLoading;

  // Loading effect
  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  // Calculate statistics com a correção de datas (date-fns)
  const {
    totalColetas,
    inventarios,
    transferencias,
    conferencias,
    coletasAnterior,
    variacaoColetas,
  } = useMemo(() => {
    if (!coletas || coletas.length === 0) {
      return {
        totalColetas: 0,
        inventarios: 0,
        transferencias: 0,
        conferencias: 0,
        coletasAnterior: 0,
        variacaoColetas: null,
      };
    }
    const hoje = new Date();
    const mesAnterior = subMonths(hoje, 1);
    let totalAtual = 0,
      totalAnterior = 0,
      tipo1 = 0,
      tipo2 = 0,
      tipo3e4 = 0;
    coletas.forEach((c) => {
      try {
        if (!c.dataCadastro) return;
        const data = new Date(c.dataCadastro);
        if (isNaN(data.getTime())) return;
        if (isSameMonth(data, hoje) && isSameYear(data, hoje)) {
          totalAtual++;
          if (c.tipo === 1) tipo1++;
          else if (c.tipo === 2) tipo2++;
          else if (c.tipo === 3 || c.tipo === 4) tipo3e4++;
        } else if (
          isSameMonth(data, mesAnterior) &&
          isSameYear(data, mesAnterior)
        ) {
          totalAnterior++;
        }
      } catch (error) {
        console.error("Date processing error:", error);
      }
    });
    const variacao =
      totalAnterior > 0
        ? ((totalAtual - totalAnterior) / totalAnterior) * 100
        : totalAtual > 0
        ? 100
        : null;
    return {
      totalColetas: totalAtual,
      inventarios: tipo1,
      transferencias: tipo2,
      conferencias: tipo3e4,
      coletasAnterior: totalAnterior,
      variacaoColetas: variacao,
    };
  }, [coletas]);

  // Loading state
  if (isLoading) {
    return <div className={styles.container}>Carregando painel...</div>;
  }

  // --- CORREÇÃO 2: A condição de verificação ---
  // Agora verificamos se o objeto 'empresa' existe.
  if (!empresa) {
    return (
      <div className={styles.container}>
        <h2>No Company Assigned</h2>
        <p>Your account is not associated with any company.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <LoadingOverlay />
      {/* --- CORREÇÃO 3: Título dinâmico --- */}
      <h1 className={styles.title}>
        SEU PAINEL DE CONTROLE - {empresa.nomeFantasia?.toUpperCase()}
      </h1>

      <div className={styles.border}>
        <RelatorioColetas view={view} onViewChange={setView} />
      </div>

      <div className={styles.border}>
        <div className={styles.tablesWithStats}>
          <div className={styles.statWithTable}>
            <div className={styles.stat}>
              <span className={styles.number}>{totalColetas}</span>
              <span>Total de Coletas</span>
              {variacaoColetas !== null ? (
                <span className={styles.comparison}>
                  <span
                    className={
                      variacaoColetas >= 0 ? styles.positive : styles.negative
                    }
                  >
                    {variacaoColetas >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(variacaoColetas).toFixed(1)}%
                  </span>{" "}
                  vs mês anterior
                </span>
              ) : (
                <span className={styles.comparison}>Sem dados anteriores</span>
              )}
            </div>
          </div>
          <div className={styles.statWithTable}>
            <div className={styles.stat}>
              <span className={styles.number}>{inventarios}</span>
              <span>Inventários</span>
              <span className={styles.comparison}>
                {totalColetas > 0
                  ? `${((inventarios / totalColetas) * 100).toFixed(
                      1
                    )}% do total`
                  : "0% do total"}
              </span>
            </div>
          </div>
          <div className={styles.statWithTable}>
            <div className={styles.stat}>
              <span className={styles.number}>{transferencias}</span>
              <span>Transferências</span>
              <span className={styles.comparison}>
                {totalColetas > 0
                  ? `${((transferencias / totalColetas) * 100).toFixed(
                      1
                    )}% do total`
                  : "0% do total"}
              </span>
            </div>
          </div>
          <div className={styles.statWithTable}>
            <div className={styles.stat}>
              <span className={styles.number}>{conferencias}</span>
              <span>Conferências</span>
              <span className={styles.comparison}>
                {totalColetas > 0
                  ? `${((conferencias / totalColetas) * 100).toFixed(
                      1
                    )}% do total`
                  : "0% do total"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
