import React from "react";
import RankingTable from "./components/RankingTable";
import RelatorioPedidos from "./components/RelatorioPedidos"; 
import styles from "./Home.module.css";

export default function HomePage() {
  const maisVendidos = [
    { descricao: "Produto A", marca: "Marca X", quantidadeVendida: 100000 },
    { descricao: "Produto B", marca: "Marca Y", quantidadeVendida: 90000 },
    { descricao: "Produto C", marca: "Marca Z", quantidadeVendida: 85000 },
    { descricao: "Produto D", marca: "Marca W", quantidadeVendida: 80000 },
    { descricao: "Produto E", marca: "Marca V", quantidadeVendida: 75000 },
  ];

  const menosVendidos = [
    { descricao: "Produto X", marca: "Marca P", quantidadeVendida: 10 },
    { descricao: "Produto Y", marca: "Marca Q", quantidadeVendida: 20 },
    { descricao: "Produto Z", marca: "Marca R", quantidadeVendida: 30 },
    { descricao: "Produto W", marca: "Marca S", quantidadeVendida: 40 },
    { descricao: "Produto V", marca: "Marca T", quantidadeVendida: 50 },
  ];

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
            <RankingTable title="Produtos Mais Vendidos" data={maisVendidos} />
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
              data={menosVendidos}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
