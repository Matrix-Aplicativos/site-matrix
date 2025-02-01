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

export default function RelatorioPedidos() {
  const today = new Date();
  const firstDayCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  )
    .toISOString()
    .split("T")[0];
  const lastDayCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  )
    .toISOString()
    .split("T")[0];

  const firstDayPreviousMonth = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1
  )
    .toISOString()
    .split("T")[0];
  const lastDayPreviousMonth = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    new Date(today.getFullYear(), today.getMonth(), 0).getDate()
  )
    .toISOString()
    .split("T")[0];

  const [periodoIni, setPeriodoIni] = useState(firstDayCurrentMonth);
  const [periodoFim, setPeriodoFim] = useState(lastDayCurrentMonth);
  const [view, setView] = useState<"mensal" | "anual">("mensal");
  const { totalPedidos, isLoading, error } = useTotalPedidos(
    1,
    '2025-01-01',
    '2025-12-31',
    10000
  );
  const chartData = useGraficoPedidos(totalPedidos, view);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Relatório de Pedidos" },
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
          <p>{error}</p>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
