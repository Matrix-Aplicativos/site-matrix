"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./DeviceComponent.module.css";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import useGetDispositivos from "../hooks/useGetDispositivos";
import useDeleteDispositivo from "../hooks/useDeleteDispositivo";
import useAtivarDispositivo from "../hooks/useAtivarDispositivo";
import { Dispositivo } from "../utils/types/Dispositivo";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiTrash2,
} from "react-icons/fi";
import { FaSort } from "react-icons/fa";
import { useLoading } from "@/shared/Context/LoadingContext";
import useConfiguracao from "../hooks/useConfiguracao";

const DeviceComponent: React.FC = () => {
  const { showLoading, hideLoading } = useLoading();
  const token = getCookie("token");
  const codUsuario = getUserFromToken(String(token));
  const { usuario } = useGetLoggedUser(codUsuario || 0);
  const router = useRouter();
  const codEmpresa = usuario?.empresas?.[0]?.codEmpresa ?? 0;

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itemsPerPage] = useState(5); // Definindo 5 itens por página como padrão
  const [hasMoreData, setHasMoreData] = useState(true);

  const { dispositivos, loading, refetch } = useGetDispositivos(
    codEmpresa,
    paginaAtual
  );

  const {
    maximoDispositivos,
    loading: loadingConfig,
    error: configError,
  } = useConfiguracao(codEmpresa);

  const {
    loading: deleteLoading,
    error: deleteError,
    deleteDispositivo,
  } = useDeleteDispositivo(codEmpresa);

  const {
    loading: ativarLoading,
    error: ativarError,
    success: ativarSuccess,
    ativarDispositivo,
  } = useAtivarDispositivo();

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
      // Verifica se há mais dados para mostrar
      setHasMoreData(dispositivos.length === itemsPerPage);
    }
  }, [dispositivos, maximoDispositivos, itemsPerPage]);

  useEffect(() => {
    if (loading || loadingConfig || deleteLoading || ativarLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [
    loading,
    loadingConfig,
    deleteLoading,
    ativarLoading,
    showLoading,
    hideLoading,
  ]);

  useEffect(() => {
    if (deleteError) {
      alert(`Erro ao excluir dispositivo: ${deleteError}`);
    }
    if (configError) {
      alert(`Erro ao carregar configurações: ${configError}`);
    }
    if (ativarError) {
      alert(`Erro ao ativar dispositivo: ${ativarError}`);
    }
  }, [deleteError, configError, ativarError]);

  useEffect(() => {
    if (ativarSuccess) {
      refetch();
    }
  }, [ativarSuccess, refetch]);

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
        await deleteDispositivo(codDispositivo);
        refetch();
        alert("Dispositivo excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir dispositivo:", error);
      }
    }
  };

  const handleAtivarDispositivo = async (dispositivo: Dispositivo) => {
    try {
      await ativarDispositivo({
        codDispositivo: dispositivo.codDispositivo,
        nomeDispositivo: dispositivo.nomeDispositivo,
        codEmpresaApi: codEmpresa,
        ativo: true,
      });
    } catch (error) {
      console.error("Erro ao ativar dispositivo:", error);
    }
  };

  const handleNextPage = () => {
    setPaginaAtual((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setPaginaAtual((prev) => Math.max(1, prev - 1));
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
                    onClick={() => handleSort("nomeDispositivo")}
                  />
                </th>
                <th>
                  Código
                  <FaSort
                    className={styles.sortIcon}
                    onClick={() => handleSort("codDispositivo")}
                  />
                </th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={row.ativo ? styles.activeRow : styles.inactiveRow}
                >
                  <td>{row.nomeDispositivo}</td>
                  <td>{row.codDispositivo}</td>
                  <td className={styles.actionsCell}>
                    {!row.ativo && (
                      <button
                        onClick={() => handleAtivarDispositivo(row)}
                        className={`${styles.actionButton} ${styles.activateButton}`}
                      >
                        Ativar
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteDevice(row.codDispositivo)}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
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
            <button onClick={handlePrevPage} disabled={paginaAtual === 1}>
              <FiChevronLeft />
            </button>

            <span>{paginaAtual}</span>

            <button onClick={handleNextPage} disabled={!hasMoreData}>
              <FiChevronRight />
            </button>
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
      </div>
    </div>
  );
};

export default DeviceComponent;
