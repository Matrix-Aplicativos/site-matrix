import { renderHook, waitFor } from "@testing-library/react";
import useConfiguracao from "../hooks/useConfiguracao";
import axiosInstance from "../../../app/shared/axios/axiosInstanceColeta";

jest.mock("../shared/axios/axiosInstanceColeta");

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe("useConfiguracao", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve buscar e retornar configurações corretamente", async () => {
    const mockConfigs = [
      {
        codEmpresa: 1,
        codConfiguracao: 1,
        descricao: "maximo-de-dispositivos",
        valor: "10",
        ativo: true,
      },
      {
        codEmpresa: 1,
        codConfiguracao: 2,
        descricao: "configuracao-teste1",
        valor: "qualquer",
        ativo: true,
      },
      {
        codEmpresa: 1,
        codConfiguracao: 3,
        descricao: "configuracao-teste2",
        valor: "qualquer",
        ativo: false,
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockConfigs });

    const { result } = renderHook(() => useConfiguracao(1));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockedAxios.get).toHaveBeenCalledWith("/configuracao/1");
    expect(result.current.configuracoes).toEqual(mockConfigs);
    expect(result.current.maximoDispositivos).toBe(10);
    expect(result.current.configuracaoTeste1).toBe(true);
    expect(result.current.configuracaoTeste2).toBe(false);
    expect(result.current.getConfiguracao("maximo-de-dispositivos")).toEqual(
      mockConfigs[0]
    );
  });

  it("deve lidar com erro ao buscar configurações", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Erro na API"));

    const { result } = renderHook(() => useConfiguracao(1));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.configuracoes).toEqual([]);
    expect(result.current.maximoDispositivos).toBe(0);
  });

  it("não deve chamar API se codEmpresa for 0", async () => {
    const { result } = renderHook(() => useConfiguracao(0));

    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(result.current.configuracoes).toEqual([]);
  });
});
