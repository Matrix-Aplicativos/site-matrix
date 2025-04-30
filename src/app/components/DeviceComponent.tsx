"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./DeviceComponent.module.css";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import useGetDispositivos from "../hooks/useGetDispositivos";
import { Dispositivo } from "../utils/types/Dispositivo";
import {
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiTrash2,
} from "react-icons/fi";
import { FaSort } from "react-icons/fa";
import { useLoading } from "../Context/LoadingContext";
import useConfiguracao from "../hooks/useConfiguracao";

const DeviceComponent: React.FC = () => {
  const { showLoading, hideLoading } = useLoading();
  const token = getCookie("token");
  const codUsuario = getUserFromToken(String(token));
  const { usuario } = useGetLoggedUser(codUsuario || 0);
  const router = useRouter();
  const { dispositivos, loading, refetch } = useGetDispositivos(
    usuario?.empresas[0].codEmpresa ?? 0,
    1
  );
  const {
    maximoDispositivos,
    loading: loadingConfig,
    error,
  } = useConfiguracao(usuario?.empresas[0].codEmpresa ?? 0);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [dispositivosDisponiveis, setDispositivosDisponiveis] = useState(0);
  const [filteredData, setFilteredData] = useState<Dispositivo[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Dispositivo;
    direction: "asc" | "desc";
  } | null>(null);

  useEffect(() => {
    if (dispositivos && maximoDispositivos !== undefined) {
      const totalDispositivos = dispositivos.length;
      const disponiveis = Math.max(0, maximoDispositivos - totalDispositivos);
      setDispositivosDisponiveis(disponiveis);
      setFilteredData(dispositivos);
    }
  }, [dispositivos, maximoDispositivos]);

  useEffect(() => {
    if (loading || loadingConfig) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, loadingConfig, showLoading, hideLoading]);

  const handleSort = (key: keyof Dispositivo) => {
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

  const handleDeleteDevice = async (codDispositivo: string) => {
    if (window.confirm("Deseja mesmo excluir esse dispositivo?")) {
      try {
        showLoading();
        // TODO: Substituir pela chamada real da API quando o endpoint estiver disponível
        // await axiosInstance.delete(`/dispositivo/${codDispositivo}`);
        console.log(`Dispositivo ${codDispositivo} marcado para exclusão`);

        // Atualiza a lista após exclusão
        refetch();

        alert("Dispositivo excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir dispositivo:", error);
        alert("Erro ao excluir dispositivo");
      } finally {
        hideLoading();
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <h3 className={styles.title}>DISPOSITIVOS</h3>
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
                  Código
                  <FaSort
                    className={styles.sortIcon}
                    onClick={() => handleSort("codDispositivo")}
                  />
                </th>
                <th>
                  Status
                  <FaSort
                    className={styles.sortIcon}
                    onClick={() => handleSort("ativo")}
                  />
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIndex) => (
                <tr key={rowIndex} style={{ opacity: row.ativo ? 1 : 0.5 }}>
                  <td>{row.nome}</td>
                  <td>{row.codDispositivo}</td>
                  <td>{row.ativo ? "Ativo" : "Inativo"}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteDevice(row.codDispositivo)}
                      className={styles.deleteButton}
                      title="Excluir dispositivo"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
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
            {dispositivos && dispositivos.length === 5 ? (
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
          <span>Dispositivos Disponíveis:</span>
          <span>{dispositivosDisponiveis}</span>
        </div>
        <div className={styles.situationItem}>
          <span>Dispositivos Cadastrados:</span>
          <span>{dispositivos?.length || 0}</span>
        </div>
        <div className={styles.situationItem}>
          <span>Limite Total:</span>
          <span>{maximoDispositivos}</span>
        </div>
      </div>
    </div>
  );
};

export default DeviceComponent;