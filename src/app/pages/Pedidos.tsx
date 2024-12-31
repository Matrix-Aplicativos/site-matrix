import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import styles from "./Pedidos.module.css";
import useGetPedidos from "../hooks/useGetPedidos"; // Hook personalizado

const PedidosPage: React.FC<{ codEmpresa: number }> = ({ codEmpresa }) => {
  const { pedidos, isLoading, error } = useGetPedidos(codEmpresa); // Hook para buscar os pedidos
  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState(pedidos || []);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  useEffect(() => {
    if (pedidos) {
      setFilteredData(pedidos);
    }
  }, [pedidos]);

  const toggleExpandRow = (index: number) => {
    setExpandedRow((prevRow) => (prevRow === index ? null : index));
  };

  const toggleFilterExpansion = () => {
    setIsFilterExpanded((prev) => !prev);
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = pedidos.filter((item) =>
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(lowerQuery)
      )
    );
    setFilteredData(filtered);
  };

  if (isLoading) {
    return <p>Carregando pedidos...</p>;
  }

  if (error) {
    return <p>Ocorreu um erro ao carregar os pedidos: {error.message}</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>PEDIDOS</h1>
      <SearchBar
        placeholder="Qual produto deseja buscar?"
        onSearch={handleSearch}
        onFilterClick={toggleFilterExpansion}
      />
      {isFilterExpanded && (
        <div className={styles.filterExpansion}>
          {/* Primeira parte */}
          <div className={styles.filterSection}>
            <label>Buscar por:</label>
            <input type="number" placeholder="Código do Pedido" />
          </div>

          {/* Segunda parte */}
          <div className={styles.filterSection}>
            <label>Filtrar por:</label>
            <select placeholder="Status">
              <option value="">Status</option>
            </select>
            <select placeholder="Cliente">
              <option value="">Cliente</option>
            </select>
          </div>

          {/* Terceira parte */}
          <div className={styles.filterSection}>
            <label>Período que deseja ver os pedidos:</label>
            <div className={styles.dateRange}>
              <input type="date" placeholder="Início" />
              <input type="date" placeholder="Fim" />
            </div>
          </div>
        </div>
      )}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código do Pedido</th>
              <th>Data</th>
              <th>Valor Total</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <tr>
                  <td>{row.codPedido}</td>
                  <td>{row.dataPedido}</td>
                  <td>R$ {row.valorTotal.toFixed(2)}</td>
                  <td>{row.status}</td>
                  <td>
                    <button
                      onClick={() => toggleExpandRow(rowIndex)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {expandedRow === rowIndex ? "▲" : "▼"}
                    </button>
                  </td>
                </tr>
                {expandedRow === rowIndex && (
                  <tr className={styles.expandedRow}>
                    <td colSpan={5}>
                      <div className={styles.additionalInfo}>
                        <div>
                          <p>
                            <strong>Cliente:</strong> {row.codCliente}
                          </p>
                          <p>
                            <strong>Status:</strong> {row.status}
                          </p>
                          <p>
                            <strong>Observação:</strong> {row.observacao}
                          </p>
                          <p>
                            <strong>Data do Pedido:</strong> {row.dataPedido}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Itens do Pedido:</strong>
                          </p>
                          <ul>
                            {row.itens.map((item, index) => (
                              <li key={index}>
                                <strong>{item.descricao}</strong> - Quantidade:{" "}
                                {item.quantidade}, Preço Unitário: R${" "}
                                {item.precoUnit.toFixed(2)}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p>
                            <strong>Valor Total:</strong> R${" "}
                            {row.valorTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PedidosPage;
