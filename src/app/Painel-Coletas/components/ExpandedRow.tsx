"use-client";

import React, { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import styles from "./ExpandedRow.module.css";
import useGetColetaItens from "../hooks/useGetItensColeta";

interface ExpandedRowContentProps {
  coletaId: number;
}

type ExpandedDetailType = "lote" | "serie";

const ITEMS_PER_PAGE = 5;

const ExpandedRowContent: React.FC<ExpandedRowContentProps> = ({
  coletaId,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedDetails, setExpandedDetails] = useState<{
    codItem: number;
    type: ExpandedDetailType;
  } | null>(null);

  const { itens, loading, error } = useGetColetaItens(
    coletaId,
    currentPage,
    ITEMS_PER_PAGE
  );

  const isLastPage = !itens || itens.length < ITEMS_PER_PAGE;
  const showPagination =
    currentPage > 1 || (itens && itens.length === ITEMS_PER_PAGE);

  const handleNextItemPage = () => {
    if (!isLastPage) {
      setExpandedDetails(null);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevItemPage = () => {
    setExpandedDetails(null);
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleToggleDetails = (codItem: number, type: ExpandedDetailType) => {
    setExpandedDetails((prev) => {
      if (prev?.codItem === codItem && prev?.type === type) {
        return null; 
      }
      return { codItem, type };
    });
  };

  const renderDetailsRow = (item: any) => {
    const isExpanded = expandedDetails?.codItem === item.codItem;
    if (!isExpanded) return null;

    return (
      <tr className={styles.detailsRow}>
        <td colSpan={9}>
          <div className={styles.detailsContainer}>
            {expandedDetails?.type === "lote" && (
              <table className={styles.detailsTable}>
                <thead>
                  <tr>
                    <th>Nº Lote</th>
                    <th>Data Fabricação</th>
                    <th>Data Validade</th>
                    <th>Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  {item.lotes.map((lote: any) => (
                    <tr key={lote.numLote}>
                      <td>{lote.numLote}</td>
                      <td>
                        {new Date(lote.dataFabricacao).toLocaleDateString(
                          "pt-BR"
                        )}
                      </td>
                      <td>
                        {new Date(lote.dataValidade).toLocaleDateString(
                          "pt-BR"
                        )}
                      </td>
                      <td>{lote.qtdItens}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {expandedDetails?.type === "serie" && (
              <div className={styles.seriesContainer}>
                <ul className={styles.seriesList}>
                  {item.numerosSerie.map((num: string, index: number) => (
                    <li key={index} className={styles.seriesListItem}>
                      {num}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={9} style={{ textAlign: "center" }}>
            Carregando itens...
          </td>
        </tr>
      );
    }
    if (error) {
      return (
        <tr>
          <td colSpan={9} style={{ textAlign: "center", color: "red" }}>
            Erro ao carregar itens: {error}
          </td>
        </tr>
      );
    }
    if (!itens || itens.length === 0) {
      return (
        <tr>
          <td colSpan={9} style={{ textAlign: "center" }}>
            Nenhum item encontrado para esta coleta.
          </td>
        </tr>
      );
    }
    return itens.map((item) => {
      const difference = item.qtdAConferir - item.qtdConferida;
      const isExpanded = expandedDetails?.codItem === item.codItem;
      return (
        <React.Fragment key={item.codItem}>
          <tr>
            <td>{item.codItemErp}</td>
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
            <td className={styles.actionsCell}>
              {item.utilizaLote && item.lotes?.length > 0 && (
                <button
                  onClick={() => handleToggleDetails(item.codItem, "lote")}
                  className={`${styles.actionButton} ${
                    isExpanded && expandedDetails?.type === "lote"
                      ? styles.active
                      : ""
                  }`}
                  title="Exibir Lotes"
                >
                  <FaInfoCircle />
                </button>
              )}
              {item.utilizaNumSerie && item.numerosSerie?.length > 0 && (
                <button
                  onClick={() => handleToggleDetails(item.codItem, "serie")}
                  className={`${styles.actionButton} ${
                    isExpanded && expandedDetails?.type === "serie"
                      ? styles.active
                      : ""
                  }`}
                  title="Exibir Números de Série"
                >
                  <FaInfoCircle />
                </button>
              )}
            </td>
          </tr>
          {renderDetailsRow(item)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className={styles.itemsTableContainer}>
      <table className={styles.itemsTable}>
        <thead>
          <tr>
            <th>Cód. ERP</th>
            <th>Item</th>
            <th>Cód. Barras</th>
            <th>Qtd. a Conferir</th>
            <th>Qtd. Conferida</th>
            <th>Dif.</th>
            <th>Responsável</th>
            <th>Data/Hora Bipe</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>{renderTableBody()}</tbody>
      </table>

      {showPagination && (
        <div className={styles.itemPagination}>
          <button
            onClick={handlePrevItemPage}
            disabled={currentPage === 1 || loading}
          >
            &lt;
          </button>
          <span> {currentPage}</span>
          <button onClick={handleNextItemPage} disabled={isLastPage || loading}>
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpandedRowContent;
