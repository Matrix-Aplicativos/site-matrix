"use client";

import React, { useState, useEffect } from "react";
import RankingTable from "./components/RankingTable";
import RelatorioPedidos from "./components/RelatorioPedidos";
import { useRankingItensMais } from "./hooks/useRankingMais";
import { useRankingItensMenos } from "./hooks/useRankingMenos";
import { useTotalPedidos } from "./hooks/useTotalPedidos";
import { useTotalClientes } from "./hooks/useTotalClientes";
import { useLoading } from "@/shared/Context/LoadingContext";
import styles from "./Home.module.css";
import LoadingOverlay from "@/shared/components/LoadingOverlay";

export default function HomePage() {
  const { showLoading, hideLoading } = useLoading();

  const today = new Date();
  const firstDayCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  )
    .toISOString()
    .split("T")[0];
  const lastDayCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  )
    .toISOString()
    .split("T")[0];

  const firstDayPreviousMonth = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1
  )
    .toISOString()
    .split("T")[0];
  const lastDayPreviousMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    0
  )
    .toISOString()
    .split("T")[0];

  const [periodoIni, setPeriodoIni] = useState(firstDayCurrentMonth);
  const [periodoFim, setPeriodoFim] = useState(lastDayCurrentMonth);
  const codEmpresa = 1;
  const porPagina = 1000;

  const {
    data: maisVendidos,
    error: errorMaisVendidos,
    isLoading: isLoadingMaisVendidos,
  } = useRankingItensMais(codEmpresa, periodoIni, periodoFim);

  const {
    data: menosVendidos,
    error: errorMenosVendidos,
    isLoading: isLoadingMenosVendidos,
  } = useRankingItensMenos(codEmpresa, periodoIni, periodoFim);

  const { totalPedidos: pedidosAtual, isLoading: isLoadingPedidosAtual } =
    useTotalPedidos(codEmpresa, periodoIni, periodoFim, porPagina);

  const { totalPedidos: pedidosAnterior, isLoading: isLoadingPedidosAnterior } =
    useTotalPedidos(
      codEmpresa,
      firstDayPreviousMonth,
      lastDayPreviousMonth,
      porPagina
    );

  const variacaoPedidos =
    pedidosAnterior.length > 0
      ? ((pedidosAtual.length - pedidosAnterior.length) /
          pedidosAnterior.length) *
        100
      : null;

  const { totalClientes: clientesAtual, isLoading: isLoadingClientesAtual } =
    useTotalClientes(codEmpresa, periodoIni, periodoFim, porPagina);

  const {
    totalClientes: clientesAnterior,
    isLoading: isLoadingClientesAnterior,
  } = useTotalClientes(
    codEmpresa,
    firstDayPreviousMonth,
    lastDayPreviousMonth,
    porPagina
  );

  const variacaoClientes =
    clientesAnterior > 0
      ? ((clientesAtual - clientesAnterior) / clientesAnterior) * 100
      : null;

  useEffect(() => {
    showLoading();
    if (
      !isLoadingMaisVendidos &&
      !isLoadingMenosVendidos &&
      !isLoadingPedidosAtual &&
      !isLoadingPedidosAnterior &&
      !isLoadingClientesAtual &&
      !isLoadingClientesAnterior
    ) {
      setTimeout(() => {
        hideLoading();
      }, 1000);
    }
  }, [
    isLoadingMaisVendidos,
    isLoadingMenosVendidos,
    isLoadingPedidosAtual,
    isLoadingPedidosAnterior,
    isLoadingClientesAtual,
    isLoadingClientesAnterior,
    showLoading,
    hideLoading,
  ]);

  if (errorMaisVendidos || errorMenosVendidos)
    return <p>Ocorreu um erro ao carregar os dados!</p>;

  return (
    <div className={styles.container}>
      <LoadingOverlay />
      <h1 className={styles.title}>PAINEL DE CONTROLE</h1>
      <div className={styles.border}>
        <RelatorioPedidos />
      </div>
      <div className={styles.border}>
        <div className={styles.tablesWithStats}>
          <div className={styles.statWithTable}>
            <div className={styles.stat}>
              <span className={styles.number}>{pedidosAtual.length || 0}</span>
              <span>Pedidos Feitos esse mês</span>
              <span className={styles.comparison}>
                {variacaoPedidos !== null ? (
                  <>
                    <span
                      className={
                        variacaoPedidos >= 0 ? styles.positive : styles.negative
                      }
                    >
                      {variacaoPedidos >= 0 ? "▲" : "▼"}{" "}
                      {Math.abs(variacaoPedidos).toFixed(1)}%
                    </span>{" "}
                    em relação a{" "}
                    {new Date(lastDayPreviousMonth).toLocaleString("pt-BR", {
                      month: "long",
                    })}
                  </>
                ) : (
                  "Sem dados para comparação"
                )}
              </span>
            </div>
            <RankingTable
              title="Produtos Mais Vendidos"
              data={(maisVendidos ?? []).slice(0, 5)}
            />
          </div>

          <div className={styles.statWithTable}>
            <div className={styles.stat}>
              <span className={styles.number}>{clientesAtual || 0}</span>
              <span>Clientes Atendidos</span>
              <span className={styles.comparison}>
                {variacaoClientes !== null ? (
                  <>
                    <span
                      className={
                        variacaoClientes >= 0
                          ? styles.positive
                          : styles.negative
                      }
                    >
                      {variacaoClientes >= 0 ? "▲" : "▼"}{" "}
                      {Math.abs(variacaoClientes).toFixed(1)}%
                    </span>{" "}
                    em relação a{" "}
                    {new Date(lastDayPreviousMonth).toLocaleString("pt-BR", {
                      month: "long",
                    })}
                  </>
                ) : (
                  "Sem dados para comparação"
                )}
              </span>
            </div>
            <RankingTable
              title="Produtos Menos Vendidos"
              data={(menosVendidos ?? []).slice(0, 5)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
