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
import useCurrentCompany from "../hooks/useCurrentCompany";
import useGetGraficoFuncionarios from "../hooks/useGetGraficoFuncionarios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
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
  const [periodoAtivo, setPeriodoAtivo] = useState({
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
    periodoAtivo.inicio,
    periodoAtivo.fim
  );

  const handlePesquisar = () => {
    setPeriodoAtivo({ inicio: dataInicioInput, fim: dataFimInput });
  };

  const handleVisibilidadeChange = (metrica: TipoMetrica) => {
    setVisibilidade((prevState) => ({
      ...prevState,
      [metrica]: !prevState[metrica],
    }));
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
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        yAxisID: "y",
      },
      {
        id: "itensDistintosBipados",
        label: "Itens Bipados",
        data: dadosOrdenados.map((d) => d.itensDistintosBipados),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        yAxisID: "y",
      },
      {
        id: "volumeTotalBipado",
        label: "Volume Total",
        data: dadosOrdenados.map((d) => d.volumeTotalBipado),
        backgroundColor: "rgba(255, 206, 86, 0.7)",
        yAxisID: "y1",
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
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Funcionário",
          font: { weight: "bold" as const },
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        beginAtZero: true,
        title: {
          display: true,
          text: "Quantidade (Coletas e Itens)",
          font: { weight: "bold" as const },
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        beginAtZero: true,
        title: {
          display: true,
          text: "Volume Total",
          font: { weight: "bold" as const },
        },
        grid: { drawOnChartArea: false },
      },
    },
  } as const;

  const placeholderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    color: "#666",
    textAlign: "center",
  };

  const renderContent = (): ReactNode => {
    if (loading) return <div style={placeholderStyle}>Carregando dados...</div>;
    if (error)
      return <div style={placeholderStyle}>Erro ao buscar dados: {error}</div>;
    if (
      !chartData ||
      !chartData.datasets.length ||
      !chartData.labels ||
      chartData.labels.length === 0
    ) {
      return (
        <div style={placeholderStyle}>
          Nenhum dado encontrado para os filtros selecionados.
        </div>
      );
    }
    return <Bar data={chartData} options={options} />;
  };

  return (
    <div style={{ padding: "20px", width: "100%" }}>
      {/* Cabeçalho e controles */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ color: "#000", fontSize: "1.7rem", margin: 0 }}>
          Relatório por Funcionários
        </h2>

        {/* Checkboxes + Datas juntos */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontWeight: "bold",
              fontSize: "16px",
              color: "#333",
              marginRight: "8px",
            }}
          >
            Exibir:
          </span>

          {(Object.keys(visibilidade) as TipoMetrica[]).map((metrica) => (
            <label
              key={metrica}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              <input
                type="checkbox"
                checked={visibilidade[metrica]}
                onChange={() => handleVisibilidadeChange(metrica)}
                style={{ marginRight: "8px", transform: "scale(1.2)" }}
              />
              {titulosMetricas[metrica]}
            </label>
          ))}

          {/* Datas e botão na mesma linha */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginLeft: "24px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label
                htmlFor="dataInicioFunc"
                style={{ fontSize: "14px", marginBottom: "4px" }}
              >
                Início
              </label>
              <input
                id="dataInicioFunc"
                type="date"
                value={dataInicioInput}
                onChange={(e) => setDataInicioInput(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "15px",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label
                htmlFor="dataFimFunc"
                style={{ fontSize: "14px", marginBottom: "4px" }}
              >
                Fim
              </label>
              <input
                id="dataFimFunc"
                type="date"
                value={dataFimInput}
                onChange={(e) => setDataFimInput(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "15px",
                }}
              />
            </div>
            <button
              onClick={handlePesquisar}
              disabled={loading}
              style={{
                padding: "10px 18px",
                background: loading ? "#ccc" : "#1769e3",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "15px",
                fontWeight: "bold",
                height: "40px",
                marginTop: "14px",
              }}
            >
              {loading ? "Pesquisando..." : "Pesquisar"}
            </button>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div style={{ height: "400px", width: "100%", position: "relative" }}>
        {renderContent()}
      </div>
    </div>
  );
}
