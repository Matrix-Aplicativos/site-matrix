"use client";

import React, { useState } from "react";
import { FiTrash2, FiPower } from "react-icons/fi";
import { FaSort } from "react-icons/fa";
import styles from "./Dispositivos.module.css";
import useGetDispositivos from "../hooks/useGetDispositivos";
import useDeleteDispositivo from "../hooks/useDeleteDispositivo";
import useAtivarDispositivo from "../hooks/useAtivarDispositivo";

const DispositivosPage: React.FC = () => {
  const codEmpresa = 1; // Substituir pelo valor real conforme o contexto da aplicação
  const [pagina, setPagina] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const { dispositivos, loading, error, refetch } = useGetDispositivos(
    codEmpresa,
    pagina,
    sortConfig?.key,
    sortConfig?.direction
  );

  const { deleteDispositivo } = useDeleteDispositivo(codEmpresa);
  const { ativarDispositivo } = useAtivarDispositivo();

  const handleSort = (key: string) => {
    const direction =
      sortConfig?.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });
  };

  const handleDeleteDevice = async (codDispositivo: string) => {
    if (window.confirm("Deseja mesmo excluir esse dispositivo?")) {
      await deleteDispositivo(codDispositivo);
      await refetch();
    }
  };

  const toggleStatus = async (
    codDispositivo: string,
    nomeDispositivo: string,
    statusAtual: boolean
  ) => {
    await ativarDispositivo({
      codDispositivo,
      nomeDispositivo,
      codEmpresaApi: codEmpresa,
      ativo: !statusAtual,
    });
    await refetch();
  };

  const dispositivosAtivos = dispositivos?.filter((d) => d.ativo).length ?? 0;
  const dispositivosInativos =
    dispositivos?.filter((d) => !d.ativo).length ?? 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>DISPOSITIVOS</h1>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.tableContainer}>
          {loading && <p>Carregando dispositivos...</p>}
          {error && <p className={styles.error}>{error}</p>}

          {!loading && dispositivos && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th onClick={() => handleSort("nomeDispositivo")}>
                    Nome <FaSort />
                  </th>
                  <th onClick={() => handleSort("codDispositivo")}>
                    Código <FaSort />
                  </th>
                  <th onClick={() => handleSort("ativo")}>
                    Status <FaSort />
                  </th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {dispositivos.map((dispositivo) => (
                  <tr key={dispositivo.codDispositivo}>
                    <td>{dispositivo.nomeDispositivo}</td>
                    <td>{dispositivo.codDispositivo}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          dispositivo.ativo ? styles.active : styles.inactive
                        }`}
                      >
                        {dispositivo.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        onClick={() =>
                          toggleStatus(
                            dispositivo.codDispositivo,
                            dispositivo.nomeDispositivo,
                            dispositivo.ativo
                          )
                        }
                        className={`${styles.actionButton} ${
                          dispositivo.ativo
                            ? styles.deactivateButton
                            : styles.activateButton
                        }`}
                      >
                        <FiPower />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteDevice(dispositivo.codDispositivo)
                        }
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.situacaoContainer}>
          <h2>Situação</h2>
          <div className={styles.situacaoItem}>
            <p>Dispositivos Ativos:</p>
            <span className={styles.situacaoValue}>{dispositivosAtivos}</span>
          </div>
          <div className={styles.situacaoItem}>
            <p>Dispositivos Inativos:</p>
            <span className={styles.situacaoValue}>{dispositivosInativos}</span>
          </div>
          <div className={styles.situacaoItem}>
            <p>Total de Dispositivos:</p>
            <span className={styles.situacaoValue}>
              {dispositivos?.length ?? 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispositivosPage;
