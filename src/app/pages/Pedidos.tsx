import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import styles from "./Pedidos.module.css";

const PedidosPage: React.FC = () => {
  const data = [
    {
      codPedido: 101,
      codCliente: 1,
      valorTotal: 199.9,
      status: "Concluído",
      observacao: "Pedido entregue com sucesso",
      dataPedido: "2024-12-12",
      itens: [
        { codItem: 1, descricao: "Produto A", quantidade: 2, precoUnit: 50 },
        { codItem: 2, descricao: "Produto B", quantidade: 3, precoUnit: 33.3 },
      ],
    },
    {
      codPedido: 102,
      codCliente: 2,
      valorTotal: 89.9,
      status: "Pendente",
      observacao: "Aguardando pagamento",
      dataPedido: "2024-12-10",
      itens: [
        { codItem: 3, descricao: "Produto C", quantidade: 1, precoUnit: 89.9 },
      ],
    },
    {
      codPedido: 103,
      codCliente: 3,
      valorTotal: 129.9,
      status: "Cancelado",
      observacao: "Cliente desistiu da compra",
      dataPedido: "2024-12-11",
      itens: [
        { codItem: 4, descricao: "Produto D", quantidade: 2, precoUnit: 64.95 },
      ],
    },
  ];

  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const toggleExpandRow = (index: number) => {
    setExpandedRow((prevRow) => (prevRow === index ? null : index));
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = data.filter((item) =>
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(lowerQuery)
      )
    );
    setFilteredData(filtered);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>PEDIDOS</h1>
      <SearchBar placeholder="Qual pedido deseja buscar?" onSearch={handleSearch} />
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código do Pedido</th>
              <th>Data</th>
              <th>Valor Total</th>
              <th>Status</th>
              <th>Ações</th>
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
                      style={{ background: "none", border: "none", cursor: "pointer" }}
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
                          <p><strong>Cliente:</strong> {row.codCliente}</p>
                          <p><strong>Status:</strong> {row.status}</p>
                          <p><strong>Observação:</strong> {row.observacao}</p>
                          <p><strong>Data do Pedido:</strong> {row.dataPedido}</p>
                        </div>
                        <div>
                          <p><strong>Itens do Pedido:</strong></p>
                          <ul>
                            {row.itens.map((item, index) => (
                              <li key={index}>
                                <strong>{item.descricao}</strong> - Quantidade: {item.quantidade}, Preço Unitário: R$ {item.precoUnit.toFixed(2)}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p><strong>Valor Total:</strong> R$ {row.valorTotal.toFixed(2)}</p>
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
