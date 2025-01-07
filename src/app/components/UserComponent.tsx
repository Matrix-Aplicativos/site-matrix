"use client"; 

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import styles from "./UserComponent.module.css";
import NewUser from "../components/NewUser";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import useGetUsuarios from "../hooks/useGetUsuarios";
import { Usuario } from "../utils/types/Usuario";
import useAtualizarUsuario from "../hooks/useAtualizarUsuario";


const UserComponent: React.FC = () => {
  const token = getCookie('token');
  const codUsuario = getUserFromToken(String(token));
  const {usuario} = useGetLoggedUser(codUsuario || 0);
  const router = useRouter();  
  const {usuarios, loading, error} = useGetUsuarios(usuario?.empresas[0].codEmpresa || 0,1);
  const [usuariosDisponiveis,setUsuariosDisponiveis] = useState((usuario?.empresas[0].maxUsuarios! - usuarios?.length! ) || 0);

    useEffect(() => {
      if(query === ""){
        setFilteredData(usuarios || []);
      }
      setUsuariosDisponiveis((usuario?.empresas[0].maxUsuarios! - usuarios?.length! ) || 0);
    },[usuarios])
  


  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState(usuarios || []);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const {updateUsuario} = useAtualizarUsuario();

  const toggleExpandRow = (index: number) => {
    setExpandedRow((prevRow) => (prevRow === index ? null : index));
  };

  const openEditModal = (user: Usuario) => {
    setCurrentUser(user);
    console.log(user)

    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setCurrentUser(null);
    setIsEditModalOpen(false);
  };

  const handleSaveChanges = () => {
    const updatedData = filteredData.map((user) =>
      user.login === currentUser?.login ? currentUser : user
    );
    if(!currentUser) return;

    updateUsuario(currentUser);
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
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  <tr style={{opacity: row.ativo ? 1 : 0.5}}>
                    <td>{row.nome}</td>
                    <td>{row.cnpjcpf}</td>
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
                              <strong>Status:</strong> {row.ativo ? "Ativo" : "Inativo"}
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
                  Tipo de Usuário:
                  <select disabled={currentUser.codUsuario === codUsuario} value={currentUser.cargo.codCargo} onChange={(e) => {console.log(e.target.value);setCurrentUser({ ...currentUser, cargo: {...currentUser.cargo,codCargo: Number(e.target.value) }})}}>
                    {currentUser.codUsuario === codUsuario ?
                      <option value="2">Gerente</option> : null}
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
                <select disabled={currentUser.codUsuario === codUsuario} value={currentUser.ativo ? "true" : "false"} onChange={(e) => setCurrentUser({ ...currentUser, ativo: e.target.value === "true" })}>
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
              <h3>Dispositivo Conectado:</h3>
              <div>
                {
                  currentUser.dispositivos.length > 0 ? currentUser.dispositivos.map((dispositivo, index) => (
                    <div>
                      <p>{dispositivo.nomeDispositivo}</p>
                      <select value={dispositivo.ativo ? "true" : "false"} onChange={(e) => setCurrentUser({ ...currentUser, dispositivos: currentUser.dispositivos?.map((disp, i) => i === index ? {...disp, ativo: e.target.value === "true"} : disp) })}>
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                      </select>
                      </div>
                  )) : <p>Nenhum dispositivo conectado</p>
                }
              </div>
            </div>
            <div className={styles.modalActions}>
              <button onClick={handleSaveChanges}>Salvar</button>
              {currentUser.ativo ?
              <button
                onClick={handlePasswordReset}
                className={styles.resetPasswordButton}
              >
                Redefinir Senha
              </button>
              : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserComponent;
