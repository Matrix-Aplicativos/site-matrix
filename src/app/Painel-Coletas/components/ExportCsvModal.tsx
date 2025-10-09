"use client";

import React, { useState } from "react";
import styles from "./ExportCSVModal.module.css";

// --- CORREÇÃO 1: Criando uma interface para as opções de confirmação ---
export interface ExportOptions {
  startDate: string;
  endDate: string;
  incluirItens: boolean;
  incluirLotes: boolean;
  incluirNumerosSerie: boolean;
}

interface ExportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  // --- CORREÇÃO 2: A função onConfirm agora recebe o objeto de opções ---
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
  // --- CORREÇÃO 3: Estados para os novos checkboxes ---
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
    // --- CORREÇÃO 4: Passando todas as opções para a função onConfirm ---
    onConfirm({
      startDate,
      endDate,
      incluirItens,
      incluirLotes,
      incluirNumerosSerie,
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Selecione a data para exportar os dados</h2>
        <div className={styles.datePickers}>
          <div className={styles.dateInputGroup}>
            <label htmlFor="startDate">Data de Início</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className={styles.dateInputGroup}>
            <label htmlFor="endDate">Data de Fim</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* --- CORREÇÃO 5: Adicionando a seção de checkboxes --- */}
        <div className={styles.optionsContainer}>
          <div className={styles.optionItem}>
            <input
              type="checkbox"
              id="incluirItens"
              checked={incluirItens}
              onChange={(e) => setIncluirItens(e.target.checked)}
            />
            <label htmlFor="incluirItens">Incluir Itens da Coleta</label>
          </div>
          <div className={styles.optionItem}>
            <input
              type="checkbox"
              id="incluirLotes"
              checked={incluirLotes}
              onChange={(e) => setIncluirLotes(e.target.checked)}
            />
            <label htmlFor="incluirLotes">Incluir Lotes</label>
          </div>
          <div className={styles.optionItem}>
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

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className={styles.confirmButton}
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
