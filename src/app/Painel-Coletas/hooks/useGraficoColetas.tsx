import { useMemo } from "react";
import { ChartData } from "chart.js";

interface Coleta {
  dataCadastro: string;
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
        ? Array.from({ length: diasNoMes }, (_, i) => (i + 1).toString())
        : [
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

    const totais = Array(labels.length).fill(0);

    coletas.forEach((coleta) => {
      try {
        if (!coleta.dataCadastro) return;

        const data = new Date(coleta.dataCadastro);
        if (isNaN(data.getTime())) return;

        // Filtra apenas coletas do ano atual para o gráfico
        if (data.getFullYear() !== anoAtual) return;

        const index =
          view === "mensal"
            ? data.getMonth() === mesAtual
              ? data.getDate() - 1
              : -1
            : data.getMonth();

        if (index >= 0 && index < labels.length) {
          totais[index]++;
        }
      } catch (error) {
        console.error("Erro ao processar coleta:", error);
      }
    });

    return {
      labels,
      datasets: [
        {
          label: "Coletas",
          data: totais,
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [coletas, view]);
}
