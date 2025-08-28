interface ItemConferencia {
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
  usuarioBipagem: {
    codUsuario: number;
    codUsuarioErp: string;
    nome: string;
    cpf: string;
  }
  dataHoraBipe: string;
}