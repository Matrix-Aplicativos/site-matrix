"use client";

import React, { useEffect, useState } from "react";
import styles from "./Configuracoes.module.css";
import { useLoading } from "../../shared/Context/LoadingContext";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import useCurrentCompany from "../hooks/useCurrentCompany";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import {
  ConfiguracaoApi,
  isValorBoolean,
  parseConfiguracoesResponse,
} from "../utils/types/ConfiguracaoApi";
import { formatPainelTitle } from "../utils/formatPainelTitle";

const IconSave = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const IconRefresh = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L20.49 10M3.51 14l-2.02 4.64A9 9 0 0 0 18.49 15"></path>
  </svg>
);

export default function ConfiguracoesPage() {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { showLoading, hideLoading } = useLoading();
  const { empresa, loading: loadingEmpresa } = useCurrentCompany();
  const pageTitle = formatPainelTitle("CONFIGURAÇÕES", empresa?.nomeFantasia);

  useEffect(() => {
    const fetchConfiguracoes = async () => {
      if (loadingEmpresa) return;

      if (!empresa?.codEmpresa) {
        setError("Nenhuma empresa selecionada");
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(
          `/configuracao/${empresa.codEmpresa}`
        );
        setConfiguracoes(parseConfiguracoesResponse(response.data));
      } catch {
        setError("Não foi possível carregar as configurações");
      } finally {
        setLoading(false);
      }
    };

    fetchConfiguracoes();
  }, [empresa?.codEmpresa, loadingEmpresa]);

  useEffect(() => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading]);

  const handleUpdateConfiguracao = async (configuracao: ConfiguracaoApi) => {
    setSavingId(configuracao.codConfiguracao);
    setError(null);
    setSuccess(null);

    try {
      await axiosInstance.put("/configuracao", configuracao);

      setConfiguracoes((prev) =>
        prev.map((config) =>
          config.codConfiguracao === configuracao.codConfiguracao
            ? configuracao
            : config
        )
      );

      setSuccess(`"${configuracao.descricao}" atualizada com sucesso!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Erro ao atualizar configuração");
    } finally {
      setSavingId(null);
    }
  };

  const handleValorChange = (codConfiguracao: number, novoValor: string) => {
    setConfiguracoes((prev) =>
      prev.map((config) =>
        config.codConfiguracao === codConfiguracao
          ? { ...config, valor: novoValor }
          : config
      )
    );
  };

  const handleBooleanToggle = async (
    config: ConfiguracaoApi,
    checked: boolean
  ) => {
    const updated: ConfiguracaoApi = {
      ...config,
      valor: checked ? "true" : "false",
    };
    setConfiguracoes((prev) =>
      prev.map((item) =>
        item.codConfiguracao === config.codConfiguracao ? updated : item
      )
    );
    await handleUpdateConfiguracao(updated);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <LoadingOverlay />
        <h1 className={styles.title}>{pageTitle}</h1>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <LoadingOverlay />
      <h1 className={styles.title}>{pageTitle}</h1>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}

      <div className={styles.tableContainer}>
        {configuracoes.length > 0 ? (
          <table className={styles.configTable}>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {configuracoes.map((config) => {
                const isSaving = savingId === config.codConfiguracao;
                const isBoolean = isValorBoolean(config.valor);

                return (
                  <tr key={config.codConfiguracao}>
                    <td className={styles.descricaoCell}>{config.descricao}</td>
                    <td className={styles.valorCell}>
                      {isBoolean ? (
                        <div className={styles.valorBoolean}>
                          <label className={styles.switch}>
                            <input
                              type="checkbox"
                              checked={
                                config.valor.trim().toLowerCase() === "true"
                              }
                              disabled={isSaving}
                              onChange={(e) =>
                                handleBooleanToggle(config, e.target.checked)
                              }
                            />
                            <span className={styles.slider}></span>
                          </label>
                          {isSaving && (
                            <IconRefresh className={styles.spinning} />
                          )}
                        </div>
                      ) : (
                        <div className={styles.valorInputRow}>
                          <input
                            type="text"
                            className={styles.configInput}
                            value={config.valor}
                            disabled={isSaving}
                            onChange={(e) =>
                              handleValorChange(
                                config.codConfiguracao,
                                e.target.value
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateConfiguracao(config);
                              }
                            }}
                          />
                          <button
                            type="button"
                            className={styles.saveButton}
                            onClick={() => handleUpdateConfiguracao(config)}
                            disabled={isSaving}
                            title="Salvar"
                          >
                            {isSaving ? (
                              <IconRefresh className={styles.spinning} />
                            ) : (
                              <IconSave />
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className={styles.noConfiguracoes}>
            Nenhuma configuração encontrada para esta empresa.
          </p>
        )}
      </div>
    </div>
  );
}
