import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import Table from "../components/Table";
import styles from "./Usuarios.module.css";

const UsuariosPage: React.FC = () => {
  const data = [
    {
      nome: "João Silva",
      cnpjcpf: "123.456.789-00",
      email: "joao.silva@email.com",
      login: "joaosilva",
      senha: "senha123",
      codCargo: 1,
      codEmpresas: [101, 102, 103],
    },
    {
      nome: "Maria Oliveira",
      cnpjcpf: "987.654.321-00",
      email: "maria.oliveira@email.com",
      login: "mariaoliveira",
      senha: "senha456",
      codCargo: 2,
      codEmpresas: [104, 105],
    },
    {
      nome: "Carlos Santos",
      cnpjcpf: "456.123.789-00",
      email: "carlos.santos@email.com",
      login: "carlossantos",
      senha: "senha789",
      codCargo: 3,
      codEmpresas: [],
    },
  ];

  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  const columns = [
    { key: "nome", label: "Nome" },
    { key: "cnpjcpf", label: "CNPJ/CPF" },
    { key: "email", label: "Email" },
    { key: "login", label: "Login" },
    { key: "senha", label: "Senha" },
    { key: "codCargo", label: "Código do Cargo" },
    {
      key: "codEmpresas",
      label: "Empresas",
      render: (item: any) => (item.codEmpresas || []).join(", "), 
    },
    {
      key: "actions",
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
      <h1 className={styles.title}>USUÁRIOS</h1>
      <SearchBar placeholder="Qual usuário deseja buscar?" onSearch={handleSearch} />
      <Table columns={columns} data={filteredData} />
    </div>
  );
};

export default UsuariosPage;
