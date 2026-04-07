export type TipoColeta = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface StrategyInput {
  tipoColeta: TipoColeta;
  tipoConferenciaInterno: 3 | 4;
  tipoAjusteInterno: 5 | 6;
  codAlocEstoqueOrigem: string;
  codAlocEstoqueDestino: string;
  codPlanoConta: string;
}

interface StrategyOutput {
  payloadTipo: TipoColeta;
  payloadOrigem: number;
  payloadDestino: number;
  validationError: string | null;
}

export function getInitialTipoConferencia(tipoColeta: TipoColeta): 3 | 4 {
  return tipoColeta === 4 ? 4 : 3;
}

export function getInitialTipoAjuste(tipoColeta: TipoColeta): 5 | 6 {
  return tipoColeta === 6 ? 6 : 5;
}

export function resolveColetaPayloadByStrategy({
  tipoColeta,
  tipoConferenciaInterno,
  tipoAjusteInterno,
  codAlocEstoqueOrigem,
  codAlocEstoqueDestino,
  codPlanoConta,
}: StrategyInput): StrategyOutput {
  let payloadTipo: TipoColeta = tipoColeta;
  let payloadOrigem = parseInt(codAlocEstoqueOrigem, 10) || 0;
  let payloadDestino = parseInt(codAlocEstoqueDestino, 10) || 0;

  if (tipoColeta === 1 || tipoColeta === 7) {
    if (!codAlocEstoqueDestino) {
      return {
        payloadTipo,
        payloadOrigem,
        payloadDestino,
        validationError:
          tipoColeta === 7
            ? "Para romaneio, o estoque de origem e obrigatorio."
            : "Para inventario, o estoque de origem e obrigatorio.",
      };
    }
    payloadOrigem = payloadDestino;
  } else if (tipoColeta === 2) {
    if (!codAlocEstoqueOrigem || !codAlocEstoqueDestino) {
      return {
        payloadTipo,
        payloadOrigem,
        payloadDestino,
        validationError:
          "Para transferencia, a origem e o destino sao obrigatorios.",
      };
    }
  } else if (tipoColeta === 3 || tipoColeta === 4) {
    payloadTipo = tipoConferenciaInterno;
    payloadOrigem = 0;
    payloadDestino = 0;
  } else if (tipoColeta === 5 || tipoColeta === 6) {
    payloadTipo = tipoAjusteInterno;
    if (!codAlocEstoqueOrigem) {
      return {
        payloadTipo,
        payloadOrigem,
        payloadDestino,
        validationError: "Selecione o local de estoque.",
      };
    }
    if (!codPlanoConta) {
      return {
        payloadTipo,
        payloadOrigem,
        payloadDestino,
        validationError: "Selecione um Plano de Contas para o ajuste.",
      };
    }
    payloadOrigem = parseInt(codAlocEstoqueOrigem, 10);
    payloadDestino = 0;
  }

  return { payloadTipo, payloadOrigem, payloadDestino, validationError: null };
}
