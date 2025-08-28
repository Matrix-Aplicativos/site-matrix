import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "../components/SearchBar";

describe("SearchBar", () => {
  it("renderiza com placeholder padrão", () => {
    const mockSearch = jest.fn();
    render(<SearchBar onSearch={mockSearch} />);
    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
  });

  it("renderiza com placeholder customizado", () => {
    const mockSearch = jest.fn();
    render(<SearchBar placeholder="Procurar cliente..." onSearch={mockSearch} />);
    expect(screen.getByPlaceholderText(/procurar cliente/i)).toBeInTheDocument();
  });

  it("chama onSearch quando o usuário digita", () => {
    const mockSearch = jest.fn();
    render(<SearchBar onSearch={mockSearch} />);

    const input = screen.getByPlaceholderText(/buscar/i);
    fireEvent.change(input, { target: { value: "teste" } });

    expect(mockSearch).toHaveBeenCalledWith("teste");
  });

  it("chama onFilterClick ao clicar no ícone de filtro", () => {
    const mockSearch = jest.fn();
    const mockFilterClick = jest.fn();
    render(<SearchBar onSearch={mockSearch} onFilterClick={mockFilterClick} />);

    const filterIcon = screen.getByRole("img", { hidden: true }); // react-icons vira SVG
    fireEvent.click(filterIcon);

    expect(mockFilterClick).toHaveBeenCalled();
  });
});
