import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import ModalFilter from "../components/ModalFilter";
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
    {
      description: "Produto 4",
      brand: "Marca D",
      code: "654321",
      price: "R$29,90",
      stock: 5000,
      unit: "KG",
    },
    {
      description: "Produto 5",
      brand: "Marca E",
      code: "654321",
      price: "R$29,90",
      stock: 5000,
      unit: "KG",
    },
  ];

  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const toggleExpandRow = (index: number) => {
    setExpandedRow((prevRow) => (prevRow === index ? null : index));
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
      label: "",
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

  const handleSearch = (searchQuery: string) => {
    const filtered = data.filter((item) =>
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredData(filtered);
    setQuery(searchQuery);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>PRODUTOS</h1>
      <SearchBar
        placeholder="Qual produto deseja buscar?"
        onSearch={handleSearch}
        onFilterClick={toggleModal}
      />
      {isModalOpen && (
        <ModalFilter
          searchPlaceholder="Descrição / Marca / Código"
          filterOptions={{
            department: [{ label: "Eletrônicos", value: "electronics" }],
            family: [{ label: "Celulares", value: "phones" }],
            group: [{ label: "Smartphones", value: "smartphones" }],
            subgroup: [{ label: "Android", value: "android" }],
          }}
          datePlaceholders={{
            start: "Data Início Promoção",
            end: "Data Fim Promoção",
          }}
          onClose={toggleModal}
        />
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
