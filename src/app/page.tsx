"use client";

import React, { useState, useEffect } from "react";
import RankingTable from "./components/RankingTable";
import RelatorioPedidos from "./components/RelatorioPedidos";
import { useRankingItensMais } from "./hooks/useRankingMais";
import { useRankingItensMenos } from "./hooks/useRankingMenos";
import { useLoading } from "./Context/LoadingContext";
import styles from "./Home.module.css";

export default function HomePage() {
  const { showLoading, hideLoading } = useLoading();
  const [periodoIni, setPeriodoIni] = useState("2025-01-01");
  const [periodoFim, setPeriodoFim] = useState("2025-01-31");
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const codEmpresa = 1;

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

  useEffect(() => {
    showLoading();

    // Quando os dados são carregados, aguardar um pequeno delay antes de ocultar o loading
    if (!isLoadingMaisVendidos && !isLoadingMenosVendidos) {
      setTimeout(() => {
        setIsFullyLoaded(true);
        hideLoading();
      }, 1000); // Delay de 1 segundo para garantir que os gráficos renderizem
    }
  }, [isLoadingMaisVendidos, isLoadingMenosVendidos, showLoading, hideLoading]);

  if (!isFullyLoaded) return <p>Carregando os dados...</p>;

  if (errorMaisVendidos || errorMenosVendidos)
    return <p>Ocorreu um erro ao carregar os dados!</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>PAINEL DE CONTROLE</h1>
      <div className={styles.border}>
        <RelatorioPedidos />
      </div>
      <div className={styles.border}>
        <div className={styles.tablesWithStats}>
          <div className={styles.statWithTable}>
            <div className={styles.stat}>
              <span className={styles.number}>500 </span>
              <span>Pedidos Feitos esse mês</span>
              <span className={styles.comparison}>
                <span className={styles.positive}>▲ 10%</span> em relação a Fevereiro
              </span>
            </div>
            <RankingTable
              title="Produtos Mais Vendidos"
              data={maisVendidos || []}
            />
          </div>
          <div className={styles.statWithTable}>
            <div className={styles.stat}>
              <span className={styles.number}>1000 </span>
              <span>Clientes Atendidos</span>
              <span className={styles.comparison}>
                <span className={styles.negative}>▼ 12%</span> em relação a Fevereiro
              </span>
            </div>
            <RankingTable
              title="Produtos Menos Vendidos"
              data={menosVendidos || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
