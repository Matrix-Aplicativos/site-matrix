import { useMemo } from "react";
import { Pedido } from "../utils/types/Pedido";

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
  options: {
    scales: {
      y: {
        beginAtZero: true;
        ticks: {
          stepSize: 1;
          precision: 0;
        };
      };
    };
  };
}

const useGraficoPedidos = (pedidos: Pedido[] | null, view: "mensal" | "anual"): ChartData => {
  return useMemo(() => {
    if (!pedidos) {
      return { labels: [], datasets: [], options: { scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } } } } };
    }

    if (view === "mensal") {
      const labels = Array.from({ length: 31 }, (_, i) => `Dia ${i + 1}`);
      const data = new Array(31).fill(0);
      
      pedidos.forEach((pedido) => {
        const dia = new Date(pedido.dataPedido).getDate() - 1;
        data[dia] += 1;
      });

      return {
        labels,
        datasets: [
          {
            label: "Pedidos Diários",
            data,
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                precision: 0,
              },
            },
          },
        },
      };
    } else {
      const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const data = new Array(12).fill(0);
      
      pedidos.forEach((pedido) => {
        const mes = new Date(pedido.dataPedido).getMonth();
        data[mes] += 1;
      });

      return {
        labels,
        datasets: [
          {
            label: "Pedidos Mensais",
            data,
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                precision: 0,
              },
            },
          },
        },
      };
    }
  }, [pedidos, view]);
};

export default useGraficoPedidos;