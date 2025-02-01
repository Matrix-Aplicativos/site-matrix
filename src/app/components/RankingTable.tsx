"use client";

import styles from "./RankingTable.module.css";

export default function RankingTable({ title, data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <h2 className={styles.tableTitle}>{title}</h2>
        <p className={styles.noDataMessage}>Nenhum dado disponível</p>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => {
    if (title.includes("Mais Vendidos")) {
      return b.qtdItem - a.qtdItem; 
    } else {
      return a.qtdItem - b.qtdItem; 
    }
  });

  return (
    <div className={styles.tableContainer}>
      <h2 className={styles.tableTitle}>{title}</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Descrição</th>
            <th>Marca</th>
            <th>Quantidade Vendida</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.item.descricaoItem || "Sem descrição"}</td>
              <td>{item.item.descricaoMarca || "Sem marca"}</td>
              <td>{item.qtdItem ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
