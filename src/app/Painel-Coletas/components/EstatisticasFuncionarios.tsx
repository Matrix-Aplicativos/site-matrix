"use client";

import styles from "./EstatisticasFuncionarios.module.css";

// Interface para definir as propriedades que o componente espera
interface EstatisticasFuncionariosProps {
  totalColetas: number;
  totalItens: number;
  totalVolume: number;
  isLoading: boolean;
}

export default function EstatisticasFuncionarios({
  totalColetas,
  totalItens,
  totalVolume,
  isLoading,
}: EstatisticasFuncionariosProps) {
  if (isLoading) {
    return (
      <div className={styles.tablesWithStats}>
        <div className={styles.statWithTable}>Carregando totais...</div>
      </div>
    );
  }

  return (
    <div className={styles.tablesWithStats}>
      {/* Card 1: Total de Coletas */}
      <div className={styles.statWithTable}>
        <div className={styles.stat}>
          <span className={styles.number}>{totalColetas}</span>
          {/* A classe .label foi removida daqui */}
          <span>Total de Coletas</span>
        </div>
      </div>

      {/* Card 2: Total Itens Bipados */}
      <div className={styles.statWithTable}>
        <div className={styles.stat}>
          <span className={styles.number}>{totalItens}</span>
          {/* A classe .label foi removida daqui */}
          <span>Itens Bipados</span>
        </div>
      </div>

      {/* Card 3: Volume Total Bipado */}
      <div className={styles.statWithTable}>
        <div className={styles.stat}>
          <span className={styles.number}>
            {totalVolume.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          {/* A classe .label foi removida daqui */}
          <span>Volume Bipado</span>
        </div>
      </div>
    </div>
  );
}
