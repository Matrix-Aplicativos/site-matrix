"use client";

import { useMemo, ReactNode, Dispatch, SetStateAction } from "react";
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
import { DadosFuncionario } from "../hooks/useGetGraficoFuncionarios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// --- Tipos e Constantes ---
type TipoMetrica =
  | "coletasRealizadas"
  | "itensDistintosBipados"
  | "volumeTotalBipado";

const titulosMetricas: Record<TipoMetrica, string> = {
  coletasRealizadas: "Coletas Realizadas",
  itensDistintosBipados: "Itens Bipados",
  volumeTotalBipado: "Volume Total",
};

const coresMetricas: Record<TipoMetrica, string> = {
  coletasRealizadas: "rgb(54, 162, 235)",
  itensDistintosBipados: "rgb(75, 192, 192)",
  volumeTotalBipado: "rgb(255, 206, 86)",
};

const OPCOES_TIPO = {
  Inventario: 1,
  Transferencia: 2,
  "Conf. Venda": 3,
  "Conf. Compra": 4,
  "Ajuste Entrada": 5,
  "Ajuste Saída": 6,
};
const TODOS_OS_TIPOS = Object.values(OPCOES_TIPO);

interface RelatorioFuncionariosProps {
  dados: DadosFuncionario[] | null;
  loading: boolean;
  error: string | null;
  dataInicioInput: string;
  setDataInicioInput: Dispatch<SetStateAction<string>>;
  dataFimInput: string;
  setDataFimInput: Dispatch<SetStateAction<string>>;
  tiposSelecionados: number[];
  setTiposSelecionados: Dispatch<SetStateAction<number[]>>;
  metricaSelecionada: TipoMetrica;
  setMetricaSelecionada: Dispatch<SetStateAction<TipoMetrica>>;
  handlePesquisar: () => void;
}

export default function RelatorioFuncionarios({
  dados,
  loading,
  error,
  dataInicioInput,
  setDataInicioInput,
  dataFimInput,
  setDataFimInput,
  tiposSelecionados,
  setTiposSelecionados,
  metricaSelecionada,
  setMetricaSelecionada,
  handlePesquisar,
}: RelatorioFuncionariosProps) {
  const handleTipoChange = (tipoValor: number) => {
    setTiposSelecionados((prev) => {
      const estaTentandoDesmarcar = prev.includes(tipoValor);
      if (estaTentandoDesmarcar && prev.length === 1) return prev;
      return estaTentandoDesmarcar
        ? prev.filter((t) => t !== tipoValor)
        : [...prev, tipoValor];
    });
  };

  const handleToggleTodosTipos = () => {
    if (tiposSelecionados.length === TODOS_OS_TIPOS.length) return;
    else setTiposSelecionados(TODOS_OS_TIPOS);
  };

  const chartData = useMemo(() => {
    if (!dados || dados.length === 0) return { labels: [], datasets: [] };

    const dadosOrdenados = [...dados].sort((a, b) =>
      a.nomeFuncionario.localeCompare(b.nomeFuncionario)
    );

    const todosOsDatasets = [
      {
        id: "coletasRealizadas",
        label: "Coletas Realizadas",
        data: dadosOrdenados.map((d) => d.coletasRealizadas),
        backgroundColor: coresMetricas.coletasRealizadas,
      },
      {
        id: "itensDistintosBipados",
        label: "Itens Bipados",
        data: dadosOrdenados.map((d) => d.itensDistintosBipados),
        backgroundColor: coresMetricas.itensDistintosBipados,
      },
      {
        id: "volumeTotalBipado",
        label: "Volume Total",
        data: dadosOrdenados.map((d) => d.volumeTotalBipado),
        backgroundColor: coresMetricas.volumeTotalBipado,
      },
    ];

    return {
      labels: dadosOrdenados.map((d) => d.nomeFuncionario),
      datasets: todosOsDatasets.filter(
        (dataset) => dataset.id === metricaSelecionada
      ),
    };
  }, [dados, metricaSelecionada]);

  const options = useMemo(() => {
    const yAxisTitle = titulosMetricas[metricaSelecionada];
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Funcionário",
            font: { weight: "bold" as const },
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: yAxisTitle,
            font: { weight: "bold" as const },
          },
        },
      },
    };
  }, [metricaSelecionada]);

  const renderContent = (): ReactNode => {
    if (loading)
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            color: "var(--text-placeholder-color)",
            textAlign: "center",
          }}
        >
          Carregando dados...
        </div>
      );
    if (error)
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            color: "var(--text-placeholder-color)",
            textAlign: "center",
          }}
        >
          Erro ao buscar dados: {error.toString()}
        </div>
      );
    if (!chartData?.datasets.length || !chartData?.labels?.length)
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            color: "var(--text-placeholder-color)",
            textAlign: "center",
          }}
        >
          Nenhum dado encontrado para os filtros selecionados.
        </div>
      );
    return <Bar data={chartData} options={options} />;
  };

  return (
    <div style={{ padding: "20px", width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            color: "var(--header-text-color)",
            fontSize: "1.5rem",
            margin: 0,
          }}
        >
          Relatório por Funcionários
        </h2>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {/* Filtros de Métrica e Tipo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <span
              style={{
                fontWeight: "bold",
                fontSize: "16px",
                color: "var(--text-secondary-color)",
                marginRight: "16px",
                minWidth: "130px",
              }}
            >
              Exibir Métrica:
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              {(Object.keys(titulosMetricas) as TipoMetrica[]).map(
                (metrica) => (
                  <label
                    key={metrica}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      fontSize: "16px",
                      color: "var(--text-secondary-color)",
                    }}
                  >
                    <input
                      type="radio"
                      name="metrica"
                      value={metrica}
                      checked={metricaSelecionada === metrica}
                      onChange={() => setMetricaSelecionada(metrica)}
                      style={{
                        marginRight: "5px",
                        transform: "scale(1.2)",
                        cursor: "pointer",
                      }}
                      disabled={loading}
                    />
                    {titulosMetricas[metrica]}
                  </label>
                )
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <span
              style={{
                fontWeight: "bold",
                fontSize: "16px",
                color: "var(--text-secondary-color)",
                marginRight: "16px",
                minWidth: "130px",
              }}
            >
              Tipos de Coleta:
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: "var(--text-secondary-color)",
                }}
              >
                <input
                  type="checkbox"
                  onChange={handleToggleTodosTipos}
                  checked={tiposSelecionados.length === TODOS_OS_TIPOS.length}
                  style={{
                    marginRight: "8px",
                    transform: "scale(1.2)",
                    cursor: "pointer",
                  }}
                  disabled={loading}
                />
                Todos
              </label>
              {Object.entries(OPCOES_TIPO).map(([nome, valor]) => (
                <label
                  key={valor}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    fontSize: "16px",
                    color: "var(--text-secondary-color)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={tiposSelecionados.includes(valor)}
                    onChange={() => handleTipoChange(valor)}
                    style={{
                      marginRight: "8px",
                      transform: "scale(1.2)",
                      cursor: "pointer",
                    }}
                    disabled={loading}
                  />
                  {nome}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Filtros de Data */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="dataInicioFunc"
              style={{
                fontSize: "14px",
                marginBottom: "4px",
                color: "var(--text-secondary-color)",
              }}
            >
              Início
            </label>
            <input
              id="dataInicioFunc"
              type="date"
              value={dataInicioInput}
              onChange={(e) => setDataInicioInput(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid var(--input-border-color)",
                fontSize: "15px",
                backgroundColor: "var(--button-bg-color)",
                color: "var(--text-secondary-color)",
                height: "40px",
              }}
              disabled={loading}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="dataFimFunc"
              style={{
                fontSize: "14px",
                marginBottom: "4px",
                color: "var(--text-secondary-color)",
              }}
            >
              Fim
            </label>
            <input
              id="dataFimFunc"
              type="date"
              value={dataFimInput}
              onChange={(e) => setDataFimInput(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid var(--input-border-color)",
                fontSize: "15px",
                backgroundColor: "var(--button-bg-color)",
                color: "var(--text-secondary-color)",
                height: "40px",
              }}
              disabled={loading}
            />
          </div>

          <button
            onClick={handlePesquisar}
            disabled={loading}
            style={{
              padding: "10px 18px",
              background: loading
                ? "var(--button-primary-disabled-bg)"
                : "var(--button-primary-bg)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "15px",
              fontWeight: "bold",
              height: "40px",
              transition: "background-color 0.2s",
            }}
          >
            {loading ? "..." : "Pesquisar"}
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "24px",
          marginBottom: "20px",
          paddingTop: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
            color: "var(--text-secondary-color)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "14px",
              height: "14px",
              marginRight: "8px",
              borderRadius: "3px",
              backgroundColor: coresMetricas[metricaSelecionada],
            }}
          ></span>
          {titulosMetricas[metricaSelecionada]}
        </div>
      </div>

      <div
        style={{
          height: "400px",
          width: "100%",
          position: "relative",
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
}
