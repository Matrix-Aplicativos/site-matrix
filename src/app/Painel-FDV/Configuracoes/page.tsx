"use client";

import React, { useEffect, useState } from "react";
import styles from "./Configuracoes.module.css";
import { useLoading } from "../../shared/Context/LoadingContext";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import useCurrentCompany from "../hooks/useCurrentCompany";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import {
  ConfiguracaoApi,
  isValorSimNao,
  parseConfiguracoesResponse,
} from "../utils/types/ConfiguracaoApi";

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

const IconRefresh = () => (
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

  const handleAtivoChange = (codConfiguracao: number, ativo: boolean) => {
    setConfiguracoes((prev) =>
      prev.map((config) =>
        config.codConfiguracao === codConfiguracao
          ? { ...config, ativo }
          : config
      )
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <LoadingOverlay />
        <h1 className={styles.title}>CONFIGURAÇÕES</h1>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <LoadingOverlay />
      <h1 className={styles.title}>CONFIGURAÇÕES</h1>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {success && <div className={styles.successMessage}>{success}</div>}

      <div className={styles.configuracoesGrid}>
        {configuracoes.length > 0 ? (
          configuracoes.map((config) => {
            const isSaving = savingId === config.codConfiguracao;

            return (
              <div
                key={config.codConfiguracao}
                className={styles.configuracaoCard}
              >
                <div className={styles.configHeader}>
                  <h3 className={styles.configTitle}>{config.descricao}</h3>
                  <div className={styles.configActions}>
                    <button
                      className={styles.saveButton}
                      onClick={() => handleUpdateConfiguracao(config)}
                      disabled={isSaving}
                    >
                      {isSaving ? <IconRefresh /> : <IconSave />}
                      {isSaving ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </div>

                <div className={styles.configBody}>
                  <div className={styles.configInputContainer}>
                    {isValorSimNao(config.valor) ? (
                      <div className={styles.configBoolean}>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={config.valor === "S"}
                            onChange={(e) =>
                              handleValorChange(
                                config.codConfiguracao,
                                e.target.checked ? "S" : "N"
                              )
                            }
                          />
                          <span className={styles.slider}></span>
                        </label>
                        <span className={styles.booleanLabel}>
                          {config.valor === "S" ? "Sim" : "Não"}
                        </span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        className={styles.configInput}
                        value={config.valor}
                        onChange={(e) =>
                          handleValorChange(
                            config.codConfiguracao,
                            e.target.value
                          )
                        }
                      />
                    )}
                  </div>

                  <div className={styles.configStatus}>
                    <label className={styles.statusToggle}>
                      <input
                        type="checkbox"
                        checked={config.ativo}
                        onChange={(e) =>
                          handleAtivoChange(
                            config.codConfiguracao,
                            e.target.checked
                          )
                        }
                      />
                      <span className={styles.statusLabel}>
                        {config.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </label>
                  </div>
                </div>

                <div className={styles.configFooter}>
                  <span className={styles.configId}>Código: {config.codigo}</span>
                  <span className={styles.configDescricao}>
                    ID: {config.codConfiguracao}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.noConfiguracoes}>
            <p>Nenhuma configuração encontrada para esta empresa.</p>
          </div>
        )}
      </div>
    </div>
  );
}
