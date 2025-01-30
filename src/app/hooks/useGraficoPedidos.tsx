import { useMemo } from "react";
import { ChartData } from "chart.js";

interface Pedido {
  data: string; 
}

export default function useGraficoPedidos(
  pedidos: Pedido[] | null,
  view: "mensal" | "anual"
): ChartData<"bar"> {
  return useMemo(() => {
    if (!pedidos || pedidos.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    console.log("Pedidos recebidos para o gráfico:", pedidos);

    const agrupados: Record<string, number> = {};
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

    let labels: string[] = view === "mensal"
      ? Array.from({ length: 31 }, (_, i) => `Dia ${i + 1}`)
      : meses;

    pedidos.forEach(({ data }) => {
      if (!data) {
        console.warn("Pedido sem data:", data);
        return;
      }

      const date = new Date(data);
      if (isNaN(date.getTime())) {
        console.warn("Data inválida ignorada:", data);
        return;
      }

      console.log("Data do pedido processada:", date);

      let key = view === "mensal" 
        ? `Dia ${date.getUTCDate()}` 
        : meses[date.getUTCMonth()];

      console.log(`Agrupando por chave: ${key}`);
      
      agrupados[key] = (agrupados[key] || 0) + 1;
    });

    console.log("Agrupados (resultado final):", agrupados);

    const valores = labels.map((label) => agrupados[label] || 0);
    console.log("Labels:", labels);
    console.log("Valores:", valores);

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
            view === "mensal" ? "rgba(75, 192, 192, 1)" : "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [pedidos, view]);
}
