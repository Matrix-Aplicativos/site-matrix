interface Coleta {
  codConferencia: number;
  codIntegracao: number;
  codEmpresa: number;
  codConferenciaErp: string;
  origem: string;
  status: string;
  tipo: number;
  descricao: string;
  usuario: {
    codUsuario: number;
    codUsuarioErp: string;
    nome: string;
    cpf: string;
    email: string;
    login: string;
    tipoUsuario: {
      codTipoUsuario: number;
      nome: string;
      ativo: boolean;
    };
    empresas: {
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
      ativo: boolean;
      acessoMatrixColeta: boolean;
      acessoMatrixFv: boolean;
    }[];
    ativo: boolean;
  };
  dataInicio: string;
  dataFim: string;
  alocOrigem: {
    codAlocEstoqueApi: number;
    codIntegracao: number;
    codEmpresaApi: number;
    codAlocEstoqueErp: string;
    descricao: string;
  };
  alocDestino: {
    codAlocEstoqueApi: number;
    codIntegracao: number;
    codEmpresaApi: number;
    codAlocEstoqueErp: string;
    descricao: string;
  };
  itens: {
    codItem: number;
    codConferencia: number;
    codIntegracao: number;
    codEmpresa: number;
    codItemErp: string;
    descricaoItem: string;
    descricaoMarca: string;
    codBarra: string;
    codReferencia: string;
    codFabricante: string;
    qtdAConferir: number;
    qtdConferida: number;
  }[];
  dataCadastro: string;
}
