import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
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
  ];

  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const toggleExpandRow = (index: number) => {
    setExpandedRow((prevRow) => (prevRow === index ? null : index));
  };

  const toggleFilterExpansion = () => {
    setIsFilterExpanded((prev) => !prev);
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
      <h1 className={styles.title}>CLIENTES</h1>
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
              <option value="Marca">Razão Social</option>
              <option value="Descricao">CPF/CNPJ</option>
              <option value="Codigo">Código</option>
            </select>
          </div>

          {/* Segunda parte */}
          <div className={styles.filterSection}>
            <label>Filtrar por:</label>
            <select placeholder="Status">
              <option value="">Status</option>
            </select>
            <input type="number" placeholder="Município (IBGE)" />
            <input type="number" placeholder="Território" />
          </div>
        </div>
      )}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Razão Social</th>
              <th>Nome Fantasia</th>
              <th>CNPJ/CPF</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <tr>
                  <td>{row.codEmpresa}</td>
                  <td>{row.razaoSocial}</td>
                  <td>{row.nomeFantasia}</td>
                  <td>{row.cnpjcpf}</td>
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
                            <strong>Razão Social:</strong> {row.razaoSocial}
                          </p>
                          <p>
                            <strong>Nome Fantasia:</strong> {row.nomeFantasia}
                          </p>
                          <p>
                            <strong>CNPJ/CPF:</strong> {row.cnpjcpf}
                          </p>
                          <p>
                            <strong>Telefone:</strong> {row.fone1}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Email:</strong> {row.email}
                          </p>
                          <p>
                            <strong>Endereço:</strong> {row.endereco}
                          </p>
                          <p>
                            <strong>Complemento:</strong>{" "}
                            {row.complemento || "Nenhum"}
                          </p>
                          <p>
                            <strong>CEP:</strong> {row.cep || "Não informado"}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Município (IBGE):</strong>{" "}
                            {row.codIbgeMunicipio}
                          </p>
                          <p>
                            <strong>Status:</strong> {row.status}
                          </p>
                          <p>
                            <strong>Território:</strong> {row.territorio}
                          </p>
                          <p>
                            <strong>Data de Criação:</strong> 01/01/2024
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

export default ClientesPage;
