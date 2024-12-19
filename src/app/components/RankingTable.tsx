import styles from './RankingTable.module.css';

export default function RankingTable({ title, data }) {
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
          {data.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.descricao}</td>
              <td>{item.marca}</td>
              <td>{item.quantidadeVendida}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
