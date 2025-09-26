"use client";

import React, { useState } from "react";
import useGetColetaItens from "../hooks/useGetItensColeta";
import styles from "./ExpandedRow.module.css";
import { FaInfoCircle } from "react-icons/fa"; // ALTERADO: Importando o ícone de informação

interface ExpandedRowContentProps {
  coletaId: number;
}

type ExpandedDetailType = "lote" | "serie";

const ExpandedRowContent: React.FC<ExpandedRowContentProps> = ({
  coletaId,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [expandedDetails, setExpandedDetails] = useState<{
    codItem: number;
    type: ExpandedDetailType;
  } | null>(null);

  const { itens, loading, error } = useGetColetaItens(
    coletaId,
    currentPage,
    itemsPerPage
  );

  const isLastPage = !itens || itens.length < itemsPerPage;

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

  const showPagination =
    currentPage > 1 || (itens && itens.length === itemsPerPage);

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
        <tbody>
          {loading && (
            <tr>
              <td colSpan={9} style={{ textAlign: "center" }}>
                Carregando itens...
              </td>
            </tr>
          )}
          {error && (
            <tr>
              <td colSpan={9} style={{ textAlign: "center", color: "red" }}>
                Erro ao carregar itens: {error}
              </td>
            </tr>
          )}
          {!loading && !error && (!itens || itens.length === 0) && (
            <tr>
              <td colSpan={9} style={{ textAlign: "center" }}>
                Nenhum item encontrado para esta coleta.
              </td>
            </tr>
          )}
          {!loading &&
            !error &&
            itens &&
            itens.map((item) => {
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
                      {/* Ícone para Lote */}
                      {item.utilizaLote &&
                        item.lotes &&
                        item.lotes.length > 0 && (
                          <button
                            onClick={() =>
                              handleToggleDetails(item.codItem, "lote")
                            }
                            className={`${styles.actionButton} ${
                              isExpanded && expandedDetails?.type === "lote"
                                ? styles.active
                                : ""
                            }`}
                            title="Exibir Detalhes" // ALTERADO
                          >
                            <FaInfoCircle /> {/* ALTERADO */}
                          </button>
                        )}
                      {/* Ícone para Número de Série */}
                      {item.utilizaNumSerie &&
                        item.numerosSerie &&
                        item.numerosSerie.length > 0 && (
                          <button
                            onClick={() =>
                              handleToggleDetails(item.codItem, "serie")
                            }
                            className={`${styles.actionButton} ${
                              isExpanded && expandedDetails?.type === "serie"
                                ? styles.active
                                : ""
                            }`}
                            title="Exibir Detalhes" // ALTERADO
                          >
                            <FaInfoCircle /> {/* ALTERADO */}
                          </button>
                        )}
                    </td>
                  </tr>

                  {/* Linha expansível que mostra os detalhes */}
                  {isExpanded && (
                    <tr className={styles.detailsRow}>
                      <td colSpan={9}>
                        <div className={styles.detailsContainer}>
                          {/* Renderiza Lotes */}
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
                                {item.lotes.map((lote) => (
                                  <tr key={lote.numLote}>
                                    <td>{lote.numLote}</td>
                                    <td>
                                      {new Date(
                                        lote.dataFabricacao
                                      ).toLocaleDateString("pt-BR")}
                                    </td>
                                    <td>
                                      {new Date(
                                        lote.dataValidade
                                      ).toLocaleDateString("pt-BR")}
                                    </td>
                                    <td>{lote.qtdItens}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                          {/* Renderiza Números de Série */}
                          {expandedDetails?.type === "serie" && (
                            <div className={styles.seriesContainer}>
                              <ul className={styles.seriesList}>
                                {item.numerosSerie.map((num, index) => (
                                  <li
                                    key={index}
                                    className={styles.seriesListItem}
                                  >
                                    {num}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
        </tbody>
      </table>

      {/* Paginação */}
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
