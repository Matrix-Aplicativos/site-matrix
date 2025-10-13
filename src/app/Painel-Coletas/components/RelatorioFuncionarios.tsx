"use client";

import React, { useMemo, useState, ReactNode } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import useCurrentCompany from "../hooks/useCurrentCompany";
import useGetGraficoFuncionarios from "../hooks/useGetGraficoFuncionarios";
import styles from "./RelatorioFuncionarios.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const toISODateString = (date: Date) => date.toISOString().split("T")[0];

type TipoMetrica =
  | "coletasRealizadas"
  | "itensDistintosBipados"
  | "volumeTotalBipado";

const titulosMetricas = {
  coletasRealizadas: "Coletas Realizadas",
  itensDistintosBipados: "Itens Bipados",
  volumeTotalBipado: "Volume Total",
};

const coresMetricas = {
  coletasRealizadas: "rgb(54, 162, 235)",
  itensDistintosBipados: "rgb(75, 192, 192)",
  volumeTotalBipado: "rgb(255, 206, 86)",
};

const OPCOES_TIPO = {
  Inventario: 1,
  Transferencia: 2,
  "Conf. Venda": 3,
  "Conf. Compra": 4,
};
const TODOS_OS_TIPOS = Object.values(OPCOES_TIPO);

export default function RelatorioFuncionarios() {
  const { empresa } = useCurrentCompany();
  const codEmpresa = empresa?.codEmpresa;

  const hoje = new Date();
  const inicioDoMesCorrente = toISODateString(
    new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  );
  const fimDoMesCorrente = toISODateString(
    new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
  );

  const [dataInicioInput, setDataInicioInput] = useState(inicioDoMesCorrente);
  const [dataFimInput, setDataFimInput] = useState(fimDoMesCorrente);
  const [tiposSelecionados, setTiposSelecionados] =
    useState<number[]>(TODOS_OS_TIPOS);

  const [dateRangeAtivo, setDateRangeAtivo] = useState({
    inicio: inicioDoMesCorrente,
    fim: fimDoMesCorrente,
  });

  const [visibilidade, setVisibilidade] = useState({
    coletasRealizadas: true,
    itensDistintosBipados: true,
    volumeTotalBipado: true,
  });

  const { dados, loading, error } = useGetGraficoFuncionarios(
    codEmpresa,
    dateRangeAtivo.inicio,
    dateRangeAtivo.fim,
    tiposSelecionados
  );

  const handlePesquisar = () => {
    setDateRangeAtivo({
      inicio: dataInicioInput,
      fim: dataFimInput,
    });
  };

  const handleVisibilidadeChange = (metrica: TipoMetrica) => {
    const totalVisiveis = Object.values(visibilidade).filter(Boolean).length;
    const estaTentandoDesmarcar = visibilidade[metrica];

    if (estaTentandoDesmarcar && totalVisiveis === 1) {
      return;
    }

    setVisibilidade((prevState) => ({
      ...prevState,
      [metrica]: !prevState[metrica],
    }));
  };

  const handleTipoChange = (tipoValor: number) => {
    setTiposSelecionados((prev) => {
      const estaTentandoDesmarcar = prev.includes(tipoValor);

      if (estaTentandoDesmarcar && prev.length === 1) {
        return prev;
      }

      return estaTentandoDesmarcar
        ? prev.filter((t) => t !== tipoValor)
        : [...prev, tipoValor];
    });
  };

  const handleToggleTodosTipos = () => {
    if (tiposSelecionados.length === TODOS_OS_TIPOS.length) {
      return;
    } else {
      setTiposSelecionados(TODOS_OS_TIPOS);
    }
  };

  const chartData = useMemo(() => {
    if (!dados || dados.length === 0) return { labels: [], datasets: [] };
    const dadosOrdenados = [...dados].sort((a, b) =>
      a.nomeFuncionario.localeCompare(b.nomeFuncionario)
    );
    const todosOsDatasets = [
      {
        id: "coletasRealizadas",
        label: "Coletas Realizadas",
        data: dadosOrdenados.map((d) => d.coletasRealizadas),
        backgroundColor: coresMetricas.coletasRealizadas,
        xAxisID: "x", // ALTERADO: de yAxisID para xAxisID
      },
      {
        id: "itensDistintosBipados",
        label: "Itens Bipados",
        data: dadosOrdenados.map((d) => d.itensDistintosBipados),
        backgroundColor: coresMetricas.itensDistintosBipados,
        xAxisID: "x", // ALTERADO: de yAxisID para xAxisID
      },
      {
        id: "volumeTotalBipado",
        label: "Volume Total",
        data: dadosOrdenados.map((d) => d.volumeTotalBipado),
        backgroundColor: coresMetricas.volumeTotalBipado,
        xAxisID: "x1", // ALTERADO: de yAxisID: "y1" para xAxisID: "x1"
      },
    ];
    return {
      labels: dadosOrdenados.map((d) => d.nomeFuncionario),
      datasets: todosOsDatasets.filter(
        (dataset) => visibilidade[dataset.id as TipoMetrica]
      ),
    };
  }, [dados, visibilidade]);

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      datalabels: {
        anchor: "center" as const,
        align: "center" as const,
        color: "black",
        font: {
          weight: "bold" as const,
          size: 14,
        },
        formatter: (value: number) => {
          return value > 0 ? value : "";
        },
      },
    },
    scales: {
      x: {
        type: "linear" as const,
        display: true,
        position: "bottom" as const,
        beginAtZero: true,
        title: {
          display: true,
          text: "Quantidade (Coletas e Itens)",
          font: { weight: "bold" as const },
        },
      },
      x1: {
        type: "linear" as const,
        display: true,
        position: "top" as const,
        beginAtZero: true,
        title: {
          display: true,
          text: "Volume Total",
          font: { weight: "bold" as const },
        },
        grid: { drawOnChartArea: false },
      },
      y: {
        title: {
          display: true,
          text: "Funcionário",
          font: { weight: "bold" as const },
        },
        // ADICIONADO: Remove as linhas de grade e a etiqueta duplicada
        grid: {
          display: false,
        },
      },
    },
  } as const;

  const renderContent = (): ReactNode => {
    if (loading)
      return <div className={styles.placeholder}>Carregando dados...</div>;
    if (error)
      return (
        <div className={styles.placeholder}>
          Erro ao buscar dados: {error.toString()}
        </div>
      );
    if (
      !chartData ||
      !chartData.datasets.length ||
      !chartData.labels ||
      chartData.labels.length === 0
    ) {
      return (
        <div className={styles.placeholder}>
          Nenhum dado encontrado para os filtros selecionados.
        </div>
      );
    }
    return <Bar data={chartData} options={options} />;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Relatório por Funcionários</h2>
      </div>

      <div className={styles.filterSection}>
        <div className={styles.metricAndTypeFilters}>
          <div className={styles.filterGroup}>
            <span className={styles.filterGroupLabel}>Exibir Métricas:</span>
            <div className={styles.controlsContainer}>
              {(Object.keys(visibilidade) as TipoMetrica[]).map((metrica) => (
                <label key={metrica} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={visibilidade[metrica]}
                    onChange={() => handleVisibilidadeChange(metrica)}
                    className={styles.checkboxInput}
                  />
                  {titulosMetricas[metrica]}
                </label>
              ))}
            </div>
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterGroupLabel}>Tipos de Coleta:</span>
            <div className={styles.controlsContainer}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  onChange={handleToggleTodosTipos}
                  checked={tiposSelecionados.length === TODOS_OS_TIPOS.length}
                  className={styles.checkboxInput}
                />
                Todos
              </label>
              {Object.entries(OPCOES_TIPO).map(([nome, valor]) => (
                <label key={valor} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={tiposSelecionados.includes(valor)}
                    onChange={() => handleTipoChange(valor)}
                    className={styles.checkboxInput}
                  />
                  {nome}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.dateFilters}>
          <div className={styles.dateInputGroup}>
            <label htmlFor="dataInicioFunc" className={styles.dateLabel}>
              Início
            </label>
            <input
              id="dataInicioFunc"
              type="date"
              value={dataInicioInput}
              onChange={(e) => setDataInicioInput(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.dateInputGroup}>
            <label htmlFor="dataFimFunc" className={styles.dateLabel}>
              Fim
            </label>
            <input
              id="dataFimFunc"
              type="date"
              value={dataFimInput}
              onChange={(e) => setDataFimInput(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <button
            onClick={handlePesquisar}
            disabled={loading}
            className={styles.searchButton}
          >
            {loading ? "..." : "Pesquisar"}
          </button>
        </div>
      </div>

      <div className={styles.legendContainer}>
        {(Object.keys(visibilidade) as TipoMetrica[]).map(
          (metrica) =>
            visibilidade[metrica] && (
              <div key={metrica} className={styles.legendItem}>
                <span
                  className={styles.legendColorBox}
                  style={{ backgroundColor: coresMetricas[metrica] }}
                ></span>
                <span>{titulosMetricas[metrica]}</span>
              </div>
            )
        )}
      </div>

      <div className={styles.chartWrapper}>{renderContent()}</div>
    </div>
  );
}
