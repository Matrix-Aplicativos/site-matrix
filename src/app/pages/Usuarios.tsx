import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import styles from "./Usuarios.module.css";
import NewUser from "../components/NewUser";

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
      <h1 className={styles.title}>USUÁRIOS</h1>
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
              <option value="Marca">Login</option>
              <option value="Descricao">CPF</option>
              <option value="Codigo">Email</option>
            </select>
          </div>

          {/* Segunda parte */}
          <div className={styles.filterSection}>
            <label>Filtrar por:</label>
            <select placeholder="Status">
              <option value="">Status</option>
            </select>
            <input type="text" placeholder="Função" />
            <input type="number" placeholder="Empresa" />
          </div>
        </div>
      )}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Email</th>
              <th>Login</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <tr>
                  <td>{row.nome}</td>
                  <td>{row.cnpjcpf}</td>
                  <td>{row.email}</td>
                  <td>{row.login}</td>
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
                            <strong>Nome:</strong> {row.nome}
                          </p>
                          <p>
                            <strong>CNPJ/CPF:</strong> {row.cnpjcpf}
                          </p>
                          <p>
                            <strong>Email:</strong> {row.email}
                          </p>
                          <p>
                            <strong>Login:</strong> {row.login}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Senha:</strong> {row.senha}
                          </p>
                          <p>
                            <strong>Código do Cargo:</strong> {row.codCargo}
                          </p>
                          <p>
                            <strong>Empresas:</strong>{" "}
                            {row.codEmpresas.join(", ") || "Nenhuma"}
                          </p>
                          <p>
                            <strong>Data de Criação:</strong> 01/01/2024
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Último Login:</strong> 10/01/2024
                          </p>
                          <p>
                            <strong>Status:</strong> Ativo
                          </p>
                          <p>
                            <strong>Função:</strong> Administrador
                          </p>
                          <p>
                            <strong>Telefone:</strong> (11) 1234-5678
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

export default UsuariosPage;