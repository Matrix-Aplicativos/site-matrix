// components/PaginationControls.tsx (ATUALIZADO)

import React from "react";
import styles from "./PaginationControls.module.css";

interface PaginationControlsProps {
  paginaAtual: number;
  totalPaginas: number;
  totalElementos: number;
  porPagina: number;
  onPageChange: (page: number) => void;
  // ADICIONADO: Nova prop para lidar com a mudança de itens por página
  onItemsPerPageChange: (size: number) => void;
  isLoading?: boolean;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  paginaAtual,
  totalPaginas,
  totalElementos,
  porPagina,
  onPageChange,
  onItemsPerPageChange, // ADICIONADO
  isLoading = false,
}) => {
  const startItem = totalElementos > 0 ? (paginaAtual - 1) * porPagina + 1 : 0;
  const endItem = Math.min(paginaAtual * porPagina, totalElementos);

  const generatePageNumbers = () => {
    const pages = [];
    const total = totalPaginas || 1;
    const maxPagesToShow = 5;
    const halfWay = Math.ceil(maxPagesToShow / 2);
    let startPage = Math.max(1, paginaAtual - halfWay + 1);
    let endPage = Math.min(total, startPage + maxPagesToShow - 1);
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  if (totalElementos === 0) {
    return null;
  }

  return (
    // ALTERADO: A estrutura interna agora tem 3 divs filhas diretas
    <div className={styles.paginationWrapper}>
      {/* Coluna da Esquerda: Controles de página */}
      <div className={styles.paginationControls}>
        <button
          onClick={() => onPageChange(1)}
          disabled={paginaAtual === 1 || isLoading}
        >
          &lt;&lt;
        </button>
        <button
          onClick={() => onPageChange(paginaAtual - 1)}
          disabled={paginaAtual === 1 || isLoading}
        >
          &lt;
        </button>
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={page === paginaAtual ? styles.activePage : ""}
            disabled={isLoading}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(paginaAtual + 1)}
          disabled={paginaAtual >= totalPaginas || isLoading}
        >
          &gt;
        </button>
        <button
          onClick={() => onPageChange(totalPaginas)}
          disabled={paginaAtual >= totalPaginas || isLoading}
        >
          &gt;&gt;
        </button>
      </div>

      {/* Coluna do Meio: Contagem de itens */}
      <div className={styles.itemCount}>
        {`[${startItem} a ${endItem} de ${totalElementos}]`}
      </div>

      {/* ADICIONADO: Coluna da Direita: Seletor de itens por página */}
      <div className={styles.itemsPerPage}>
        <span>Itens por página:</span>
        <select
          value={porPagina}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          disabled={isLoading}
        >
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
};

export default PaginationControls;
