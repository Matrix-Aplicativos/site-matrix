import { ColetaExibida } from "./coletaMappers";

export interface ColetaPageTemplate {
  titulo: string;
  tipoColeta: string | string[];
  searchPlaceholder: string;
  createButtonLabel: string;
  createModalTitle: string;
  tipoMovimentoOptions?: Record<string, string>;
  columns: Array<{
    key: keyof ColetaExibida;
    label: string;
    sortable: boolean;
  }>;
}

export const INVENTARIO_TEMPLATE: ColetaPageTemplate = {
  titulo: "INVENTÁRIOS",
  tipoColeta: "1",
  searchPlaceholder: "Buscar por descrição do inventário...",
  createButtonLabel: "Cadastrar Inventário",
  createModalTitle: "Cadastrar Novo Inventário",
  columns: [
    { key: "status", label: "Status", sortable: true },
    { key: "id", label: "Código", sortable: true },
    { key: "qtdItens", label: "Qtd. Itens", sortable: false },
    { key: "qtdItensConferidos", label: "Qtd. Itens Conf.", sortable: false },
    { key: "volumeTotal", label: "Qtd. Volume", sortable: true },
    { key: "volumeConferido", label: "Qtd. Volume Conf.", sortable: true },
    { key: "data", label: "Data", sortable: true },
    { key: "descricao", label: "Descrição", sortable: true },
    { key: "estoqueOrigem", label: "Estoque Origem", sortable: false },
    { key: "origem", label: "Origem", sortable: true },
    { key: "tipoMovimento", label: "Tipo", sortable: true },
    { key: "usuario", label: "Responsável", sortable: true },
    { key: "respFinalizacao", label: "Responsável Finalização", sortable: false },
  ],
};

export const TRANSFERENCIA_TEMPLATE: ColetaPageTemplate = {
  titulo: "TRANSFERÊNCIAS",
  tipoColeta: "2",
  searchPlaceholder: "Buscar por descrição da transferência...",
  createButtonLabel: "Cadastrar Transferência",
  createModalTitle: "Cadastrar Nova Transferência",
  columns: [
    { key: "status", label: "Status", sortable: true },
    { key: "id", label: "Código", sortable: true },
    { key: "qtdItens", label: "Qtd. Itens", sortable: false },
    { key: "qtdItensConferidos", label: "Qtd. Itens Conf.", sortable: false },
    { key: "volumeTotal", label: "Qtd. Volume", sortable: true },
    { key: "volumeConferido", label: "Qtd. Volume Conf.", sortable: true },
    { key: "data", label: "Data", sortable: true },
    { key: "descricao", label: "Descrição", sortable: true },
    { key: "origem", label: "Origem", sortable: true },
    { key: "estoqueOrigem", label: "Estoque Origem", sortable: false },
    { key: "estoqueDestino", label: "Estoque Destino", sortable: false },
    { key: "tipoMovimento", label: "Tipo Mov.", sortable: true },
    { key: "usuario", label: "Responsável", sortable: true },
    { key: "respFinalizacao", label: "Responsável Finalização", sortable: false },
  ],
};

export const ROMANEIO_TEMPLATE: ColetaPageTemplate = {
  titulo: "ROMANEIOS",
  tipoColeta: "7",
  searchPlaceholder: "Buscar por descrição do romaneio...",
  createButtonLabel: "Cadastrar Romaneio",
  createModalTitle: "Cadastrar Novo Romaneio",
  columns: [
    { key: "status", label: "Status", sortable: true },
    { key: "id", label: "Código", sortable: true },
    { key: "qtdItens", label: "Qtd. Itens", sortable: false },
    { key: "qtdItensConferidos", label: "Qtd. Itens Conf.", sortable: false },
    { key: "volumeTotal", label: "Qtd. Volume", sortable: true },
    { key: "volumeConferido", label: "Qtd. Volume Conf.", sortable: true },
    { key: "data", label: "Data", sortable: true },
    { key: "descricao", label: "Descrição", sortable: true },
    { key: "origem", label: "Origem", sortable: true },
    { key: "tipoMovimento", label: "Tipo", sortable: true },
    { key: "usuario", label: "Responsável", sortable: true },
    { key: "respFinalizacao", label: "Responsável Finalização", sortable: false },
  ],
};

export const CONFERENCIA_TEMPLATE: ColetaPageTemplate = {
  titulo: "CONFERÊNCIAS",
  tipoColeta: ["3", "4"],
  searchPlaceholder: "Qual conferência deseja buscar?",
  createButtonLabel: "Cadastrar Conferência",
  createModalTitle: "Cadastrar Nova Conferência",
  tipoMovimentoOptions: {
    "Conf. Venda": "3",
    "Conf. Compra": "4",
  },
  columns: [
    { key: "status", label: "Status", sortable: true },
    { key: "id", label: "Código", sortable: true },
    { key: "qtdItens", label: "Qtd. Itens", sortable: false },
    { key: "qtdItensConferidos", label: "Qtd. Itens Conf.", sortable: false },
    { key: "volumeTotal", label: "Qtd. Volume", sortable: true },
    { key: "volumeConferido", label: "Qtd. Volume Conf.", sortable: true },
    { key: "data", label: "Data", sortable: true },
    { key: "descricao", label: "Descrição", sortable: true },
    { key: "origem", label: "Origem", sortable: true },
    { key: "tipoMovimento", label: "Tipo Mov.", sortable: true },
    { key: "usuario", label: "Responsável", sortable: true },
    { key: "respFinalizacao", label: "Responsável Finalização", sortable: false },
  ],
};

export const AJUSTE_TEMPLATE: ColetaPageTemplate = {
  titulo: "AJUSTES DE ESTOQUE",
  tipoColeta: ["5", "6"],
  searchPlaceholder: "Qual ajuste deseja buscar?",
  createButtonLabel: "Cadastrar Ajuste",
  createModalTitle: "Cadastrar Novo Ajuste de Estoque",
  tipoMovimentoOptions: {
    "Ajuste Entrada": "5",
    "Ajuste Saída": "6",
  },
  columns: [
    { key: "status", label: "Status", sortable: true },
    { key: "id", label: "Código", sortable: true },
    { key: "qtdItens", label: "Qtd. Itens", sortable: false },
    { key: "qtdItensConferidos", label: "Qtd. Itens Conf.", sortable: false },
    { key: "volumeTotal", label: "Qtd. Volume", sortable: true },
    { key: "volumeConferido", label: "Qtd. Volume Conf.", sortable: true },
    { key: "data", label: "Data", sortable: true },
    { key: "descricao", label: "Descrição", sortable: true },
    { key: "origem", label: "Origem", sortable: true },
    { key: "estoqueOrigem", label: "Estoque Origem", sortable: false },
    { key: "planoConta", label: "Plano de Contas", sortable: false },
    { key: "tipoMovimento", label: "Tipo", sortable: true },
    { key: "usuario", label: "Responsável", sortable: true },
    { key: "respFinalizacao", label: "Responsável Finalização", sortable: false },
  ],
};
