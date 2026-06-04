"use client";

import React, { useState } from "react";
import styles from "../../Painel-Coletas/components/ExpandedRow.module.css";
import pedidoStyles from "../Pedidos/Pedidos.module.css";
import useGetItensPedido from "../hooks/useGetItensPedido";
import PaginationControls from "@/app/Painel-Coletas/components/PaginationControls";
import { formatPreco } from "../utils/functions/formatPreco";
import { PedidoListItem } from "../utils/types/Pedido";

interface ExpandedPedidoRowProps {
  pedidoItem: PedidoListItem;
}

const ExpandedPedidoRow: React.FC<ExpandedPedidoRowProps> = ({ pedidoItem }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const codPedido = pedidoItem.pedido.codPedido;

  const { itens, loading, error, totalPaginas, totalElementos } =
    useGetItensPedido(codPedido, currentPage, itemsPerPage);

  const handleItemsPerPageChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  const { pedido } = pedidoItem;

  const renderTableBody = () => {
    if (loading && (!itens || itens.length === 0)) {
      return (
        <tr>
          <td colSpan={7} style={{ textAlign: "center" }}>
            Carregando itens...
          </td>
        </tr>
      );
    }
    if (error) {
      return (
        <tr>
          <td colSpan={7} style={{ textAlign: "center", color: "red" }}>
            Erro ao carregar itens: {error}
          </td>
        </tr>
      );
    }
    if (!itens || itens.length === 0) {
      return (
        <tr>
          <td colSpan={7} style={{ textAlign: "center" }}>
            Nenhum item encontrado para este pedido.
          </td>
        </tr>
      );
    }
    return itens.map((item) => (
      <tr key={`${item.codItem}-${item.ordemInsercao}`}>
        <td>{item.codItemErp}</td>
        <td>{item.descricaoItem}</td>
        <td>{item.descricaoMarca}</td>
        <td>{item.codBarra}</td>
        <td>
          {item.qtdItem} {item.unidade !== "—" ? item.unidade : ""}
        </td>
        <td>{formatPreco(item.precoUnitario)}</td>
        <td>{formatPreco(item.subTotal)}</td>
      </tr>
    ));
  };

  return (
    <div>
      <div className={pedidoStyles.additionalInfo}>
        <p>
          <strong>Condição de pagamento:</strong>{" "}
          {pedido.condicaoPagamento?.descricao || "—"}
        </p>
        <p>
          <strong>Frete:</strong> {formatPreco(pedido.valorFrete)}
        </p>
        <p>
          <strong>Outros acréscimos:</strong>{" "}
          {formatPreco(pedido.outrosAcrescimos)}
        </p>
        <p>
          <strong>Observação:</strong> {pedido.observacao || "—"}
        </p>
      </div>

      <div className={styles.itemsTableContainer}>
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th>Cód. ERP</th>
              <th>Item</th>
              <th>Marca</th>
              <th>Cód. Barras</th>
              <th>Quantidade</th>
              <th>Preço Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>{renderTableBody()}</tbody>
        </table>

        <PaginationControls
          paginaAtual={currentPage}
          totalPaginas={totalPaginas}
          totalElementos={totalElementos}
          porPagina={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          isLoading={loading}
          itemsPerPageOptions={[5, 10, 20, 1000]}
        />
      </div>
    </div>
  );
};

export default ExpandedPedidoRow;
