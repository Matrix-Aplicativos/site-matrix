import type { UsuarioGet } from "../utils/types/UsuarioGet";

export interface FuncionarioExibido {
  codigo: string;
  nome: string;
  cpf: string;
  email: string;
  status: boolean;
  originalUser: UsuarioGet;
}

export type FuncionarioSortableColumn = keyof Omit<FuncionarioExibido, "originalUser">;

export const FUNCIONARIO_SORT_COLUMN_MAP: {
  [key in FuncionarioSortableColumn]?: string;
} = {
  codigo: "codFuncionarioErp",
  nome: "nome",
  cpf: "cpf",
  email: "email",
  status: "ativo",
};

export const FUNCIONARIO_FILTER_TO_API_PARAM: Record<string, string> = {
  nome: "nomeUsuario",
  cpf: "cpfusuario",
  email: "emailUsuario",
  codigo: "codUsuarioErp",
};

export const FUNCIONARIO_COLUMNS: Array<{
  key: keyof FuncionarioExibido | "acoes";
  label: string;
  sortable: boolean;
}> = [
  { key: "codigo", label: "Código", sortable: true },
  { key: "nome", label: "Nome", sortable: true },
  { key: "cpf", label: "CPF", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "acoes", label: "Ações", sortable: false },
];

export const getFuncionarioStatusText = (status: boolean) =>
  status ? "Ativo" : "Inativo";
