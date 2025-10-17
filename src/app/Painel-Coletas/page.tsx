"use client";

import { useState, useMemo, useEffect } from "react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import styles from "./Home.module.css";
import { useLoading } from "../shared/Context/LoadingContext";

// Hooks de dados
import useCurrentCompany from "./hooks/useCurrentCompany";
import useGetGraficoFuncionarios from "./hooks/useGetGraficoFuncionarios";
import useGetGraficoColetas from "./hooks/useGraficoColetas";

// Componentes
import RelatorioColetas from "./components/RelatorioColetas";
import RelatorioFuncionarios from "./components/RelatorioFuncionarios";
import EstatisticasFuncionarios from "./components/EstatisticasFuncionarios";
import LoadingOverlay from "../shared/components/LoadingOverlay";

// Tipos e Constantes
const OPCOES_TIPO = {
  Inventario: 1,
  Transferencia: 2,
  "Conf. Venda": 3,
  "Conf. Compra": 4,
};
const TODOS_OS_TIPOS = Object.values(OPCOES_TIPO);
type TipoMetrica =
  | "coletasRealizadas"
  | "itensDistintosBipados"
  | "volumeTotalBipado";

export default function HomePage() {
  const { showLoading, hideLoading } = useLoading();
  const [view, setView] = useState<"mensal" | "anual">("mensal");
  const { empresa, loading: companyLoading } = useCurrentCompany();
  const codEmpresa = empresa?.codEmpresa;
  const hoje = new Date();

  // --- LÓGICA DO RELATÓRIO DE COLETAS (sem alterações) ---
  const mesAnteriorDate = subMonths(hoje, 1);
  const dataInicioMesAtual = format(startOfMonth(hoje), "yyyy-MM-dd");
  const dataFimMesAtual = format(endOfMonth(hoje), "yyyy-MM-dd");
  const dataInicioMesAnterior = format(
    startOfMonth(mesAnteriorDate),
    "yyyy-MM-dd"
  );
  const dataFimMesAnterior = format(endOfMonth(mesAnteriorDate), "yyyy-MM-dd");

  const { dados: dadosMesAtual, loading: loadingMesAtual } =
    useGetGraficoColetas(
      codEmpresa,
      dataInicioMesAtual,
      dataFimMesAtual,
      "DIA"
    );
  const { dados: dadosMesAnterior, loading: loadingMesAnterior } =
    useGetGraficoColetas(
      codEmpresa,
      dataInicioMesAnterior,
      dataFimMesAnterior,
      "DIA"
    );

  const {
    totalColetas,
    inventarios,
    transferencias,
    conferencias,
    variacaoColetas,
  } = useMemo(() => {
    // (código de processamento de dados de coletas omitido para brevidade)
    const processarDadosAgregados = (dados: any[] | null | undefined) => {
      if (!dados || dados.length === 0)
        return { total: 0, tipo1: 0, tipo2: 0, tipo3e4: 0 };
      return dados.reduce(
        (acc, itemDiario) => {
          acc.total += itemDiario.totalColetas;
          if (itemDiario.contagemPorTipo) {
            itemDiario.contagemPorTipo.forEach((tipoInfo: any) => {
              switch (tipoInfo.tipo.toUpperCase()) {
                case "INVENTARIO":
                  acc.tipo1 += tipoInfo.quantidade;
                  break;
                case "TRANSFERENCIA":
                  acc.tipo2 += tipoInfo.quantidade;
                  break;
                case "CONFERENCIA_VENDA":
                case "CONFERENCIA_COMPRA":
                case "CONFERENCIA":
                  acc.tipo3e4 += tipoInfo.quantidade;
                  break;
              }
            });
          }
          return acc;
        },
        { total: 0, tipo1: 0, tipo2: 0, tipo3e4: 0 }
      );
    };
    const statsMesAtual = processarDadosAgregados(dadosMesAtual);
    const statsMesAnterior = processarDadosAgregados(dadosMesAnterior);
    const totalAtual = statsMesAtual.total;
    const totalAnterior = statsMesAnterior.total;
    const variacao =
      totalAnterior > 0
        ? ((totalAtual - totalAnterior) / totalAnterior) * 100
        : totalAtual > 0
        ? 100
        : null;
    return {
      totalColetas: totalAtual,
      inventarios: statsMesAtual.tipo1,
      transferencias: statsMesAtual.tipo2,
      conferencias: statsMesAtual.tipo3e4,
      variacaoColetas: variacao,
    };
  }, [dadosMesAtual, dadosMesAnterior]);

  // --- ESTADO E LÓGICA DO RELATÓRIO DE FUNCIONÁRIOS (ATUALIZADO) ---
  const inicioDoMesCorrente = format(startOfMonth(hoje), "yyyy-MM-dd");
  const fimDoMesCorrente = format(endOfMonth(hoje), "yyyy-MM-dd");

  const [dataInicioInput, setDataInicioInput] = useState(inicioDoMesCorrente);
  const [dataFimInput, setDataFimInput] = useState(fimDoMesCorrente);
  const [tiposSelecionados, setTiposSelecionados] =
    useState<number[]>(TODOS_OS_TIPOS);
  const [metricaSelecionada, setMetricaSelecionada] =
    useState<TipoMetrica>("coletasRealizadas");

  // NOVO: Estado que servirá como "gatilho" para o refresh
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Este estado ainda é útil para garantir que o hook não dispare a cada digitação,
  // mas agora o refresh será forçado pelo `refreshTrigger`.
  const [dateRangeAtivo, setDateRangeAtivo] = useState({
    inicio: inicioDoMesCorrente,
    fim: fimDoMesCorrente,
  });

  // ALTERADO: O hook agora recebe o `refreshTrigger` como uma de suas dependências
  const {
    dados: dadosFuncionarios,
    loading: funcionariosLoading,
    error: funcionariosError,
  } = useGetGraficoFuncionarios(
    codEmpresa,
    dateRangeAtivo.inicio,
    dateRangeAtivo.fim,
    tiposSelecionados,
    refreshTrigger // Passa o gatilho para o hook
  );

  // ALTERADO: A função agora atualiza as datas E dispara o gatilho
  const handlePesquisarFuncionarios = () => {
    setDateRangeAtivo({ inicio: dataInicioInput, fim: dataFimInput });
    setRefreshTrigger((prev) => prev + 1); // Força a re-execução do hook de dados
  };

  const { totalColetasFunc, totalItensFunc, totalVolumeFunc } = useMemo(() => {
    // (código de processamento dos totais de funcionários omitido para brevidade)
    if (!dadosFuncionarios || dadosFuncionarios.length === 0)
      return { totalColetasFunc: 0, totalItensFunc: 0, totalVolumeFunc: 0 };
    return dadosFuncionarios.reduce(
      (acc, curr) => {
        acc.totalColetasFunc += curr.coletasRealizadas;
        acc.totalItensFunc += curr.itensDistintosBipados;
        acc.totalVolumeFunc += curr.volumeTotalBipado;
        return acc;
      },
      { totalColetasFunc: 0, totalItensFunc: 0, totalVolumeFunc: 0 }
    );
  }, [dadosFuncionarios]);

  const isLoading = companyLoading || loadingMesAtual || loadingMesAnterior;
  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  if (isLoading)
    return <div className={styles.container}>Carregando painel...</div>;
  if (!empresa)
    return (
      <div className={styles.container}>
        <h2>Nenhuma empresa associada</h2>
        <p>Sua conta não está vinculada a nenhuma empresa.</p>
      </div>
    );

  return (
    <div className={styles.container}>
      <LoadingOverlay />
      <h1 className={styles.title}>
        SEU PAINEL DE CONTROLE - {empresa.nomeFantasia?.toUpperCase()}
      </h1>

      {/* Bloco do Relatório de Coletas */}
      <div className={styles.border}>
        <RelatorioColetas view={view} onViewChange={setView} />
      </div>
      <div className={styles.border}>
        <div className={styles.tablesWithStats}>
          {/* Cards de estatísticas de coletas... */}
          <div className={styles.statWithTable}>
            <div className={styles.stat}>
              <span className={styles.number}>{totalColetas}</span>
              <span>Total de Coletas</span>
              {variacaoColetas !== null ? (
                <span className={styles.comparison}>
                  <span
                    className={
                      variacaoColetas >= 0 ? styles.positive : styles.negative
                    }
                  >
                    {" "}
                    {variacaoColetas >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(variacaoColetas).toFixed(1)}%
                  </span>{" "}
                  vs mês anterior
                </span>
              ) : (
                <span className={styles.comparison}>Sem dados anteriores</span>
              )}
            </div>
          </div>
          <div className={styles.statWithTable}>
            <div className={styles.stat}>
              <span className={styles.number}>{inventarios}</span>
              <span>Inventários</span>
              <span className={styles.comparison}>
                {totalColetas > 0
                  ? `${((inventarios / totalColetas) * 100).toFixed(
                      1
                    )}% do total`
                  : "0% do total"}
              </span>
            </div>
          </div>
          <div className={styles.statWithTable}>
            <div className={styles.stat}>
              <span className={styles.number}>{transferencias}</span>
              <span>Transferências</span>
              <span className={styles.comparison}>
                {totalColetas > 0
                  ? `${((transferencias / totalColetas) * 100).toFixed(
                      1
                    )}% do total`
                  : "0% do total"}
              </span>
            </div>
          </div>
          <div className={styles.statWithTable}>
            <div className={styles.stat}>
              <span className={styles.number}>{conferencias}</span>
              <span>Conferências</span>
              <span className={styles.comparison}>
                {totalColetas > 0
                  ? `${((conferencias / totalColetas) * 100).toFixed(
                      1
                    )}% do total`
                  : "0% do total"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bloco do Relatório de Funcionários */}
      <div className={styles.border}>
        <RelatorioFuncionarios
          dados={dadosFuncionarios}
          loading={funcionariosLoading}
          error={funcionariosError}
          dataInicioInput={dataInicioInput}
          setDataInicioInput={setDataInicioInput}
          dataFimInput={dataFimInput}
          setDataFimInput={setDataFimInput}
          tiposSelecionados={tiposSelecionados}
          setTiposSelecionados={setTiposSelecionados}
          metricaSelecionada={metricaSelecionada}
          setMetricaSelecionada={setMetricaSelecionada}
          handlePesquisar={handlePesquisarFuncionarios}
        />
      </div>
      <div className={styles.border}>
        <EstatisticasFuncionarios
          totalColetas={totalColetasFunc}
          totalItens={totalItensFunc}
          totalVolume={totalVolumeFunc}
          isLoading={funcionariosLoading}
        />
      </div>
    </div>
  );
}
