"use client";

import React, { useState, useEffect } from "react";
import styles from "./ModalCadastrarColeta.module.css";
import usePutEditarColeta from "../hooks/usePutEditarColeta";
import useGetEstoques from "../hooks/useGetEstoques";
import useGetPlanoContas from "../hooks/useGetPlanoConta";
import type { EditarColetaRequest } from "../utils/types/Coleta";

/** Tipo da coleta: 1 Inventário, 2 Transferência, 3/4 Conferência, 5/6 Ajuste */
export interface ColetaParaEdicao {
  codColeta?: number | null;
  codConferencia: number;
  tipo: number;
  descricao: string;
  alocOrigem?: { codAlocEstoqueApi: number; descricao: string } | null;
  alocDestino?: { codAlocEstoqueApi: number; descricao: string } | null;
  planoConta?: { codPlanoConta: number; descricao: string } | null;
}

interface ModalEditarColetaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  codEmpresa: number;
  coleta: ColetaParaEdicao | null;
}

const TITULO_POR_TIPO: Record<number, string> = {
  1: "Editar Inventário",
  2: "Editar Transferência",
  3: "Editar Conferência (Venda)",
  4: "Editar Conferência (Compra)",
  5: "Editar Ajuste (Entrada)",
  6: "Editar Ajuste (Saída)",
};

const ModalEditarColeta: React.FC<ModalEditarColetaProps> = ({
  isOpen,
  onClose,
  onSuccess,
  codEmpresa,
  coleta,
}) => {
  const [descricao, setDescricao] = useState("");
  const [codAlocOrigem, setCodAlocOrigem] = useState<string>("");
  const [codAlocDestino, setCodAlocDestino] = useState<string>("");
  const [codPlanoConta, setCodPlanoConta] = useState<string>("");

  const { editarColeta, loading: putLoading, error: putError } = usePutEditarColeta();
  const { estoques } = useGetEstoques(codEmpresa);
  const { planosContas } = useGetPlanoContas(codEmpresa, 1, 100, {});

  const tipo = coleta?.tipo ?? 0;
  const isInventario = tipo === 1;
  const isTransferencia = tipo === 2;
  const isConferencia = tipo === 3 || tipo === 4;
  const isAjuste = tipo === 5 || tipo === 6;

  useEffect(() => {
    if (isOpen && coleta) {
      setDescricao(coleta.descricao);
      setCodAlocOrigem(String(coleta.alocOrigem?.codAlocEstoqueApi ?? "0"));
      setCodAlocDestino(String(coleta.alocDestino?.codAlocEstoqueApi ?? "0"));
      setCodPlanoConta(String(coleta.planoConta?.codPlanoConta ?? "0"));
    }
  }, [isOpen, coleta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coleta) return;
    if (!descricao.trim()) {
      alert("Descrição é obrigatória.");
      return;
    }
    const id = coleta.codColeta ?? coleta.codConferencia;
    if (id == null) {
      alert("Identificador da coleta não encontrado.");
      return;
    }
    let codOrigem = parseInt(codAlocOrigem, 10) || 0;
    let codDestino = parseInt(codAlocDestino, 10) || 0;
    const codPlano = parseInt(codPlanoConta, 10) || 0;
    if (isInventario) {
      codDestino = codOrigem;
    }
    if (isConferencia) {
      codOrigem = 0;
      codDestino = 0;
    }
    const payload: EditarColetaRequest = {
      codColeta: id,
      descricao: descricao.trim(),
      codAlocOrigem: codOrigem,
      codAlocDestino: codDestino,
      codPlanoConta: isAjuste ? codPlano : 0,
    };
    try {
      await editarColeta(payload);
      alert("Coleta atualizada com sucesso!");
      onSuccess();
      onClose();
    } catch {
      alert(putError || "Erro ao editar coleta.");
    }
  };

  if (!isOpen) return null;

  const titulo = TITULO_POR_TIPO[tipo] ?? "Editar Coleta";

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className={styles.modalHeader}>
          <h1>{titulo}</h1>
          <button type="button" onClick={onClose} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.leftPanel} style={{ width: "100%" }}>
            <form onSubmit={handleSubmit} className={styles.formSection}>
              <label htmlFor="editar-descricao">Descrição</label>
              <input
                id="editar-descricao"
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição da coleta"
                required
              />

              {isInventario && (
                <>
                  <label>Estoque</label>
                  <select
                    value={codAlocOrigem}
                    onChange={(e) => {
                      setCodAlocOrigem(e.target.value);
                      setCodAlocDestino(e.target.value);
                    }}
                  >
                    <option value="0">Selecione o estoque</option>
                    {estoques.map((e) => (
                      <option key={e.codAlocEstoqueApi} value={e.codAlocEstoqueApi}>
                        {e.descricao}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {isTransferencia && (
                <>
                  <label>Estoque Origem</label>
                  <select
                    value={codAlocOrigem}
                    onChange={(e) => setCodAlocOrigem(e.target.value)}
                  >
                    <option value="0">Selecione a origem</option>
                    {estoques.map((e) => (
                      <option key={e.codAlocEstoqueApi} value={e.codAlocEstoqueApi}>
                        {e.descricao}
                      </option>
                    ))}
                  </select>
                  <label>Estoque Destino</label>
                  <select
                    value={codAlocDestino}
                    onChange={(e) => setCodAlocDestino(e.target.value)}
                  >
                    <option value="0">Selecione o destino</option>
                    {estoques.map((e) => (
                      <option key={e.codAlocEstoqueApi} value={e.codAlocEstoqueApi}>
                        {e.descricao}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {isAjuste && (
                <>
                  <label>Estoque</label>
                  <select
                    value={codAlocOrigem}
                    onChange={(e) => setCodAlocOrigem(e.target.value)}
                  >
                    <option value="0">Selecione o estoque</option>
                    {estoques.map((e) => (
                      <option key={e.codAlocEstoqueApi} value={e.codAlocEstoqueApi}>
                        {e.descricao}
                      </option>
                    ))}
                  </select>
                  <label>Plano de Contas</label>
                  <select
                    value={codPlanoConta}
                    onChange={(e) => setCodPlanoConta(e.target.value)}
                  >
                    <option value="0">Selecione o plano de contas</option>
                    {planosContas.map((p) => (
                      <option key={p.codPlanoConta} value={p.codPlanoConta}>
                        {p.codPlanoContaErp} - {p.descricao}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </form>
          </div>
        </div>
        <div className={styles.modalActions}>
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={putLoading}
            className={styles.submitButton}
          >
            {putLoading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarColeta;
