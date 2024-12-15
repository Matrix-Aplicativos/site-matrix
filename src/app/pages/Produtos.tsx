import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import styles from "./Produtos.module.css";

const ProdutosPage: React.FC = () => {
  const data = [
    {
      description: "Produto 1",
      brand: "Marca A",
      code: "123456",
      price: "R$19,90",
      stock: 10000,
      unit: "M²",
    },
    {
      description: "Produto 2",
      brand: "Marca B",
      code: "654321",
      price: "R$29,90",
      stock: 5000,
      unit: "KG",
    },
    {
      description: "Produto 3",
      brand: "Marca C",
      code: "654321",
      price: "R$29,90",
      stock: 5000,
      unit: "ML",
    },
  ];

  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const toggleExpandRow = (index: number) => {
    setExpandedRow((prevRow) => (prevRow === index ? null : index));
  };

  const toggleFilterExpansion = () => {
    setIsFilterExpanded((prev) => !prev);
  };

  const handleSearch = (searchQuery: string) => {
    const filtered = data.filter((item) =>
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredData(filtered);
    setQuery(searchQuery);
  };

  const columns = [
    { key: "description", label: "Descrição" },
    { key: "brand", label: "Marca" },
    { key: "code", label: "Código" },
    { key: "price", label: "Preço" },
    { key: "stock", label: "Saldo" },
    { key: "unit", label: "Unidade" },
    {
      key: "actions",
      render: (_value: any, _row: any, rowIndex: number) => (
        <button
          style={{ background: "none", border: "none", cursor: "pointer" }}
          onClick={() => toggleExpandRow(rowIndex)}
        >
          {expandedRow === rowIndex ? "▲" : "▼"}
        </button>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>PRODUTOS</h1>
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
            <select>
              <option value="Marca">Marca</option>
              <option value="Descricao">Descrição</option>
              <option value="Codigo">Código</option>
            </select>
          </div>

          {/* Segunda parte */}
          <div className={styles.filterSection}>
            <label>Filtrar por:</label>
            <select placeholder="Departamento">
              <option value="">Departamento</option>
            </select>
            <select placeholder="Família">
              <option value="">Família</option>
            </select>
            <div className={styles.smallSelectGroup}>
              <select placeholder="Grupo">
                <option value="">Grupo</option>
              </select>
              <select placeholder="Subgrupo">
                <option value="">Subgrupo</option>
              </select>
            </div>
          </div>

          {/* Terceira parte */}
          <div className={styles.filterSection}>
            <label>Período da Promoção:</label>
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
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <tr>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render
                        ? col.render(row[col.key], row, rowIndex)
                        : row[col.key]}
                    </td>
                  ))}
                </tr>
                {expandedRow === rowIndex && (
                  <tr className={styles.expandedRow}>
                    <td colSpan={columns.length}>
                      <div className={styles.additionalInfo}>
                        <div>
                          <p>
                            <strong>Código:</strong> {row.code}
                          </p>
                          <p>
                            <strong>Cód. de Barras:</strong> 101010110101
                          </p>
                          <p>
                            <strong>Cód. de Referência:</strong> 1004ABC
                          </p>
                          <p>
                            <strong>Cód. do Fabricante:</strong> 000001
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Grupo:</strong> Ferramentas
                          </p>
                          <p>
                            <strong>Subgrupo:</strong> Industriais
                          </p>
                          <p>
                            <strong>Departamento:</strong> Ferramentas Pesadas
                          </p>
                          <p>
                            <strong>Família:</strong> Elétricos
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Preço Venda:</strong> {row.price}
                          </p>
                          <p>
                            <strong>Preço Revenda:</strong> R$25,00
                          </p>
                          <p>
                            <strong>Preço Promoção:</strong> R$20,00
                          </p>
                          <p>
                            <strong>Desconto Máx (%):</strong> 10%
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Início Promoção:</strong> 01/01/2024
                          </p>
                          <p>
                            <strong>Fim Promoção:</strong> 15/01/2024
                          </p>
                          <p>
                            <strong>Saldo Disponível:</strong> {row.stock}{" "}
                          </p>
                          <p>
                            <strong>Unidade:</strong> {row.unit}
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

export default ProdutosPage;
