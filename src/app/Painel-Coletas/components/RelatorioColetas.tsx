"use client";

import React from "react";
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

import useGetColetas from "../hooks/useGetColetas";
import useGraficoColetas from "../hooks/useGraficoColetas";
import LoadingOverlay from "../../shared/components/LoadingOverlay";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RelatorioColetasProps {
  view: "mensal" | "anual";
  onViewChange: (view: "mensal" | "anual") => void;
}

export default function RelatorioColetas({
  view,
  onViewChange,
}: RelatorioColetasProps) {
  const codEmpresa = 1;

  const { coletas, loading } = useGetColetas(
    codEmpresa, 
    1, 
    undefined, 
    undefined, 
    undefined, 
  );
  const chartData = useGraficoColetas(coletas, view);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.toLocaleString("pt-BR", { month: "long" });

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text:
          view === "mensal"
            ? `Coletas por Dia - ${currentMonth} ${currentYear}`
            : `Coletas por Mês - ${currentYear}`,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || "";
            return `${label}: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: view === "mensal" ? "Dias do Mês" : "Meses",
        },
      },
      y: {
        title: {
          display: true,
          text: "Quantidade",
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
    maintainAspectRatio: false,
  };


  const placeholderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    color: "#666",
    textAlign: "center",
  };

  const renderChartContent = () => {
    // Se estiver carregando, mostra o overlay e a mensagem
    if (loading) {
      return (
        <>
          <LoadingOverlay />
          <div style={placeholderStyle}>Carregando...</div>
        </>
      );
    }

    // Após carregar, se não houver dados no gráfico, mostra a mensagem
    if (!chartData?.labels?.length) {
      return (
        <div style={placeholderStyle}>
          Nenhum dado disponível para gerar o relatório.
        </div>
      );
    }

    // Se tudo estiver certo, renderiza o gráfico
    return <Bar data={chartData} options={options} />;
  };

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
        <h2 style={{ margin: 0 }}>Relatório de Coletas</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            style={{
              padding: "8px 16px",
              background: view === "mensal" ? "#007BFF" : "#f0f0f0",
              color: view === "mensal" ? "white" : "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            onClick={() => onViewChange("mensal")}
          >
            Mensal
          </button>
          <button
            style={{
              padding: "8px 16px",
              background: view === "anual" ? "#007BFF" : "#f0f0f0",
              color: view === "anual" ? "white" : "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            onClick={() => onViewChange("anual")}
          >
            Anual
          </button>
        </div>
      </div>

      <div
        style={{
          height: "400px",
          width: "100%",
          position: "relative",
        }}
      >
        {renderChartContent()}
      </div>
    </div>
  );
}
