import React, { useState, useEffect } from "react";
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
import type { ChartOptions } from "chart.js";
import { useTotalPedidos } from "../hooks/useTotalPedidos";
import useGraficoPedidos from "../hooks/useGraficoPedidos";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const today = new Date();

export default function RelatorioPedidos() {
  const [view, setView] = useState<"mensal" | "anual">("mensal");
  const [periodoIni, setPeriodoIni] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");

  useEffect(() => {
    if (view === "mensal") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];
      setPeriodoIni(firstDay);
      setPeriodoFim(lastDay);
    } else {
      const firstDay = new Date(today.getFullYear(), 0, 1)
        .toISOString()
        .split("T")[0];
      const lastDay = new Date(today.getFullYear(), 11, 31)
        .toISOString()
        .split("T")[0];
      setPeriodoIni(firstDay);
      setPeriodoFim(lastDay);
    }
  }, [view]);

  // --- [CORREÇÃO APLICADA AQUI] ---
  // 1. Definimos a flag de habilitação. O hook só deve rodar se as datas existirem.
  const isHookEnabled = !!periodoIni && !!periodoFim;

  const { totalPedidos, isLoading, error } = useTotalPedidos(
    1,
    periodoIni,
    periodoFim,
    10000,
    isHookEnabled // 2. Adicionamos o 5º argumento 'isHookEnabled'
  );
  // --- [FIM DA CORREÇÃO] ---

  const chartData = useGraficoPedidos(totalPedidos, view);

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Relatório de Pedidos",
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ padding: "20px 0", width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          padding: "0 20px",
        }}
      >
        <h2>Relatório de Pedidos</h2>
        <div>
          <button
            style={{
              marginRight: "10px",
              padding: "5px 10px",
              background: view === "mensal" ? "#007BFF" : "#FFF",
              color: view === "mensal" ? "#FFF" : "#007BFF",
              border: "1px solid #007BFF",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => setView("mensal")}
          >
            Mensal
          </button>
          <button
            style={{
              padding: "5px 10px",
              background: view === "anual" ? "#007BFF" : "#FFF",
              color: view === "anual" ? "#FFF" : "#007BFF",
              border: "1px solid #007BFF",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => setView("anual")}
          >
            Anual
          </button>
        </div>
      </div>
      <div
        style={{
          height: "250px",
          width: "95%",
          margin: "0 auto",
        }}
      >
        {isLoading ? (
          <p>Carregando...</p>
        ) : error ? (
          <p>{error.message}</p>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
