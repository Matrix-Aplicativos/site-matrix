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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // O hook agora busca os dados paginados, mas não retorna mais 'totalPaginas'
  const { itens, loading, error } = useGetColetaItens(
    coletaId,
    currentPage,
    itemsPerPage
  );

  // Determinamos se estamos na última página pela quantidade de itens retornados
  const isLastPage = !itens || itens.length < itemsPerPage;

  const handleNextItemPage = () => {
    // Só avança se não estiver na última página
    if (!isLastPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevItemPage = () => {
    // Garante que não vá para uma página menor que 1
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // Mostra a paginação se não estivermos na primeira página, ou se a primeira página estiver cheia
  // (o que indica que pode haver uma próxima página)
  const showPagination =
    currentPage > 1 || (itens && itens.length === itemsPerPage);

  return (
    <div
      className={styles.itemsTableContainer}
      style={{
        padding: "16px",
        border: "2px solid #a0c4ff",
        borderRadius: "8px",
        marginTop: "8px",
        marginBottom: "8px",
      }}
    >
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
          {!loading && !error && (!itens || itens.length === 0) && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
                Nenhum item encontrado para esta coleta.
              </td>
            </tr>
          )}
          {!loading &&
            !error &&
            itens &&
            itens.map((item) => {
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

      {showPagination && (
        <div
          className={styles.itemPagination}
          style={{ marginTop: "16px", marginBottom: "8px" }}
        >
          <button
            onClick={handlePrevItemPage}
            disabled={currentPage === 1 || loading}
          >
            &lt;
          </button>
          <span style={{ margin: "0 12px" }}> {currentPage}</span>
          <button onClick={handleNextItemPage} disabled={isLastPage || loading}>
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpandedRowContent;
