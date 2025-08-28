import { render, screen, fireEvent } from "@testing-library/react";
import RelatorioColetas from "../components/RelatorioColetas";
import "@testing-library/jest-dom";

// Mock dos hooks usados no componente
jest.mock("../hooks/useGetColetas", () => jest.fn());
jest.mock("../hooks/useGraficoColetas", () => jest.fn());
jest.mock("../hooks/useCurrentCompany", () => jest.fn());

// Importa os mocks
import useGetColetas from "../hooks/useGetColetas";
import useGraficoColetas from "../hooks/useGraficoColetas";
import useCurrentCompany from "../hooks/useCurrentCompany";

describe("RelatorioColetas", () => {
  const mockOnViewChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("mostra o loading quando os dados estão carregando", () => {
    (useCurrentCompany as jest.Mock).mockReturnValue({
      codEmpresa: 1,
      loading: true,
    });
    (useGetColetas as jest.Mock).mockReturnValue({
      coletas: [],
      loading: true,
    });
    (useGraficoColetas as jest.Mock).mockReturnValue({
      labels: [],
      datasets: [],
    });

    render(<RelatorioColetas view="mensal" onViewChange={mockOnViewChange} />);

    expect(
      screen.getByText(/carregando dados de coletas/i)
    ).toBeInTheDocument();
  });

  it("mostra aviso se não há empresa vinculada", () => {
    (useCurrentCompany as jest.Mock).mockReturnValue({
      codEmpresa: null,
      loading: false,
    });
    (useGetColetas as jest.Mock).mockReturnValue({
      coletas: [],
      loading: false,
    });
    (useGraficoColetas as jest.Mock).mockReturnValue({
      labels: [],
      datasets: [],
    });

    render(<RelatorioColetas view="mensal" onViewChange={mockOnViewChange} />);

    expect(screen.getByText(/nenhuma empresa vinculada/i)).toBeInTheDocument();
  });

  it("mostra aviso se não há movimentação registrada", () => {
    (useCurrentCompany as jest.Mock).mockReturnValue({
      codEmpresa: 1,
      loading: false,
    });
    (useGetColetas as jest.Mock).mockReturnValue({
      coletas: [],
      loading: false,
    });
    (useGraficoColetas as jest.Mock).mockReturnValue({
      labels: [],
      datasets: [],
    });

    render(<RelatorioColetas view="mensal" onViewChange={mockOnViewChange} />);

    expect(
      screen.getByText(/nenhuma movimentação registrada/i)
    ).toBeInTheDocument();
  });

  it("mostra o gráfico quando há dados", () => {
    (useCurrentCompany as jest.Mock).mockReturnValue({
      codEmpresa: 1,
      loading: false,
    });
    (useGetColetas as jest.Mock).mockReturnValue({
      coletas: [{ id: 1 }],
      loading: false,
    });
    (useGraficoColetas as jest.Mock).mockReturnValue({
      labels: ["Dia 1"],
      datasets: [{ data: [5], label: "Coletas" }],
    });

    render(<RelatorioColetas view="mensal" onViewChange={mockOnViewChange} />);

    expect(screen.getByText(/Relatório de Coletas/i)).toBeInTheDocument();
    expect(screen.getByText(/Coletas por dia/i)).toBeInTheDocument();
  });

  it("dispara onViewChange ao clicar em 'Visão Anual'", () => {
    (useCurrentCompany as jest.Mock).mockReturnValue({
      codEmpresa: 1,
      loading: false,
    });
    (useGetColetas as jest.Mock).mockReturnValue({
      coletas: [{ id: 1 }],
      loading: false,
    });
    (useGraficoColetas as jest.Mock).mockReturnValue({
      labels: ["Dia 1"],
      datasets: [{ data: [5], label: "Coletas" }],
    });

    render(<RelatorioColetas view="mensal" onViewChange={mockOnViewChange} />);

    fireEvent.click(screen.getByText(/Visão Anual/i));
    expect(mockOnViewChange).toHaveBeenCalledWith("anual");
  });
});
