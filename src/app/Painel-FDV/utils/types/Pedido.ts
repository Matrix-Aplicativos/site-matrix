import { Item } from "./Item";
import { Parcela } from "./Parcela";
import { Vendedor } from "./Vendedor";

export interface Pedido {
  cliente: any;
  codEmpresa: number,
  codPedido: number,
  codCliente: {
    codCliente: number,
    codEmpresa: number,
    codIntegracao: number,
    codClienteErp: string,
    razaoSocial: string,
    nomeFantasia: string,
    cnpjCpf: string,
    fone1: string,
    fone2: string,
    email: string,
    municipio: {
      codMunicipio: string,
      uf: string,
      nome: string,
      dataCadastro: string,
      dataUltimaAlteracao: string
    },
    bairro: string,
    endereco: string,
    complemento: string,
    cep: string,
    segmento: {
      codSegmentoCliente: number,
      codIntegracao: number,
      codEmpresa: number,
      codSegmentoClienteErp: string,
      descricao: string,
      dataCadastro: string,
      dataUltimaAlteracao: string,
      ativo: true
    },
    limiteCredito: number,
    situacao: string,
    rota: {
      codRota: number,
      codRotaErp: string,
      codIntegracao: number,
      descricao: string,
      correcao: number,
      dataCadastro: string,
      dataUltimaAlteracao: string,
      ativo: true
    },
    vendedorResponsavel: {
      codUsuario: number,
      codUsuarioErp: string,
      nome: string,
      cpf: string,
      email: string,
      login: string,
      senha: string,
      tipoUsuario: {
        codTipoUsuario: number,
        descricao: string,
        dataCadastro: string,
        dataUltimaAlteracao: string,
        ativo: true,
        authority: string
      },
      dataCadastro: string,
      dataUltimaAlteracao: string,
      ativo: true,
      primeiroAcesso: true,
      username: string,
      password: string,
      authorities: [
        {
          authority: string
        }
      ],
      accountNonExpired: true,
      credentialsNonExpired: true,
      accountNonLocked: true,
      enabled: true
    },
    dataCadastro: string,
    dataUltimaAlteracao: string,
    ativo: true,
    areceber: [
      {
        id: {
          numDocumento: number,
          numParcela: number
        },
        observacao: string,
        dataLancamento: string,
        dataVencimento: string,
        valor: number,
        dataCadastro: string,
        dataUltimaAlteracao: string
      }
    ],
    classificacao: {
      codClassificacao: number,
      codEmpresa: number,
      codIntegracao: number,
      codClassificacaoErp: string,
      descricao: string,
      dataCadastro: string,
      dataUltimaAlteracao: string,
      ativo: true
    },
    tipo: number
  },
  vendedor: {
    codUsuario: number,
    codUsuarioErp: string,
    nome: string,
    cpf: string,
    email: string,
    login: string,
    senha: string,
    tipoUsuario: {
      codTipoUsuario: number,
      descricao: string,
      dataCadastro: string,
      dataUltimaAlteracao: string,
      ativo: true,
      authority: string
    },
    dataCadastro: string,
    dataUltimaAlteracao: string,
    ativo: true,
    primeiroAcesso: true,
    username: string,
    password: string,
    authorities: [
      {
        authority: string
      }
    ],
    accountNonExpired: true,
    credentialsNonExpired: true,
    accountNonLocked: true,
    enabled: true
  },
  condicaoPagamento: {
    codCondPagamento: number,
    codIntegracao: number,
    codEmpresa: number,
    codCondPagamentoErp: string,
    descricao: string,
    desdobramento: string,
    correcao: number,
    valorMinimo: number,
    utilizaPrecoDeCusto: true,
    percSobreCusto: number,
    dataCadastro: string,
    dataUltimaAlteracao: string,
    ativo: true
  },
  observacao: string,
  valorTotal: number,
  status: string,
  transportadora: {
    codFornecedor: number,
    codIntegracao: number,
    codEmpresa: number,
    codFornecedorErp: string,
    cnpj: string,
    razaoSocial: string,
    nomeFantasia: string,
    tipo: string,
    municipio: {
      codMunicipio: string,
      uf: string,
      nome: string,
      dataCadastro: string,
      dataUltimaAlteracao: string
    },
    bairro: string,
    endereco: string,
    complementoEndereco: string,
    cep: string,
    dataCadastro: string,
    dataUltimaAlteracao: string,
    ativo: true
  },
  itens: [
    {
      id: {
        pedido: {
          codPedido: number,
          codIntegracao: number,
          codEmpresa: number,
          codPedidoErp: string,
          cliente: {
            codCliente: number,
            codEmpresa: number,
            codIntegracao: number,
            codClienteErp: string,
            razaoSocial: string,
            nomeFantasia: string,
            cnpjCpf: string,
            fone1: string,
            fone2: string,
            email: string,
            municipio: {
              codMunicipio: string,
              uf: string,
              nome: string,
              dataCadastro: string,
              dataUltimaAlteracao: string
            },
            bairro: string,
            endereco: string,
            complemento: string,
            cep: string,
            segmento: {
              codSegmentoCliente: number,
              codIntegracao: number,
              codEmpresa: number,
              codSegmentoClienteErp: string,
              descricao: string,
              dataCadastro: string,
              dataUltimaAlteracao: string,
              ativo: true
            },
            limiteCredito: number,
            situacao: string,
            rota: {
              codRota: number,
              codRotaErp: string,
              codIntegracao: number,
              descricao: string,
              correcao: number,
              dataCadastro: string,
              dataUltimaAlteracao: string,
              ativo: true
            },
            vendedorResponsavel: {
              codUsuario: number,
              codUsuarioErp: string,
              nome: string,
              cpf: string,
              email: string,
              login: string,
              senha: string,
              tipoUsuario: {
                codTipoUsuario: number,
                descricao: string,
                dataCadastro: string,
                dataUltimaAlteracao: string,
                ativo: true,
                authority: string
              },
              dataCadastro: string,
              dataUltimaAlteracao: string,
              ativo: true,
              primeiroAcesso: true,
              username: string,
              password: string,
              authorities: [
                {
                  authority: string
                }
              ],
              accountNonExpired: true,
              credentialsNonExpired: true,
              accountNonLocked: true,
              enabled: true
            },
            dataCadastro: string,
            dataUltimaAlteracao: string,
            ativo: true,
            areceber: [
              {
                id: {
                  numDocumento: number,
                  numParcela: number
                },
                observacao: string,
                dataLancamento: string,
                dataVencimento: string,
                valor: number,
                dataCadastro: string,
                dataUltimaAlteracao: string
              }
            ],
            classificacao: {
              codClassificacao: number,
              codEmpresa: number,
              codIntegracao: number,
              codClassificacaoErp: string,
              descricao: string,
              dataCadastro: string,
              dataUltimaAlteracao: string,
              ativo: true
            },
            tipo: number
          },
          usuario: {
            codUsuario: number,
            codUsuarioErp: string,
            nome: string,
            cpf: string,
            email: string,
            login: string,
            senha: string,
            tipoUsuario: {
              codTipoUsuario: number,
              descricao: string,
              dataCadastro: string,
              dataUltimaAlteracao: string,
              ativo: true,
              authority: string
            },
            dataCadastro: string,
            dataUltimaAlteracao: string,
            ativo: true,
            primeiroAcesso: true,
            username: string,
            password: string,
            authorities: [
              {
                authority: string
              }
            ],
            accountNonExpired: true,
            credentialsNonExpired: true,
            accountNonLocked: true,
            enabled: true
          },
          condicaoPagamento: {
            codCondPagamento: number,
            codIntegracao: number,
            codEmpresa: number,
            codCondPagamentoErp: string,
            descricao: string,
            desdobramento: string,
            correcao: number,
            valorMinimo: number,
            utilizaPrecoDeCusto: true,
            percSobreCusto: number,
            dataCadastro: string,
            dataUltimaAlteracao: string,
            ativo: true
          },
          observacao: string,
          valorTotal: number,
          status: string,
          parcelamento: [
            {
              id: {
                numParcela: number,
                dataVencimentoParcela: string
              },
              valor: number,
              dataCadastro: string,
              dataUltimaAlteracao: string
            }
          ],
          outrosAcrescimos: number,
          valorFrete: number,
          transportadora: {
            codFornecedor: number,
            codIntegracao: number,
            codEmpresa: number,
            codFornecedorErp: string,
            cnpj: string,
            razaoSocial: string,
            nomeFantasia: string,
            tipo: string,
            municipio: {
              codMunicipio: string,
              uf: string,
              nome: string,
              dataCadastro: string,
              dataUltimaAlteracao: string
            },
            bairro: string,
            endereco: string,
            complementoEndereco: string,
            cep: string,
            dataCadastro: string,
            dataUltimaAlteracao: string,
            ativo: true
          },
          numNotaFiscal: string,
          intgenerico1: number,
          intgenerico2: number,
          intgenerico3: number,
          textgenerico1: string,
          textgenerico2: string,
          textgenerico3: string,
          dategenerico1: string,
          dategenerico2: string,
          dategenerico3: string,
          dataCadastro: string,
          dataUltimaAlteracao: string
        },
        item: {
          codItem: number,
          codIntegracao: number,
          codEmpresa: number,
          codItemErp: string,
          descricaoItem: string,
          descricaoMarca: string,
          codBarra: string,
          codReferencia: string,
          codFabricante: string,
          grupo: string,
          subGrupo: string,
          familia: string,
          departamento: string,
          unidade: string,
          precoVenda: number,
          precoRevenda: number,
          precoPromocao: number,
          custo: number,
          dataInicioPromocao: string,
          dataFimPromocao: string,
          saldoDisponivel: number,
          porcentagemDescontoMax: number,
          dataCadastro: string,
          dataUltimaAlteracao: string,
          ativo: true,
          regrasDePreco: [
            {
              id: {
                codCliente: number,
                codClassificao: number,
                codCondPagamento: number,
                item: string
              },
              valorDesconto: number,
              tipoDesconto: string,
              quantidadeAPartir: number,
              dataCadastro: string,
              dataUltimaAlteracao: string,
              ativo: true
            }
          ]
        }
      },
      ordemInsercao: number,
      qtdItem: number,
      descontoUnitario: number,
      porcentagemDescontoUnitario: number,
      precoUnitario: number,
      dataCadastro: string,
      dataultimaAlteracao: string,
      procentagemDescontoUnitario: number
    }
  ],
  parcelas: [
    {
      id: {
        numParcela: number,
        dataVencimentoParcela: string
      },
      valor: number,
      dataCadastro: string,
      dataUltimaAlteracao: string
    }
  ],
  dataCadastro: string,
  outrosAcrescimos: number,
  valorFrete: number
  }