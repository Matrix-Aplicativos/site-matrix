import { useMemo } from "react";
import { ChartData } from "chart.js";

interface Coleta {
  dataInicio: string;
  status: string;
  tipo: number; // 1 = avulsa, 2 = sob demanda (ajuste conforme necessário)
}

export default function useGraficoColetas(
  coletas: Coleta[] | null,
  view: "mensal" | "anual"
): ChartData<"bar"> {
  return useMemo(() => {
    if (!coletas || coletas.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth();
    const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();

    const labels =
      view === "mensal"
        ? Array.from({ length: diasNoMes }, (_, i) => `Dia ${i + 1}`)
        : [
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

    // Inicializa contadores
    const totais: number[] = Array(view === "mensal" ? diasNoMes : 12).fill(0);
    const avulsas: number[] = Array(view === "mensal" ? diasNoMes : 12).fill(0);
    const sobDemanda: number[] = Array(view === "mensal" ? diasNoMes : 12).fill(
      0
    );

    coletas.forEach((coleta) => {
      if (!coleta.dataInicio) return;
      const data = new Date(coleta.dataInicio);
      if (isNaN(data.getTime())) return;

      const index = view === "mensal" ? data.getDate() - 1 : data.getMonth();
      totais[index]++;

      if (coleta.tipo === 1) {
        avulsas[index]++;
      } else if (coleta.tipo === 2) {
        sobDemanda[index]++;
      }
    });

    return {
      labels,
      datasets: [
        {
          label: "Total de Coletas",
          data: totais,
          backgroundColor: "rgba(54, 162, 235, 0.5)", // azul
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
        {
          label: "Coletas Avulsas",
          data: avulsas,
          backgroundColor: "rgba(255, 206, 86, 0.5)", // amarelo
          borderColor: "rgba(255, 206, 86, 1)",
          borderWidth: 1,
        },
        {
          label: "Coletas Sob Demanda",
          data: sobDemanda,
          backgroundColor: "rgba(255, 99, 132, 0.5)", // vermelho
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [coletas, view]);
}
