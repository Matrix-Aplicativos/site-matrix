"use client";

import styles from "./PaginationControls.module.css";

interface PaginationControlsProps {
  paginaAtual: number;
  totalPaginas: number;
  totalElementos: number;
  porPagina: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
  isLoading?: boolean;
  itemsPerPageOptions?: number[];
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  paginaAtual,
  totalPaginas,
  totalElementos,
  porPagina,
  onPageChange,
  onItemsPerPageChange,
  isLoading = false,
  itemsPerPageOptions = [20, 50, 100],
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
    <div className={styles.paginationWrapper}>
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

      <div className={styles.itemCount}>
        {`[${startItem} a ${endItem} de ${totalElementos}]`}
      </div>

      <div className={styles.itemsPerPage}>
        <span>Itens por página:</span>
        <select
          value={porPagina}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          disabled={isLoading}
        >
          {itemsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default PaginationControls;
