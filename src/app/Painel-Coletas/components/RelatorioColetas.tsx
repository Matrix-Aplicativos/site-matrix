"use client";

import React, { useState } from "react";
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
import LoadingOverlay from "@/shared/components/LoadingOverlay";

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
  const codEmpresa = 1; // Substitua conforme necessário
  const { coletas, loading } = useGetColetas(codEmpresa, 1); // página 1, sem ordenação
  const chartData = useGraficoColetas(coletas, view);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthlyLabels = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

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
            ? `Coletas por Dia - ${monthlyLabels[currentMonth]} ${currentYear}`
            : `Coletas por Mês - Ano ${currentYear}`,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: view === "mensal" ? "Dias do Mês" : "Meses do Ano",
        },
      },
      y: {
        title: {
          display: true,
          text: "Quantidade de Coletas",
        },
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="border">
      <div style={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2>Relatório de Coletas</h2>
          <div>
            <button
              className={`view-button ${view === "mensal" ? "active" : ""}`}
              onClick={() => onViewChange("mensal")}
            >
              Mensal
            </button>
            <button
              className={`view-button ${view === "anual" ? "active" : ""}`}
              onClick={() => onViewChange("anual")}
            >
              Anual
            </button>
          </div>
        </div>

        <div style={{ height: "400px", position: "relative" }}>
          {loading && <LoadingOverlay />}
          {!loading && <Bar data={chartData} options={options} />}
        </div>
      </div>
    </div>
  );
}
