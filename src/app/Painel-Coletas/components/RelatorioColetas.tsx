"use client";

import { useMemo, useState } from "react";
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
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addMonths,
  subMonths,
  addYears,
  subYears,
  getDaysInMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import useGetGraficoColetas from "../hooks/useGraficoColetas";

// Registra os componentes e plugins do Chart.js
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
  fontSize: "1.1rem",
};

const buttonStyle: React.CSSProperties = {
  padding: "8px 12px",
  background: "#e0e0e0",
  color: "#333",
  border: "1px solid #ccc",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "all 0.2s ease",
};

export default function RelatorioColetas({
  view,
  onViewChange,
}: RelatorioColetasProps) {
  const { empresa, loading: companyLoading } = useCurrentCompany();
  const codEmpresa = empresa?.codEmpresa;

  const [dataExibicao, setDataExibicao] = useState(new Date());

  const { dataInicio, dataFim } = useMemo(() => {
    const baseDate = dataExibicao || new Date();
    if (view === "mensal") {
      const inicio = startOfMonth(baseDate);
      const fim = endOfMonth(baseDate);
      return {
        dataInicio: format(inicio, "yyyy-MM-dd"),
        dataFim: format(fim, "yyyy-MM-dd"),
      };
    } else {
      const inicio = startOfYear(baseDate);
      const fim = endOfYear(baseDate);
      return {
        dataInicio: format(inicio, "yyyy-MM-dd"),
        dataFim: format(fim, "yyyy-MM-dd"),
      };
    }
  }, [view, dataExibicao]);

  const {
    dados: dadosGrafico,
    loading: coletasLoading,
    error,
  } = useGetGraficoColetas(
    codEmpresa,
    dataInicio,
    dataFim,
    view === "mensal" ? "DIA" : "MES"
  );

  const chartData = useMemo(() => {
    let labels: string[];
    if (view === "mensal") {
      const diasNoMes = getDaysInMonth(dataExibicao);
      labels = Array.from({ length: diasNoMes }, (_, i) => (i + 1).toString());
    } else {
      labels = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ];
    }

    const totais = Array(labels.length).fill(0);

    if (dadosGrafico) {
      dadosGrafico.forEach((dado) => {
        let index = -1;
        if (view === "mensal") {
          const dia = new Date(`${dado.periodo}T12:00:00`).getDate();
          index = dia - 1;
        } else {
          // anual
          // ########## CORREÇÃO APLICADA AQUI ##########
          // Extrai o mês da string "YYYY-MM"
          const mes = parseInt(dado.periodo.split("-")[1], 10);
          index = mes - 1;
          // ###########################################
        }

        if (index >= 0 && index < totais.length) {
          totais[index] = dado.totalColetas;
        }
      });
    }

    return {
      labels,
      datasets: [
        {
          label: "Coletas",
          data: totais,
          backgroundColor: "rgb(54, 162, 235)",
          borderColor: "rgb(54, 162, 235)",
          borderWidth: 1,
        },
      ],
    };
  }, [dadosGrafico, view, dataExibicao]);

  const isLoading = companyLoading || coletasLoading;

  const tituloGrafico = useMemo(() => {
    const baseDate = dataExibicao || new Date();
    if (view === "mensal") {
      const mesAno = format(baseDate, "MMMM 'de' yyyy", { locale: ptBR });
      return `Coletas por dia - ${
        mesAno.charAt(0).toUpperCase() + mesAno.slice(1)
      }`;
    }
    return `Coletas por mês - ${format(baseDate, "yyyy")}`;
  }, [dataExibicao, view]);

  const handleNavegacao = (direction: "anterior" | "proximo") => {
    const fn =
      direction === "anterior"
        ? view === "mensal"
          ? subMonths
          : subYears
        : view === "mensal"
        ? addMonths
        : addYears;
    setDataExibicao((current) => fn(current, 1));
  };

  const isProximoDesabilitado = useMemo(() => {
    const hoje = new Date();
    const baseDate = dataExibicao || new Date();
    if (view === "mensal") {
      return startOfMonth(baseDate) >= startOfMonth(hoje);
    }
    return startOfYear(baseDate) >= startOfYear(hoje);
  }, [dataExibicao, view]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: tituloGrafico,
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
    if (error) {
      return <div style={placeholderStyle}>{error}</div>;
    }
    if (!codEmpresa) {
      return (
        <div style={placeholderStyle}>
          Nenhuma empresa vinculada ao usuário.
        </div>
      );
    }
    const semMovimentacao = chartData.datasets[0]?.data.every((d) => d === 0);
    if (semMovimentacao) {
      return (
        <div style={placeholderStyle}>
          Nenhuma movimentação registrada no período selecionado.
        </div>
      );
    }

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
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <h2
            style={{
              marginLeft: 20,
              color: "#000",
              fontSize: "1.5rem",
              margin: 0,
            }}
          >
            Relatório de Coletas
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <button
              style={buttonStyle}
              onClick={() => handleNavegacao("anterior")}
            >
              &lt;
            </button>
            <button
              style={buttonStyle}
              onClick={() => handleNavegacao("proximo")}
              disabled={isProximoDesabilitado}
            >
              &gt;
            </button>
          </div>
        </div>

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
