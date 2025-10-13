import { useState } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";

// Interface para os parâmetros da função de exportação
interface ExportParams {
  codEmpresa: number;
  dataInicial?: string;
  dataFinal?: string;
  formatoRelatorio: "csv" | "excel"; // Espera 'csv' ou 'excel'
  incluirItens?: boolean;
  incluirLotes?: boolean;
  incluirNumerosSerie?: boolean;
}

// Interface para o retorno do hook
interface UseExportColetasCSVHook {
  exportar: (params: ExportParams) => Promise<void>;
  exportando: boolean; // Estado de loading específico para a exportação
}

const useExportColetasCSV = (): UseExportColetasCSVHook => {
  const [exportando, setExportando] = useState<boolean>(false);

  const exportar = async ({
    codEmpresa,
    dataInicial,
    dataFinal,
    formatoRelatorio,
    incluirItens = false,
    incluirLotes = false,
    incluirNumerosSerie = false,
  }: ExportParams) => {
    if (!codEmpresa) {
      alert("Código da empresa não encontrado.");
      return;
    }
    if (!dataInicial || !dataFinal) {
      alert("Por favor, selecione um período de datas para exportar.");
      return;
    }

    // Validação do período máximo de 90 dias
    const dtInicial = new Date(dataInicial);
    const dtFinal = new Date(dataFinal);
    const diffTime = Math.abs(dtFinal.getTime() - dtInicial.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 90) {
      alert("O período selecionado não pode exceder 90 dias.");
      return;
    }

    setExportando(true);
    try {
      const queryParams = new URLSearchParams({
        periodoIni: dataInicial,
        periodoFim: dataFinal,
        formatoRelatorio: formatoRelatorio, // Envia 'csv' ou 'excel' para a API
        incluirItens: String(incluirItens),
        incluirLotes: String(incluirLotes),
        incluirNumerosSerie: String(incluirNumerosSerie),
      });

      const response = await axiosInstance.get(
        `/relatorio/coleta/${codEmpresa}?${queryParams}`,
        {
          responseType: "blob", // Muito importante: para receber o arquivo
        }
      );

      // Lógica para forçar o download do arquivo no navegador
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Define a extensão do arquivo para download corretamente (.xlsx para excel)
      const fileExtension = formatoRelatorio === "excel" ? "xlsx" : "csv";
      const dataFormatada = new Date().toISOString().slice(0, 10);

      link.setAttribute(
        "download",
        `relatorio_coletas_${dataFormatada}.${fileExtension}`
      );

      document.body.appendChild(link);
      link.click();

      // Limpeza
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : "Ocorreu um erro ao exportar o relatório.";
      alert(`Erro na exportação: ${errorMessage}`);
    } finally {
      setExportando(false);
    }
  };

  return { exportar, exportando };
};

export default useExportColetasCSV;
