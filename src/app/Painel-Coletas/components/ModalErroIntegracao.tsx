"use client";

import React, { useEffect } from "react";
import styles from "./ModalErroIntegracao.module.css";

interface ModalErroIntegracaoProps {
  isOpen: boolean;
  onClose: () => void;
  mensagem: string;
  codColeta?: number;
}

const IconErrorLarge = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="#d32f2f"
    width={24}
    height={24}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
    />
  </svg>
);

export default function ModalErroIntegracao({
  isOpen,
  onClose,
  mensagem,
  codColeta,
}: ModalErroIntegracaoProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-erro-integracao-coleta-title"
      >
        <div className={styles.modalHeader}>
          <div className={styles.iconWrapper}>
            <IconErrorLarge />
          </div>
          <div className={styles.headerText}>
            <h2
              id="modal-erro-integracao-coleta-title"
              className={styles.modalTitle}
            >
              Erro na Integração
            </h2>
            {codColeta != null && (
              <p className={styles.modalSubtitle}>Coleta #{codColeta}</p>
            )}
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.messageBox}>
            {mensagem || "Nenhuma mensagem de erro disponível."}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={onClose}
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
