import React from "react";
import styles from "./PaginationControls.module.css";

interface PaginationControlsProps {
  paginaAtual: number;
  totalPaginas: number;
  totalElementos: number;
  porPagina: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  paginaAtual,
  totalPaginas,
  totalElementos,
  porPagina,
  onPageChange,
  isLoading = false,
}) => {
  const startItem = totalElementos > 0 ? (paginaAtual - 1) * porPagina + 1 : 0;
  const endItem = Math.min(paginaAtual * porPagina, totalElementos);

  // Lógica para gerar os botões de número de página
  const generatePageNumbers = () => {
    const pages = [];
    const total = totalPaginas || 1; // Garante que temos pelo menos uma página para o loop

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

  // Não renderiza nada se não houver itens para exibir
  if (totalElementos === 0) {
    return null;
  }

  return (
    <div className={styles.paginationWrapper}>
      {/* Controles de página na esquerda */}
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

        {/* <-- MUDANÇA APLICADA AQUI: O map agora renderiza sempre */}
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

      {/* Contagem de itens na direita */}
      <div className={styles.itemCount}>
        {`[${startItem} a ${endItem} de ${totalElementos}]`}
      </div>
    </div>
  );
};

export default PaginationControls;
