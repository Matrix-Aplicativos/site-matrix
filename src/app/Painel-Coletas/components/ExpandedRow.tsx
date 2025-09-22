"use client";

import React, { useState } from "react";
import useGetColetaItens from "../hooks/useGetItensColeta";
import styles from "../Inventario/Inventario.module.css";

interface ExpandedRowContentProps {
  coletaId: number;
}

const ExpandedRowContent: React.FC<ExpandedRowContentProps> = ({
  coletaId,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const { itens, loading, error } = useGetColetaItens(coletaId);
  const handleNextItemPage = () => {
    if (itens) {
      const totalPages = Math.ceil(itens.length / itemsPerPage);
      setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
    }
  };

  const handlePrevItemPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const totalPages = itens ? Math.ceil(itens.length / itemsPerPage) : 0;
  const paginatedItens = itens
    ? itens.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
    : [];

  return (
    <div className={styles.itemsTableContainer}>
      <table className={styles.itemsTable}>
        <thead>
          <tr>
            <th>Item</th>
            <th>Cód. Barras</th>
            <th>Qtd. a Conferir</th>
            <th>Qtd. Conferida</th>
            <th>Dif.</th>
            <th>Responsável Bipagem</th>
            <th>Data/Hora Bipe</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
                Carregando itens...
              </td>
            </tr>
          )}
          {error && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", color: "red" }}>
                Erro ao carregar itens: {error}
              </td>
            </tr>
          )}
          {!loading && !error && paginatedItens.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
                Nenhum item encontrado para esta coleta.
              </td>
            </tr>
          )}
          {!loading &&
            !error &&
            paginatedItens.map((item) => {
              const difference = item.qtdAConferir - item.qtdConferida;
              return (
                <tr key={item.codItem}>
                  <td>{item.descricaoItem}</td>
                  <td>{item.codBarra || "N/A"}</td>
                  <td>{item.qtdAConferir}</td>
                  <td>{item.qtdConferida}</td>
                  <td>{difference}</td>
                  <td>{item.usuarioBipagem?.nome || "Item não bipado"}</td>
                  <td>
                    {item.dataHoraBipe
                      ? new Date(item.dataHoraBipe).toLocaleString("pt-BR")
                      : "N/A"}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      {itens && itens.length > itemsPerPage && (
        <div
          className={styles.itemPagination}
          style={{ marginTop: "16px", marginBottom: "8px" }}
        >
          <button onClick={handlePrevItemPage} disabled={currentPage === 0}>
            &lt;
          </button>
          <span style={{ margin: "0 12px" }}>{currentPage + 1}</span>
          <button
            onClick={handleNextItemPage}
            disabled={currentPage >= totalPages - 1}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpandedRowContent;
