import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "../components/Sidebar";

// mocks de next/navigation e cookies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn().mockReturnValue("/Painel-Coletas"),
}));

jest.mock("cookies-next", () => ({
  getCookie: jest.fn().mockReturnValue("fake-token"),
  deleteCookie: jest.fn(),
}));

jest.mock("../hooks/useGetLoggedUser", () => jest.fn());
jest.mock("../utils/functions/getUserFromToken", () => ({
  getUserFromToken: jest.fn().mockReturnValue(1),
}));

import { useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next";
import useGetLoggedUser from "../hooks/useGetLoggedUser";

describe("Sidebar", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renderiza o nome do usuário quando está logado", () => {
    (useGetLoggedUser as jest.Mock).mockReturnValue({
      usuario: { nome: "Loren User" },
    });

    render(<Sidebar />);

    expect(screen.getByText("Loren User")).toBeInTheDocument();
  });

  it("renderiza fallback quando não há usuário", () => {
    (useGetLoggedUser as jest.Mock).mockReturnValue({ usuario: null });

    render(<Sidebar />);

    expect(screen.getByText("USUARIO GENERICO")).toBeInTheDocument();
  });

  it("renderiza os links de navegação", () => {
    (useGetLoggedUser as jest.Mock).mockReturnValue({
      usuario: { nome: "Teste" },
    });

    render(<Sidebar />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Inventários")).toBeInTheDocument();
    expect(screen.getByText("Transferências")).toBeInTheDocument();
    expect(screen.getByText("Conferências")).toBeInTheDocument();
    expect(screen.getByText("Dispositivos")).toBeInTheDocument();
  });

  it("executa logout corretamente", () => {
    (useGetLoggedUser as jest.Mock).mockReturnValue({
      usuario: { nome: "Teste" },
    });

    render(<Sidebar />);

    fireEvent.click(screen.getByText("Sair"));

    expect(deleteCookie).toHaveBeenCalledWith("token");
    expect(deleteCookie).toHaveBeenCalledWith("user");
    expect(deleteCookie).toHaveBeenCalledWith("refreshToken");
    expect(mockPush).toHaveBeenCalledWith("/Painel-Coletas/Login");
  });
});
