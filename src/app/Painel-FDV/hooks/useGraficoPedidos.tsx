import { useMemo } from "react";
import { ChartData } from "chart.js";
import { PedidoListItem } from "../utils/types/Pedido";

export default function useGraficoPedidos(
  pedidos: PedidoListItem[] | null,
  view: "mensal" | "anual"
): ChartData<"bar"> {
  return useMemo(() => {
    if (!Array.isArray(pedidos) || pedidos.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const agrupados: Map<number, number> = new Map();
    const meses = [
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

    const today = new Date();
    const anoAtual = today.getFullYear();
    const mesAtual = today.getMonth();
    const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();

    const labels: string[] =
      view === "mensal"
        ? Array.from({ length: diasNoMes }, (_, i) => `Dia ${i + 1}`)
        : meses;

    pedidos.forEach(({ dataCadastro }) => {
      if (!dataCadastro) return;

      const date = new Date(dataCadastro);
      if (isNaN(date.getTime())) return;

      const key = view === "mensal" ? date.getDate() : date.getMonth();
      agrupados.set(key, (agrupados.get(key) || 0) + 1);
    });

    const valores =
      view === "mensal"
        ? labels.map(
            (label) => agrupados.get(Number(label.replace("Dia ", ""))) || 0
          )
        : labels.map((_, index) => agrupados.get(index) || 0);

    return {
      labels,
      datasets: [
        {
          label: view === "mensal" ? "Pedidos por Dia" : "Pedidos por Mês",
          data: valores,
          backgroundColor:
            view === "mensal"
              ? "rgba(75, 192, 192, 0.5)"
              : "rgba(255, 99, 132, 0.5)",
          borderColor:
            view === "mensal"
              ? "rgba(75, 192, 192, 1)"
              : "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [pedidos, view]);
}
