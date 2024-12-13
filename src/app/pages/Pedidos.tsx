import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import Table from "../components/Table";
import styles from "./Pedidos.module.css";

const PedidosPage: React.FC = () => {
  const data = [
    {
      codPedido: 101,
      codCliente: 1,
      valorTotal: 199.9,
      status: "Concluído",
      observacao: "Pedido entregue com sucesso",
      dataPedido: "2024-12-12",
      itens: [
        { codItem: 1, descricao: "Produto A", quantidade: 2, precoUnit: 50 },
        { codItem: 2, descricao: "Produto B", quantidade: 3, precoUnit: 33.3 },
      ],
    },
    {
      codPedido: 102,
      codCliente: 2,
      valorTotal: 89.9,
      status: "Pendente",
      observacao: "Aguardando pagamento",
      dataPedido: "2024-12-10",
      itens: [
        { codItem: 3, descricao: "Produto C", quantidade: 1, precoUnit: 89.9 },
      ],
    },
    {
      codPedido: 103,
      codCliente: 3,
      valorTotal: 129.9,
      status: "Cancelado",
      observacao: "Cliente desistiu da compra",
      dataPedido: "2024-12-11",
      itens: [
        { codItem: 4, descricao: "Produto D", quantidade: 2, precoUnit: 64.95 },
      ],
    },
  ];

  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  const columns = [
    { key: "codPedido", label: "Código do Pedido" },
    { key: "dataPedido", label: "Data" },
    {
      key: "valorTotal",
      label: "Valor Total",
      render: (item: any) =>
        item.valorTotal !== undefined && !isNaN(item.valorTotal)
          ? `R$ ${item.valorTotal.toFixed(2)}`
          : "N/A",
    },
    { key: "status", label: "Status" },
    { key: "observacao", label: "Observação" },
    {
      key: "actions",
      render: (item: any) => (
        <button
          style={{ background: "none", border: "none", cursor: "pointer" }}
          onClick={() => alert(`Exibindo detalhes do pedido ${item.codPedido}`)}
        >
          ▼
        </button>
      ),
    },
  ];

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = data.filter((item) =>
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(lowerQuery)
      )
    );
    setFilteredData(filtered);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>PEDIDOS</h1>
      <SearchBar placeholder="Qual pedido deseja buscar?" onSearch={handleSearch} />
      <Table columns={columns} data={filteredData} />
    </div>
  );
};

export default PedidosPage;
