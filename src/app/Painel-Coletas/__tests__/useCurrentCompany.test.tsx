import { renderHook } from "@testing-library/react";
import useCurrentCompany from "../hooks/useCurrentCompany";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";

jest.mock("../hooks/useGetLoggedUser");
jest.mock("cookies-next");
jest.mock("../utils/functions/getUserFromToken");

describe("useCurrentCompany", () => {
  const mockUseGetLoggedUser = useGetLoggedUser as jest.Mock;
  const mockGetCookie = getCookie as jest.Mock;
  const mockGetUserFromToken = getUserFromToken as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCookie.mockReturnValue("fakeToken");
    mockGetUserFromToken.mockReturnValue(123);
  });

  it("deve retornar codEmpresa quando usuário possui empresas", async () => {
    const fakeUser = {
      empresas: [{ codEmpresa: 42 }],
    };

    mockUseGetLoggedUser.mockReturnValue({
      usuario: fakeUser,
      loading: false,
    });

    const { result, rerender } = renderHook(() => useCurrentCompany());

    rerender();

    expect(result.current.codEmpresa).toBe(42);
    expect(result.current.loading).toBe(false);
  });

  it("deve retornar null quando usuário não possui empresas", async () => {
    const fakeUser = {
      empresas: [],
    };

    mockUseGetLoggedUser.mockReturnValue({
      usuario: fakeUser,
      loading: false,
    });

    const { result, rerender } = renderHook(() => useCurrentCompany());

    rerender();

    expect(result.current.codEmpresa).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("deve retornar loading enquanto usuário ainda está carregando", () => {
    mockUseGetLoggedUser.mockReturnValue({
      usuario: null,
      loading: true,
    });

    const { result } = renderHook(() => useCurrentCompany());

    expect(result.current.codEmpresa).toBeNull();
    expect(result.current.loading).toBe(true);
  });
});
