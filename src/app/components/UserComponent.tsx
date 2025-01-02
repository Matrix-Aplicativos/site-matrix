"use client"; 

import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import styles from "./UserComponent.module.css";
import NewUser from "../components/NewUser";

const UserComponent: React.FC = () => {
  const router = useRouter();  
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  const toggleExpandRow = (index: number) => {
    setExpandedRow((prevRow) => (prevRow === index ? null : index));
  };

  const openEditModal = (user: any) => {
    setCurrentUser(user);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setCurrentUser(null);
    setIsEditModalOpen(false);
  };

  const handleSaveChanges = () => {
    const updatedData = filteredData.map((user) =>
      user.login === currentUser.login ? currentUser : user
    );
    setFilteredData(updatedData);
    closeEditModal();
  };

  const handlePasswordReset = () => {
    router.push("/RedefinirSenha");  
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <h3 className={styles.title}>USUÁRIOS</h3>
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
                          <button
                            className={styles.editButton}
                            onClick={() => openEditModal(row)}
                          >
                            ✏️
                          </button>
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
                              <strong>Empresas:</strong> {row.codEmpresas.join(", ") || "Nenhuma"}
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

      <div className={styles.rightSection}>
        <h3 className={styles.situationHeader}>SITUAÇÃO</h3>
        <div className={styles.situationItem}>
          <span>Usuários Disponíveis:</span>
          <span>10</span>
        </div>
        <div className={styles.situationItem}>
          <span>Usuários Cadastrados:</span>
          <span>5</span>
        </div>
        <button
          className={styles.newUserButton}
          onClick={() => setIsModalOpen(true)}
        >
          Novo Usuário
        </button>
      </div>

      {isModalOpen && <NewUser closeModal={() => setIsModalOpen(false)} />}

      {isEditModalOpen && currentUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Editar Usuário</h3>
              <button
                className={styles.closeButton}
                onClick={closeEditModal}
              >
                X
              </button>
            </div>
            <div className={styles.modalForm}>
              <div className={styles.modalColumn}>
                <label>
                  Nome:
                  <input
                    type="text"
                    value={currentUser.nome}
                    onChange={(e) =>
                      setCurrentUser({ ...currentUser, nome: e.target.value })
                    }
                  />
                </label>
                <label>
                  Email:
                  <input
                    type="email"
                    value={currentUser.email}
                    onChange={(e) =>
                      setCurrentUser({ ...currentUser, email: e.target.value })
                    }
                  />
                </label>
              </div>
              <div className={styles.modalColumn}>
                <label>
                  Código do Cargo:
                  <input
                    type="text"
                    value={currentUser.codCargo}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        codCargo: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  CPF:
                  <input
                    type="text"
                    value={currentUser.cnpjcpf}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        cnpjcpf: e.target.value,
                      })
                    }
                  />
                </label>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button onClick={handleSaveChanges}>Salvar</button>
              <button
                onClick={handlePasswordReset}
                className={styles.resetPasswordButton}
              >
                Redefinir Senha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserComponent;
