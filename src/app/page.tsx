"use client";

import React, { useState, useEffect } from "react";
import RankingTable from "./components/RankingTable";
import RelatorioPedidos from "./components/RelatorioPedidos";
import { useRankingItensMais } from "./hooks/useRankingMais"; 
import { useRankingItensMenos } from "./hooks/useRankingMenos"; 
import styles from "./Home.module.css";

export default function HomePage() {
  const [periodoIni, setPeriodoIni] = useState("2024-01-01"); 
  const [periodoFim, setPeriodoFim] = useState("2024-12-31"); 
  const codEmpresa = 1; 

  const { data: maisVendidos, error: errorMaisVendidos, isLoading: isLoadingMaisVendidos } = useRankingItensMais(
    codEmpresa,
    periodoIni,
    periodoFim
  );

  const { data: menosVendidos, error: errorMenosVendidos, isLoading: isLoadingMenosVendidos } = useRankingItensMenos(
    codEmpresa,
    periodoIni,
    periodoFim
  );

  if (isLoadingMaisVendidos) return <p>Carregando os produtos mais vendidos...</p>;
  if (errorMaisVendidos) return <p>Ocorreu um erro ao carregar os produtos mais vendidos: {errorMaisVendidos.message}</p>;

  if (isLoadingMenosVendidos) return <p>Carregando os produtos menos vendidos...</p>;
  if (errorMenosVendidos) return <p>Ocorreu um erro ao carregar os produtos menos vendidos: {errorMenosVendidos.message}</p>;

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
                <span className={styles.positive}>▲ 10%</span> em relação a
                Fevereiro
              </span>
            </div>
            <RankingTable title="Produtos Mais Vendidos" data={maisVendidos || []} />
          </div>
          <div className={styles.statWithTable}>
            <div className={styles.stat}>
              <span className={styles.number}>1000 </span>
              <span>Clientes Atendidos</span>
              <span className={styles.comparison}>
                <span className={styles.negative}>▼ 12%</span> em relação a
                Fevereiro
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
