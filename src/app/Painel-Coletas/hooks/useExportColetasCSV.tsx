// Crie este novo arquivo em: ../hooks/useExportColetasCSV.tsx

import { useState } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";

// Interface para os parâmetros da função de exportação
interface ExportParams {
  codEmpresa: number;
  dataInicial?: string;
  dataFinal?: string;
  // Parâmetros do endpoint de relatório
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
    incluirItens = false, // Valores padrão baseados no Swagger
    incluirLotes = false,
    incluirNumerosSerie = false,
  }: ExportParams) => {
    if (!codEmpresa) {
      alert("Código da empresa não encontrado.");
      return;
    }
    // Validação de datas
    if (!dataInicial || !dataFinal) {
      alert("Por favor, selecione um período de datas para exportar.");
      return;
    }

    setExportando(true);
    try {
      const queryParams = new URLSearchParams({
        periodoIni: dataInicial,
        periodoFim: dataFinal,
        formatoRelatorio: "csv",
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

      const dataFormatada = new Date().toISOString().slice(0, 10);
      link.setAttribute("download", `relatorio_coletas_${dataFormatada}.csv`);

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
