import React, { useState, useEffect, useMemo } from "react";
import styles from "./ModalCadastrarColeta.module.css";
import usePostColetaSobDemanda from "../hooks/usePostColetaSobDemanda";
import useGetProdutos from "../hooks/useGetProdutos";
import useGetEstoques from "../hooks/useGetEstoques";

import { Produto } from "../utils/types/Produto"; // Garanta que a tipagem tenha precoVenda e saldoDisponivel
import { FaTrash } from "react-icons/fa";
import SearchBar from "./SearchBar";
import useGetPlanoContas from "../hooks/useGetPlanoConta";

// --- Constantes e Interfaces ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  codEmpresa: number;
  codUsuario: number;
  tipoColeta: 1 | 2 | 3 | 4 | 5 | 6;
  titulo: string;
}

interface ItemNaColeta extends Produto {
  quantidade: number;
}

const FILTER_TO_API_PARAM: Record<string, string> = {
  descricao: "descricao",
  codigoErp: "codErp",
  marca: "marca",
  codBarra: "codBarras",
  codReferencia: "codReferencia",
  codFabricante: "codFabricante",
};

// Função auxiliar para formatar dinheiro
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor || 0);
};

const ModalCadastrarColeta: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  codEmpresa,
  codUsuario,
  tipoColeta,
  titulo,
}) => {
  // --- ESTADOS ---
  const [descricao, setDescricao] = useState("");

  const [codAlocEstoqueOrigem, setCodAlocEstoqueOrigem] = useState<string>("");
  const [codAlocEstoqueDestino, setCodAlocEstoqueDestino] =
    useState<string>("");

  const [codPlanoConta, setCodPlanoConta] = useState<string>("");
  const [buscaPlanoConta, setBuscaPlanoConta] = useState<string>("");

  const [itensNaColeta, setItensNaColeta] = useState<ItemNaColeta[]>([]);
  const [paginaProdutos, setPaginaProdutos] = useState(1);
  const [quantidadeParaAdicionar, setQuantidadeParaAdicionar] =
    useState<number>(1);

  const [tipoConferenciaInterno, setTipoConferenciaInterno] = useState<3 | 4>(
    tipoColeta === 4 ? 4 : 3,
  );

  const [tipoAjusteInterno, setTipoAjusteInterno] = useState<5 | 6>(
    tipoColeta === 6 ? 6 : 5,
  );

  const [productQuery, setProductQuery] = useState("");
  const [selectedProductFilter, setSelectedProductFilter] =
    useState("descricao");

  const porPaginaProdutos = 15;

  // --- HOOKS ---
  const filtrosApi = useMemo(() => {
    if (!productQuery) return {};
    const apiParamKey = FILTER_TO_API_PARAM[selectedProductFilter];
    return apiParamKey ? { [apiParamKey]: productQuery } : {};
  }, [productQuery, selectedProductFilter]);

  const filtrosPlanoConta = useMemo(() => {
    return { descricao: buscaPlanoConta };
  }, [buscaPlanoConta]);

  const {
    postColeta,
    loading: postLoading,
    error: postError,
    success,
    reset,
  } = usePostColetaSobDemanda();

  const { estoques, loading: estoquesLoading } = useGetEstoques(codEmpresa);

  const { planosContas, loading: planosLoading } = useGetPlanoContas(
    codEmpresa,
    1,
    20,
    filtrosPlanoConta,
  );

  // O Hook useGetProdutos agora retorna precoVenda e saldoDisponivel dentro de 'produtos'
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
    filtrosApi,
    isOpen,
  );

  useEffect(() => {
    if (!isOpen) {
      setDescricao("");
      setItensNaColeta([]);
      setProductQuery("");
      setSelectedProductFilter("descricao");
      setCodAlocEstoqueDestino("");
      setCodAlocEstoqueOrigem("");
      setCodPlanoConta("");
      setBuscaPlanoConta("");

      setPaginaProdutos(1);
      setQuantidadeParaAdicionar(1);
      setTipoConferenciaInterno(tipoColeta === 4 ? 4 : 3);
      setTipoAjusteInterno(tipoColeta === 6 ? 6 : 5);
    }
  }, [isOpen, tipoColeta]);

  const handleProductSearch = (query: string) => {
    setProductQuery(query);
    setPaginaProdutos(1);
  };

  const handleAdicionarItem = (produto: Produto) => {
    const itemExistente = itensNaColeta.find(
      (item) => item.codItemApi === produto.codItemApi,
    );
    if (itemExistente) {
      setItensNaColeta((prev) =>
        prev.map((item) =>
          item.codItemApi === produto.codItemApi
            ? { ...item, quantidade: item.quantidade + quantidadeParaAdicionar }
            : item,
        ),
      );
    } else {
      setItensNaColeta((prev) => [
        ...prev,
        { ...produto, quantidade: quantidadeParaAdicionar },
      ]);
    }
    setQuantidadeParaAdicionar(1);
  };

  const handleRemoverItem = (codItemToRemove: number) => {
    setItensNaColeta((prev) =>
      prev.filter((item) => item.codItemApi !== codItemToRemove),
    );
  };

  const handleQuantidadeChange = (
    codItemToUpdate: number,
    novaQuantidade: string,
  ) => {
    const qtd = parseInt(novaQuantidade, 10);
    if (isNaN(qtd) || qtd < 0) return;
    setItensNaColeta((prev) =>
      prev.map((item) =>
        item.codItemApi === codItemToUpdate
          ? { ...item, quantidade: qtd }
          : item,
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao) {
      alert("O campo de descrição é obrigatório.");
      return;
    }
    if (itensNaColeta.length === 0) {
      alert("Adicione pelo menos um item à coleta.");
      return;
    }

    let payloadTipo = tipoColeta;
    let payloadOrigem = parseInt(codAlocEstoqueOrigem, 10) || 0;
    let payloadDestino = parseInt(codAlocEstoqueDestino, 10) || 0;

    if (tipoColeta === 1) {
      if (!codAlocEstoqueDestino) {
        alert("Para inventário, o estoque de origem é obrigatório.");
        return;
      }
      payloadOrigem = payloadDestino;
    } else if (tipoColeta === 2) {
      if (!codAlocEstoqueOrigem || !codAlocEstoqueDestino) {
        alert("Para transferência, a origem e o destino são obrigatórios.");
        return;
      }
    } else if (tipoColeta === 3 || tipoColeta === 4) {
      payloadTipo = tipoConferenciaInterno;
      payloadOrigem = 0;
      payloadDestino = 0;
    } else if (tipoColeta === 5 || tipoColeta === 6) {
      payloadTipo = tipoAjusteInterno;

      if (!codAlocEstoqueOrigem) {
        alert("Selecione o local de estoque.");
        return;
      }
      if (!codPlanoConta) {
        alert("Selecione um Plano de Contas para o ajuste.");
        return;
      }

      payloadOrigem = parseInt(codAlocEstoqueOrigem, 10);
      payloadDestino = 0;
    }

    await postColeta({
      codColeta: null,
      codEmpresa,
      codUsuario,
      tipo: payloadTipo,
      descricao,
      codAlocEstoqueOrigem: payloadOrigem,
      codAlocEstoqueDestino: payloadDestino,
      codPlanoConta: codPlanoConta ? parseInt(codPlanoConta, 10) : undefined,
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
          <h1>{titulo}</h1>
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
                placeholder="Digite o nome da coleta"
                required
              />

              {(tipoColeta === 3 || tipoColeta === 4) && (
                <div className={styles.radioGroup}>
                  <label>Tipo de Conferência:</label>
                  <div className={styles.radioOptionsContainer}>
                    <label className={styles.radioLabel}>
                      Conf. Venda
                      <input
                        type="radio"
                        value="3"
                        checked={tipoConferenciaInterno === 3}
                        onChange={() => setTipoConferenciaInterno(3)}
                      />
                    </label>
                    <label className={styles.radioLabel}>
                      Conf. Compra
                      <input
                        type="radio"
                        value="4"
                        checked={tipoConferenciaInterno === 4}
                        onChange={() => setTipoConferenciaInterno(4)}
                      />
                    </label>
                  </div>
                </div>
              )}

              {(tipoColeta === 5 || tipoColeta === 6) && (
                <>
                  <div className={styles.radioGroup}>
                    <label>Tipo de Ajuste:</label>
                    <div className={styles.radioOptionsContainer}>
                      <label className={styles.radioLabel}>
                        Entrada
                        <input
                          type="radio"
                          value="5"
                          checked={tipoAjusteInterno === 5}
                          onChange={() => setTipoAjusteInterno(5)}
                        />
                      </label>
                      <label className={styles.radioLabel}>
                        Saída
                        <input
                          type="radio"
                          value="6"
                          checked={tipoAjusteInterno === 6}
                          onChange={() => setTipoAjusteInterno(6)}
                        />
                      </label>
                    </div>
                  </div>

                  <div className={styles.stockSelectRow}>
                    <label>
                      Local de Estoque
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
                            : "Selecione o Estoque"}
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
                    <label>
                      Plano de Contas
                      <select
                        value={codPlanoConta}
                        onChange={(e) => setCodPlanoConta(e.target.value)}
                        required
                      >
                        <option value="">
                          {planosLoading
                            ? "Carregando..."
                            : "Selecione a Conta"}
                        </option>
                        {planosContas.map((p) => (
                          <option key={p.codPlanoConta} value={p.codPlanoConta}>
                            {p.codPlanoContaErp} - {p.descricao}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </>
              )}

              {tipoColeta === 2 && (
                <div className={styles.stockSelectRow}>
                  <label>
                    Origem
                    <select
                      value={codAlocEstoqueOrigem}
                      onChange={(e) => setCodAlocEstoqueOrigem(e.target.value)}
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
                </div>
              )}

              {tipoColeta === 1 && (
                <label>
                  Origem
                  <select
                    value={codAlocEstoqueDestino}
                    onChange={(e) => setCodAlocEstoqueDestino(e.target.value)}
                    required
                  >
                    <option value="">
                      {estoquesLoading ? "Carregando..." : "Selecione a Origem"}
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
                        <span className={styles.produtoDescricaoSingleLine}>
                          {item.codItemErp} - {item.descricaoItem}
                        </span>
                        <span
                          style={{
                            display: "block",
                            fontSize: "0.8rem",
                            color: "#000",
                            marginTop: "2px",
                          }}
                        >
                          Preço: {formatarMoeda(item.precoVenda)} | Saldo:{" "}
                          {item.saldoDisponivel}
                        </span>
                      </div>
                      <input
                        type="number"
                        value={item.quantidade}
                        min="1"
                        onChange={(e) =>
                          handleQuantidadeChange(
                            item.codItemApi,
                            e.target.value,
                          )
                        }
                        className={styles.quantidadeInput}
                      />
                      <button
                        onClick={() => handleRemoverItem(item.codItemApi)}
                        className={styles.removerItemBtn}
                      >
                        <FaTrash color="#DA072D" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className={styles.rightPanel}>
            <SearchBar
              placeholder="Qual produto deseja buscar?"
              onSearch={handleProductSearch}
              showFilterIcon={false}
            />
            <div className={styles.controlsRow}>
              <div className={styles.filterWrapper}>
                <label htmlFor="productFilter">Buscar por</label>
                <select
                  id="productFilter"
                  value={selectedProductFilter}
                  onChange={(e) => setSelectedProductFilter(e.target.value)}
                >
                  <option value="descricao">Descrição</option>
                  <option value="codigoErp">Código ERP</option>
                  <option value="marca">Marca</option>
                  <option value="codBarra">Cód. Barras</option>
                  <option value="codReferencia">Cód. Referência</option>
                  <option value="codFabricante">Cód. Fabricante</option>
                </select>
              </div>
              <div className={styles.qtyInputWrapper}>
                <label htmlFor="quantidadeParaAdicionar">Quantidade</label>
                <input
                  id="quantidadeParaAdicionar"
                  type="number"
                  value={quantidadeParaAdicionar}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setQuantidadeParaAdicionar(val >= 1 ? val : 1);
                  }}
                  min="1"
                />
              </div>
            </div>
            <div className={styles.produtoList}>
              {produtosLoading && (
                <p className={styles.emptyList}>Buscando produtos...</p>
              )}
              {!produtosLoading && (!produtos || produtos.length === 0) && (
                <p className={styles.emptyList}>Nenhum produto encontrado.</p>
              )}
              {produtos &&
                produtos.map((produto) => (
                  <div key={produto.codItemApi} className={styles.produtoItem}>
                    <div className={styles.produtoInfo}>
                      <strong className={styles.produtoDescricao}>
                        {produto.descricaoItem} - {produto.descricaoMarca}
                      </strong>
                      <span style={{ display: "block" }}>
                        Cód. ERP: {produto.codItemErp} | Cód. Barra:{" "}
                        {produto.codBarra}
                      </span>
                      <span
                        style={{
                          display: "block",
                          marginTop: "4px",
                          color: "#333",
                          fontWeight: "500",
                        }}
                      >
                        Preço: {formatarMoeda(produto.precoVenda)} | Saldo:{" "}
                        {produto.saldoDisponivel}
                      </span>
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
                disabled={paginaProdutos <= 1 || produtosLoading}
              >
                Anterior
              </button>
              <span>
                Página {paginaProdutos} de {totalPaginas || 1}
              </span>
              <button
                onClick={() => setPaginaProdutos((p) => p + 1)}
                disabled={paginaProdutos >= totalPaginas || produtosLoading}
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
