import { Configuracao } from "./Configuracao";

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
