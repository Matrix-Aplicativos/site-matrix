"use client";

import React, { useState, useMemo } from "react";
import RelatorioColetas from "./components/RelatorioColetas";
import { useLoading } from "../shared/Context/LoadingContext";
import LoadingOverlay from "../shared/components/LoadingOverlay";
import styles from "./Home.module.css";
import useGetColetas from "./hooks/useGetColetas"; 

export default function HomePage() {
  const { showLoading, hideLoading } = useLoading();
  const [view, setView] = useState<"mensal" | "anual">("mensal");

  const codEmpresa = 1; 
  const { coletas, loading } = useGetColetas(codEmpresa, 1);

  const {
    totalColetas,
    coletasAvulsas,
    coletasSobDemanda,
    coletasAnterior,
    variacaoColetas,
  } = useMemo(() => {
    if (!coletas || coletas.length === 0) {
      return {
        totalColetas: 0,
        coletasAvulsas: 0,
        coletasSobDemanda: 0,
        coletasAnterior: 0,
        variacaoColetas: null,
      };
    }

    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    let totalAtual = 0;
    let totalAnterior = 0;
    let avulsas = 0;
    let sobDemanda = 0;

    coletas.forEach((c) => {
      const data = new Date(c.dataInicio);
      if (isNaN(data.getTime())) return;

      if (data.getFullYear() === anoAtual && data.getMonth() === mesAtual) {
        totalAtual++;
        if (c.tipo === 1) avulsas++;
        if (c.tipo === 2) sobDemanda++;
      } else if (
        data.getFullYear() === anoAtual &&
        data.getMonth() === mesAtual - 1
      ) {
        totalAnterior++;
      }
    });

    const variacao =
      totalAnterior > 0
        ? ((totalAtual - totalAnterior) / totalAnterior) * 100
        : null;

    return {
      totalColetas: totalAtual,
      coletasAvulsas: avulsas,
      coletasSobDemanda: sobDemanda,
      coletasAnterior: totalAnterior,
      variacaoColetas: variacao,
    };
  }, [coletas]);

  return (
    <div className={styles.container}>
      <LoadingOverlay />
      <h1 className={styles.title}>PAINEL DE CONTROLE</h1>

      <div className={styles.border}>
        <RelatorioColetas view={view} onViewChange={setView} />
      </div>

      {/* Estatísticas */}
      <div className={styles.border}>
        <div className={styles.tablesWithStats}>
          {/* Total de Coletas */}
          <div className={styles.statWithTable}>
            <div className={styles.stat}>
              <span className={styles.number}>{totalColetas}</span>
              <span>Total de Coletas</span>
              <span className={styles.comparison}>
                {variacaoColetas !== null ? (
                  <>
                    <span
                      className={
                        variacaoColetas >= 0 ? styles.positive : styles.negative
                      }
                    >
                      {variacaoColetas >= 0 ? "▲" : "▼"}{" "}
                      {Math.abs(variacaoColetas).toFixed(1)}%
                    </span>{" "}
                    em relação ao mês anterior
                  </>
                ) : (
                  "Sem dados para comparação"
                )}
              </span>
            </div>
          </div>

          {/* Coletas Avulsas */}
          <div className={styles.statWithTable}>
            <div className={styles.stat}>
              <span className={styles.number}>{coletasAvulsas}</span>
              <span>Coletas Avulsas</span>
              <span className={styles.comparison}>
                {totalColetas > 0
                  ? `${((coletasAvulsas / totalColetas) * 100).toFixed(
                      1
                    )}% do total`
                  : "0% do total"}
              </span>
            </div>
          </div>

          {/* Coletas Sob Demanda */}
          <div className={styles.statWithTable}>
            <div className={styles.stat}>
              <span className={styles.number}>{coletasSobDemanda}</span>
              <span>Coletas Sob Demanda</span>
              <span className={styles.comparison}>
                {totalColetas > 0
                  ? `${((coletasSobDemanda / totalColetas) * 100).toFixed(
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
