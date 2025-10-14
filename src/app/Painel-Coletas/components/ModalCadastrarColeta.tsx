// src/app/inventarios/components/ModalCadastrarColeta.tsx

import React, { useState, useEffect, useMemo } from "react";
import styles from "./ModalCadastrarColeta.module.css";
import usePostColetaSobDemanda from "../hooks/usePostColetaSobDemanda";
import useGetProdutos from "../hooks/useGetProdutos";
import useGetEstoques from "../hooks/useGetEstoques";
import { Produto } from "../utils/types/Produto";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  codEmpresa: number;
  codUsuario: number;
  tipoColeta: 1 | 2 | 3 | 4; // Agora aceita os tipos 3 e 4
  titulo: string;
}

interface ItemNaColeta extends Produto {
  quantidade: number;
}

const ModalCadastrarColeta: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  codEmpresa,
  codUsuario,
  tipoColeta,
  titulo,
}) => {
  const [descricao, setDescricao] = useState("");
  const [codAlocEstoqueOrigem, setCodAlocEstoqueOrigem] = useState<string>("");
  const [codAlocEstoqueDestino, setCodAlocEstoqueDestino] =
    useState<string>("");
  const [itensNaColeta, setItensNaColeta] = useState<ItemNaColeta[]>([]);
  const [filtroProduto, setFiltroProduto] = useState("");
  const [paginaProdutos, setPaginaProdutos] = useState(1);
  const porPaginaProdutos = 15;

  // --- [NOVO] Estado interno para o tipo de conferência (3 ou 4) ---
  const [tipoConferenciaInterno, setTipoConferenciaInterno] = useState<3 | 4>(
    tipoColeta === 4 ? 4 : 3
  );

  const {
    postColeta,
    loading: postLoading,
    error: postError,
    success,
    reset,
  } = usePostColetaSobDemanda();
  const { estoques, loading: estoquesLoading } = useGetEstoques(codEmpresa);
  const {
    produtos,
    loading: produtosLoading,
    totalPaginas,
  } = useGetProdutos(
    codEmpresa,
    paginaProdutos,
    porPaginaProdutos,
    undefined,
    undefined,
    undefined,
    isOpen
  );

  const produtosFiltrados = useMemo(() => {
    if (!produtos) return [];
    if (!filtroProduto) return produtos;
    return produtos.filter((p) =>
      p.descricaoItem.toLowerCase().includes(filtroProduto.toLowerCase())
    );
  }, [produtos, filtroProduto]);

  useEffect(() => {
    if (!isOpen) {
      setDescricao("");
      setItensNaColeta([]);
      setFiltroProduto("");
      setCodAlocEstoqueDestino("");
      setCodAlocEstoqueOrigem("");
      setPaginaProdutos(1);
      setTipoConferenciaInterno(tipoColeta === 4 ? 4 : 3); // Reseta para o padrão
    }
  }, [isOpen, tipoColeta]);

  const handleAdicionarItem = (produto: Produto) => {
    if (itensNaColeta.find((item) => item.codItemApi === produto.codItemApi)) {
      alert("Este item já foi adicionado.");
      return;
    }
    setItensNaColeta((prev) => [...prev, { ...produto, quantidade: 1 }]);
  };
  const handleRemoverItem = (codItemToRemove: number) => {
    setItensNaColeta((prev) =>
      prev.filter((item) => item.codItemApi !== codItemToRemove)
    );
  };
  const handleQuantidadeChange = (
    codItemToUpdate: number,
    novaQuantidade: string
  ) => {
    const qtd = parseInt(novaQuantidade, 10);
    if (isNaN(qtd) || qtd < 0) return;
    setItensNaColeta((prev) =>
      prev.map((item) =>
        item.codItemApi === codItemToUpdate
          ? { ...item, quantidade: qtd }
          : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itensNaColeta.length === 0) {
      alert("Adicione pelo menos um item à coleta.");
      return;
    }

    let payloadTipo = tipoColeta;
    let payloadOrigem = parseInt(codAlocEstoqueOrigem, 10) || 0;
    let payloadDestino = parseInt(codAlocEstoqueDestino, 10) || 0;

    // --- [NOVO] Lógica de payload para cada tipo de coleta ---
    if (tipoColeta === 1) {
      // Inventário
      if (!codAlocEstoqueDestino) {
        alert("Para inventário, o estoque de destino é obrigatório.");
        return;
      }
      payloadOrigem = payloadDestino; // Workaround para a API que não aceita 0
    } else if (tipoColeta === 2) {
      // Transferência
      if (!codAlocEstoqueOrigem || !codAlocEstoqueDestino) {
        alert("Para transferência, a origem e o destino são obrigatórios.");
        return;
      }
    } else if (tipoColeta === 3 || tipoColeta === 4) {
      // Conferência
      payloadTipo = tipoConferenciaInterno; // Usa o tipo selecionado no radio button
      payloadOrigem = 0; // Envia 0 como "nulo"
      payloadDestino = 0; // Envia 0 como "nulo"
    }

    await postColeta({
      codColeta: 0,
      codEmpresa,
      codUsuario,
      tipo: payloadTipo,
      descricao,
      codAlocEstoqueOrigem: payloadOrigem,
      codAlocEstoqueDestino: payloadDestino,
      itens: itensNaColeta.map((item) => ({
        codItem: item.codItemApi,
        quantidade: item.quantidade,
      })),
    });
  };

  useEffect(() => {
    if (success) {
      alert("Coleta cadastrada com sucesso!");
      onSuccess();
      reset();
    }
  }, [success, onSuccess, reset]);
  useEffect(() => {
    if (postError) {
      alert(`Falha no cadastro: ${postError}`);
      reset();
    }
  }, [postError, reset]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{titulo}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.leftPanel}>
            <div className={styles.formSection}>
              <label htmlFor="descricao">Descrição</label>
              <input
                id="descricao"
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
              />

              {/* --- [NOVO] Renderização condicional dos campos --- */}
              {tipoColeta === 3 || tipoColeta === 4 ? (
                <div className={styles.radioGroup}>
                  <label>Tipo de Conferência:</label>
                  <div>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        value="3"
                        checked={tipoConferenciaInterno === 3}
                        onChange={() => setTipoConferenciaInterno(3)}
                      />{" "}
                      Conf. Venda
                    </label>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        value="4"
                        checked={tipoConferenciaInterno === 4}
                        onChange={() => setTipoConferenciaInterno(4)}
                      />{" "}
                      Conf. Compra
                    </label>
                  </div>
                </div>
              ) : (
                <>
                  {tipoColeta === 2 && (
                    <label>
                      Origem
                      <select
                        value={codAlocEstoqueOrigem}
                        onChange={(e) =>
                          setCodAlocEstoqueOrigem(e.target.value)
                        }
                        required
                      >
                        <option value="">
                          {estoquesLoading
                            ? "Carregando..."
                            : "Selecione a Origem"}
                        </option>
                        {estoques.map((e) => (
                          <option
                            key={e.codAlocEstoqueApi}
                            value={e.codAlocEstoqueApi}
                          >
                            {e.descricao}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label>
                    Destino
                    <select
                      value={codAlocEstoqueDestino}
                      onChange={(e) => setCodAlocEstoqueDestino(e.target.value)}
                      required
                    >
                      <option value="">
                        {estoquesLoading
                          ? "Carregando..."
                          : "Selecione o Destino"}
                      </option>
                      {estoques.map((e) => (
                        <option
                          key={e.codAlocEstoqueApi}
                          value={e.codAlocEstoqueApi}
                        >
                          {e.descricao}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}
            </div>

            <div className={styles.coletaItensSection}>
              <h4>Itens na Coleta ({itensNaColeta.length})</h4>
              <div className={styles.coletaItensList}>
                {itensNaColeta.length === 0 ? (
                  <p className={styles.emptyList}>
                    Adicione produtos da lista ao lado.
                  </p>
                ) : (
                  itensNaColeta.map((item) => (
                    <div key={item.codItemApi} className={styles.coletaItem}>
                      <div className={styles.coletaItemInfo}>
                        <span>
                          {item.codItemApi} - {item.descricaoItem}
                        </span>
                      </div>
                      <input
                        type="number"
                        value={item.quantidade}
                        min="1"
                        onChange={(e) =>
                          handleQuantidadeChange(
                            item.codItemApi,
                            e.target.value
                          )
                        }
                        className={styles.quantidadeInput}
                      />
                      <button
                        onClick={() => handleRemoverItem(item.codItemApi)}
                        className={styles.removerItemBtn}
                      >
                        -
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className={styles.rightPanel}>
            <h4>Buscar Produtos</h4>
            <input
              type="text"
              placeholder="Digite para buscar..."
              value={filtroProduto}
              onChange={(e) => setFiltroProduto(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.produtoList}>
              {produtosLoading && <p>Buscando produtos...</p>}
              {!produtosLoading &&
                produtosFiltrados?.map((produto) => (
                  <div key={produto.codItemApi} className={styles.produtoItem}>
                    <div className={styles.produtoInfo}>
                      <strong>
                        {produto.codItemApi} - {produto.descricaoItem}
                      </strong>
                      <span>Marca: {produto.descricaoMarca}</span>
                    </div>
                    <button
                      onClick={() => handleAdicionarItem(produto)}
                      className={styles.adicionarItemBtn}
                    >
                      +
                    </button>
                  </div>
                ))}
            </div>
            <div className={styles.paginationControls}>
              <button
                onClick={() => setPaginaProdutos((p) => p - 1)}
                disabled={paginaProdutos <= 1}
              >
                Anterior
              </button>
              <span>
                Página {paginaProdutos} de {totalPaginas}
              </span>
              <button
                onClick={() => setPaginaProdutos((p) => p + 1)}
                disabled={paginaProdutos >= totalPaginas}
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
        <div className={styles.modalActions}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={postLoading}
            className={styles.submitButton}
          >
            {postLoading ? "Salvando..." : "Salvar Coleta"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCadastrarColeta;
