import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import Table from "../components/Table";
import styles from "./Clientes.module.css";

const ClientesPage: React.FC = () => {
  const data = [
    {
      codEmpresa: 1,
      razaoSocial: "Empresa Alpha LTDA",
      nomeFantasia: "Alpha Comércio",
      cnpjcpf: "12.345.678/0001-99",
      fone1: "(11) 99999-9999",
      email: "contato@alphacomercio.com",
      codIbgeMunicipio: "3550308",
      endereco: "Rua Principal, 123",
      status: "Ativo",
      territorio: 1,
    },
    {
      codEmpresa: 2,
      razaoSocial: "Beta Indústrias SA",
      nomeFantasia: "Beta Industrial",
      cnpjcpf: "98.765.432/0001-10",
      fone1: "(21) 99999-9999",
      email: "vendas@betaindustrial.com",
      endereco: "Av. das Indústrias, 456",
      status: "Ativo",
      territorio: 2,
    },
    {
      codEmpresa: 3,
      razaoSocial: "Gamma Serviços ME",
      nomeFantasia: "Gamma Serviços",
      cnpjcpf: "23.456.789/0001-01",
      fone1: "(31) 98888-8888",
      fone2: "",
      email: "gamma@gammaservicos.com",
      endereco: "Rua Secundária, 789",
      complemento: "Casa",
      cep: "30100-100",
      status: "Inativo",
      territorio: 3,
    },
  ];

  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  const columns = [
    { key: "codEmpresa", label: "Código" },
    { key: "razaoSocial", label: "Razão Social" },
    { key: "nomeFantasia", label: "Nome Fantasia" },
    { key: "cnpjcpf", label: "CNPJ/CPF" },
    { key: "fone1", label: "Telefone" },
    { key: "email", label: "Email" },
    { key: "endereco", label: "Endereço" },
    { key: "status", label: "Status" },
    { key: "territorio", label: "Território" },
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
      <h1 className={styles.title}>CLIENTES</h1>
      <SearchBar placeholder="Qual cliente deseja buscar?" onSearch={handleSearch} />
      <Table columns={columns} data={filteredData} />
    </div>
  );
};

export default ClientesPage;
