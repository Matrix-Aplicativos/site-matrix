export interface Cargo {
  nome: string;
  permissoes: string[];
}

export interface Municipio {
  codMunicipio: string;
  uf: string;
  nome: string;
  dataCadastro: string;
  dataUltimaAlteracao: string;
}

export interface Empresa {
  codEmpresa: number;
  codEmpresaErp: string;
  codIntegracao: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  bairro: string;
  municipio: Municipio;
  dataCadastro: string;
  dataUltimaAlteracao: string;
  ativo: true;
}

export interface TipoUsuario {
  codTipoUsuario: number;
  nome: string;
  ativo: boolean;
}

export interface Usuario {
  codUsuario: number;
  nome: string;
  cpf: string;
  email: string;
  login: string;
  tipoUsuario: TipoUsuario;
  cargos: Cargo[]; // 👈 Adicionado conforme seu JSON
  empresas: Empresa[];
  ativo: boolean;
  primeiroAcesso?: any;
}
