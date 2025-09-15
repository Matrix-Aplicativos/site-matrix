export interface Empresa {
  codEmpresa: number;
  codEmpresaErp: string;
  codIntegracao: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  bairro: string;
  municipio: {
    codMunicipio: string;
    uf: string;
    nome: string;
    dataCadastro: string;
    dataUltimaAlteracao: string;
  };
  dataCadastro: string;
  dataUltimaAlteracao: string;
  ativo: true;
}

export interface Usuario {
  codUsuario: number;
  nome: string;
  cpf: string;
  email: string;
  login: string;
  tipoUsuario: {
    codTipoUsuario: number;
    nome: string;
    ativo: boolean; 
  };
  empresas: Empresa[]; 
  ativo: boolean; 
  primeiroAcesso?: any; 
}
