import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import Table from "../components/Table";
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
      render: () => (
        <button style={{ background: "none", border: "none", cursor: "pointer" }}>
          ▼
        </button>
      ),
    },
  ];



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
      <h1 className={styles.title}>PRODUTOS</h1>
      <SearchBar placeholder="Qual produto deseja buscar?" onSearch={handleSearch} />
      <Table columns={columns} data={filteredData} />
    </div>
  );
};

export default ProdutosPage;
