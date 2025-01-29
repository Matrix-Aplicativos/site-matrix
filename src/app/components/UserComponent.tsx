"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./UserComponent.module.css";
import NewUser from "../components/NewUser";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import useGetUsuarios from "../hooks/useGetUsuarios";
import { Usuario } from "../utils/types/Usuario";
import useAtualizarUsuario from "../hooks/useAtualizarUsuario";
import { FiChevronsLeft, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaSort } from "react-icons/fa";
import { formatCnpjCpf } from "../utils/functions/formatCnpjCpf";
import useInviteRepresentante from "../hooks/useInviteRepresentante";

const UserComponent: React.FC = () => {
  const token = getCookie("token");
  const codUsuario = getUserFromToken(String(token));
  const { usuario } = useGetLoggedUser(codUsuario || 0);
  const router = useRouter();
  const { usuarios, loading, error } = useGetUsuarios(
    usuario?.empresas?.[0]?.codEmpresa ?? 0,
    1
  );

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [emailInput, setEmailInput] = useState("");
  const [modalInviteOpen, setModalInviteOpen] = useState(false);
  const maxUsuarios = usuario?.empresas?.[0]?.maxUsuarios ?? 0;
  const totalUsuarios = usuarios?.length ?? 0;
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState(
    maxUsuarios - totalUsuarios
  );

  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState(usuarios || []);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Usuario;
    direction: "asc" | "desc";
  } | null>(null);

  const { updateUsuario } = useAtualizarUsuario();
  const { invite } = useInviteRepresentante();

  useEffect(() => {
    if (query === "") {
      setFilteredData(usuarios || []);
    }
    setUsuariosDisponiveis(
      usuario?.empresas[0].maxUsuarios! - usuarios?.length! || 0
    );
  }, [usuarios]);

  const handleSort = (key: keyof Usuario) => {
    const direction =
      sortConfig?.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });

    const sortedData = [...filteredData].sort((a, b) => {
      if (a[key]! < b[key]!) return direction === "asc" ? -1 : 1;
      if (a[key]! > b[key]!) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setFilteredData(sortedData);
  };

  const toggleExpandRow = (index: number) => {
    setExpandedRow((prevRow) => (prevRow === index ? null : index));
  };

  const openEditModal = (user: Usuario) => {
    setCurrentUser(user);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setCurrentUser(null);
    setIsEditModalOpen(false);
  };

  const handleSaveChanges = () => {
    if (!currentUser) return;
    updateUsuario(currentUser);
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
                <th>
                  Nome
                  <FaSort
                    className={styles.sortIcon}
                    onClick={() => handleSort("nome")}
                  />
                </th>
                <th>
                  CPF
                  <FaSort
                    className={styles.sortIcon}
                    onClick={() => handleSort("cnpjcpf")}
                  />
                </th>
                <th>
                  Email
                  <FaSort
                    className={styles.sortIcon}
                    onClick={() => handleSort("email")}
                  />
                </th>
                <th>
                  Login
                  <FaSort
                    className={styles.sortIcon}
                    onClick={() => handleSort("login")}
                  />
                </th>
                <th>
                  Status
                  <FaSort
                    className={styles.sortIcon}
                    onClick={() => handleSort("ativo")}
                  />
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  <tr style={{ opacity: row.ativo ? 1 : 0.5 }}>
                    <td>{row.nome}</td>
                    <td>{formatCnpjCpf(row.cnpjcpf)}</td>
                    <td>{row.email}</td>
                    <td>{row.login}</td>
                    <td>{row.ativo ? "Ativo" : "Inativo"}</td>
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
                          </div>
                          <div>
                            <p>
                              <strong>Email:</strong> {row.email}
                            </p>
                            <p>
                              <strong>Login:</strong> {row.login}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Cargo:</strong> {row.cargo.nome}
                            </p>
                            <p>
                              <strong>Status:</strong>{" "}
                              {row.ativo ? "Ativo" : "Inativo"}
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
          <div className={styles.paginationContainer}>
            <button
              onClick={(e) => {
                if (paginaAtual >= 2) {
                  e.preventDefault();
                  setPaginaAtual(1);
                }
              }}
            >
              <FiChevronsLeft />
            </button>
            <button
              onClick={(e) => {
                if (paginaAtual >= 2) {
                  e.preventDefault();
                  setPaginaAtual(paginaAtual - 1);
                }
              }}
            >
              <FiChevronLeft />
            </button>
            <p>{paginaAtual}</p>
            {usuarios && usuarios.length === 5 ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setPaginaAtual(paginaAtual + 1);
                }}
              >
                <FiChevronRight />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className={styles.rightSection}>
        <h3 className={styles.situationHeader}>SITUAÇÃO</h3>
        <div className={styles.situationItem}>
          <span>Usuários Disponíveis:</span>
          <span>{usuariosDisponiveis}</span>
        </div>
        <div className={styles.situationItem}>
          <span>Usuários Cadastrados:</span>
          <span>{usuarios?.length || 0}</span>
        </div>
        <button
          className={styles.newUserButton}
          onClick={() => setIsModalOpen(true)}
        >
          Novo Usuário
        </button>
        <button
          className={styles.newUserButton}
          onClick={() => setModalInviteOpen(true)}
        >
          Convidar Representante
        </button>
        {modalInviteOpen && (
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                invite(emailInput);
                setModalInviteOpen(false);
              }}
            >
              <label>
                Email do representante:
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </label>
              <input type="submit" value="Convidar" />
            </form>
          </div>
        )}
      </div>

      {isModalOpen && <NewUser closeModal={() => setIsModalOpen(false)} />}

      {isEditModalOpen && currentUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Editar Usuário</h3>
              <button className={styles.closeButton} onClick={closeEditModal}>
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
                <label>
                  Tipo de Usuário:
                  <select
                    disabled={currentUser.codUsuario === codUsuario}
                    value={currentUser.cargo.codCargo}
                    onChange={(e) => {
                      setCurrentUser({
                        ...currentUser,
                        cargo: {
                          ...currentUser.cargo,
                          codCargo: Number(e.target.value),
                        },
                      });
                    }}
                  >
                    {currentUser.codUsuario === codUsuario && (
                      <option value="2">Gerente</option>
                    )}
                    <option value="3">Representante</option>
                    <option value="4">Loja</option>
                  </select>
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
                <label>
                  Status:
                  <select
                    disabled={currentUser.codUsuario === codUsuario}
                    value={currentUser.ativo ? "true" : "false"}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        ativo: e.target.value === "true",
                      })
                    }
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </label>
              </div>
              <div>
                <div className={styles.modalColumn}>
                  <div className={styles.deviceEditModal}>
                    <h3>Dispositivo Conectado</h3>
                    {currentUser.dispositivos.length > 0 ? (
                      currentUser.dispositivos.map((dispositivo, index) => (
                        <div key={index}>
                          <p className={styles.nomeDispositivo}>
                            {dispositivo.nomeDispositivo}
                          </p>
                          <select
                            value={dispositivo.ativo ? "true" : "false"}
                            onChange={(e) =>
                              setCurrentUser({
                                ...currentUser,
                                dispositivos: currentUser.dispositivos?.map(
                                  (disp, i) =>
                                    i === index
                                      ? {
                                          ...disp,
                                          ativo: e.target.value === "true",
                                        }
                                      : disp
                                ),
                              })
                            }
                          >
                            <option value="true">Ativo</option>
                            <option value="false">Inativo</option>
                          </select>
                        </div>
                      ))
                    ) : (
                      <p>Nenhum dispositivo conectado</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button onClick={handleSaveChanges}>Salvar</button>
              {currentUser.ativo && (
                <button
                  onClick={handlePasswordReset}
                  className={styles.resetPasswordButton}
                >
                  Redefinir Senha
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserComponent;
