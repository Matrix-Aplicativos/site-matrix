"use client";

import React, { useState, useMemo, useEffect } from "react";
import RelatorioColetas from "./components/RelatorioColetas";
import { useLoading } from "../shared/Context/LoadingContext";
import LoadingOverlay from "../shared/components/LoadingOverlay";
import styles from "./Home.module.css";
import useGetColetas from "./hooks/useGetColetas";
import useCurrentCompany from "./hooks/useCurrentCompany";

export default function HomePage() {
  const { showLoading, hideLoading } = useLoading();
  const [view, setView] = useState<"mensal" | "anual">("mensal");

  // Get company data
  const { codEmpresa, loading: companyLoading } = useCurrentCompany();

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

  // Calculate statistics
  const {
    totalColetas,
    inventarios,
    transferencias,
    conferencias,
    coletasAnterior,
    variacaoColetas,
  } = useMemo(() => {
    // Default empty state
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
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    let totalAtual = 0;
    let totalAnterior = 0;
    let tipo1 = 0; // Inventários
    let tipo2 = 0; // Transferências
    let tipo3e4 = 0; // Conferências

    coletas.forEach((c) => {
      try {
        if (!c.dataCadastro) return;
        const data = new Date(c.dataCadastro);
        if (isNaN(data.getTime())) return;

        // Current month collections
        if (data.getFullYear() === anoAtual && data.getMonth() === mesAtual) {
          totalAtual++;

          if (c.tipo === 1) tipo1++; // Inventário
          else if (c.tipo === 2) tipo2++; // Transferência
          else if (c.tipo === 3 || c.tipo === 4) tipo3e4++; // Conferências
        }
        // Previous month collections (for comparison)
        else if (
          data.getFullYear() === anoAtual &&
          data.getMonth() === mesAtual - 1
        ) {
          totalAnterior++;
        }
      } catch (error) {
        console.error("Date processing error:", error);
      }
    });

    // Calculate variation
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
    return <div className={styles.container}>Loading dashboard...</div>;
  }

  // No company assigned
  if (!codEmpresa) {
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
      <h1 className={styles.title}>SEU PAINEL DE CONTROLE</h1>

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
                <span className={styles.comparison}>No previous data</span>
              )}
            </div>
          </div>

          {/* Inventários */}
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

          {/* Transferências */}
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

          {/* Conferências */}
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
