"use client";

import { useMemo } from "react";
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
import useGetColetas from "../hooks/useGetColetas";
import useGraficoColetas from "../hooks/useGraficoColetas";
import useCurrentCompany from "../hooks/useCurrentCompany";
import LoadingOverlay from "../../shared/components/LoadingOverlay";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface RelatorioColetasProps {
  view: "mensal" | "anual";
  onViewChange: (view: "mensal" | "anual") => void;
}

const placeholderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  color: "#666",
  textAlign: "center",
  padding: "20px",
};

export default function RelatorioColetas({
  view,
  onViewChange,
}: RelatorioColetasProps) {
  const { empresa, loading: companyLoading } = useCurrentCompany();
  const codEmpresa = empresa?.codEmpresa;

  const { coletas, loading: coletasLoading } = useGetColetas(
    codEmpresa || 0,
    1
  );

  const chartData = useGraficoColetas(coletas, view);

  const finalChartData = useMemo(() => {
    if (!chartData?.datasets?.length) {
      return chartData;
    }
    const newData = { ...chartData };
    newData.datasets = chartData.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: "rgb(54, 162, 235)",
      borderColor: "rgb(54, 162, 235)",
    }));
    return newData;
  }, [chartData]);

  const isLoading = companyLoading || coletasLoading;
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.toLocaleString("pt-BR", { month: "long" });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text:
          view === "mensal"
            ? `Coletas por dia - ${currentMonth}`
            : `Coletas por mês - ${currentYear}`,
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.raw} Coletas`,
        },
      },
      datalabels: {
        anchor: "center" as const,
        align: "center" as const,
        color: "black",
        font: { weight: "bold" as const, size: 14 },
        formatter: (value: number) => (value > 0 ? value : ""),
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: view === "mensal" ? "Dias do Mês" : "Meses",
          font: { weight: "bold" as const },
        },
        grid: { display: false },
      },
      y: {
        title: {
          display: true,
          text: "Quantidade de Coletas",
          font: { weight: "bold" as const },
        },
        beginAtZero: true,
        ticks: { stepSize: 1, precision: 0 },
        grid: { color: "rgba(0, 0, 0, 0.05)" },
      },
    },
  } as const;

  const renderChartContent = () => {
    if (isLoading) {
      return (
        <>
          <LoadingOverlay />
          <div style={placeholderStyle}>Carregando dados de coletas...</div>
        </>
      );
    }
    if (!codEmpresa) {
      return (
        <div style={placeholderStyle}>
          Nenhuma empresa vinculada ao usuário.
        </div>
      );
    }
    if (!finalChartData?.labels?.length) {
      return (
        <div style={placeholderStyle}>
          Nenhuma movimentação registrada no período selecionado.
        </div>
      );
    }
    return <Bar data={finalChartData} options={options} />;
  };

  // Return
  return (
    <div style={{ padding: "20px 0", width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ marginLeft: 20, color: "#000", fontSize: "1.5rem" }}>
          Relatório de Coletas
        </h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            style={{
              padding: "8px 16px",
              background: view === "mensal" ? "rgb(54, 162, 235)" : "#f0f0f0",
              color: view === "mensal" ? "white" : "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.3s ease",
            }}
            onClick={() => onViewChange("mensal")}
          >
            Visão Mensal
          </button>
          <button
            style={{
              padding: "8px 16px",
              background: view === "anual" ? "rgb(54, 162, 235)" : "#f0f0f0",
              color: view === "anual" ? "white" : "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.3s ease",
            }}
            onClick={() => onViewChange("anual")}
          >
            Visão Anual
          </button>
        </div>
      </div>

      <div
        style={{
          height: "400px",
          width: "100%",
          position: "relative",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          padding: "20px",
        }}
      >
        {renderChartContent()}
      </div>
    </div>
  );
}
