"use client";

import React, { useState } from "react";
import styles from "./ExportCsvModal.module.css";

// Interface para as opções de exportação
export interface ExportOptions {
  startDate: string;
  endDate: string;
  formato: "csv" | "excel";
  incluirItens: boolean;
  incluirLotes: boolean;
  incluirNumerosSerie: boolean;
}

interface ExportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: ExportOptions) => void;
  isExporting: boolean;
}

const ExportCSVModal: React.FC<ExportCSVModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isExporting,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formato, setFormato] = useState<"csv" | "excel">("csv");
  const [incluirItens, setIncluirItens] = useState(false);
  const [incluirLotes, setIncluirLotes] = useState(false);
  const [incluirNumerosSerie, setIncluirNumerosSerie] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    if (!startDate || !endDate) {
      alert("Por favor, selecione a data de início e a data de fim.");
      return;
    }

    const dtInicial = new Date(startDate);
    const dtFinal = new Date(endDate);
    const diffTime = Math.abs(dtFinal.getTime() - dtInicial.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 90) {
      alert(
        "O período selecionado não pode exceder 90 dias. Por favor, ajuste as datas."
      );
      return;
    }

    onConfirm({
      startDate,
      endDate,
      formato,
      incluirItens,
      incluirLotes,
      incluirNumerosSerie,
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <h2 className={styles.modalTitle}>
          Selecione o período e formato para exportar
        </h2>

        <div className={styles.datePickerGroup}>
          <div className={styles.dateField}>
            <label htmlFor="startDate">Data de Início</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className={styles.dateField}>
            <label htmlFor="endDate">Data de Fim</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.dateField}>
          <label htmlFor="formatoRelatorio">Formato</label>
          <select
            id="formatoRelatorio"
            value={formato}
            onChange={(e) => setFormato(e.target.value as "csv" | "excel")}
          >
            <option value="csv">CSV</option>
            <option value="excel">Excel (XLSX)</option>
          </select>
        </div>

        <div className={styles.checkboxContainer}>
          <div className={styles.checkboxItem}>
            <input
              type="checkbox"
              id="incluirItens"
              checked={incluirItens}
              onChange={(e) => setIncluirItens(e.target.checked)}
            />
            <label htmlFor="incluirItens">Incluir Itens da Coleta</label>
          </div>
          <div className={styles.checkboxItem}>
            <input
              type="checkbox"
              id="incluirLotes"
              checked={incluirLotes}
              onChange={(e) => setIncluirLotes(e.target.checked)}
            />
            <label htmlFor="incluirLotes">Incluir Lotes</label>
          </div>
          <div className={styles.checkboxItem}>
            <input
              type="checkbox"
              id="incluirNumerosSerie"
              checked={incluirNumerosSerie}
              onChange={(e) => setIncluirNumerosSerie(e.target.checked)}
            />
            <label htmlFor="incluirNumerosSerie">
              Incluir Números de Série
            </label>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            onClick={onClose}
            className={`${styles.modalButton} ${styles.cancelBtn}`}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className={`${styles.modalButton} ${styles.confirmBtn}`}
            disabled={isExporting}
          >
            {isExporting ? "Exportando..." : "Exportar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportCSVModal;
