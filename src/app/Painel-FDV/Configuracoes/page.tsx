"use client";

import React, { useEffect, useState } from "react";
import styles from "./Configuracoes.module.css";
import { useLoading } from "../../shared/Context/LoadingContext";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";

interface Configuracao {
  codEmpresa: number;
  codConfiguracao: number;
  descricao: string;
  valor: string;
  ativo: boolean;
}

// Ícones
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
  const [configuracoes, setConfiguracoes] = useState<Configuracao[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { showLoading, hideLoading } = useLoading();
  const token = getCookie("token");
  const codUsuario = getUserFromToken(String(token));
  const { usuario } = useGetLoggedUser(codUsuario || 0);

  useEffect(() => {
    const fetchConfiguracoes = async () => {
      try {
        const empresaStorage = localStorage.getItem("empresaSelecionada");
        if (!empresaStorage) {
          setError("Nenhuma empresa selecionada");
          return;
        }

        const empresaData = JSON.parse(empresaStorage);
        const response = await axiosInstance.get<Configuracao[]>(
          `/configuracao/${empresaData.codEmpresa}`
        );
        setConfiguracoes(response.data);
      } catch (err: any) {
        setError("Não foi possível carregar as configurações");
      } finally {
        setLoading(false);
      }
    };

    fetchConfiguracoes();
  }, []);

  useEffect(() => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading]);

  const handleUpdateConfiguracao = async (configuracao: Configuracao) => {
    setSaving(true);
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

      setSuccess("Configuração atualizada com sucesso!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError("Erro ao atualizar configuração");
    } finally {
      setSaving(false);
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

  // Filtra apenas a configuração de venda sem estoque
  const configuracaoVendaSemEstoque = configuracoes.find(
    (config) => config.descricao === "permite-venda-sem-estoque"
  );

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
        {configuracaoVendaSemEstoque ? (
          <div className={styles.configuracaoCard}>
            <div className={styles.configHeader}>
              <h3 className={styles.configTitle}>Permitir Venda Sem Estoque</h3>
              <div className={styles.configActions}>
                <button
                  className={styles.saveButton}
                  onClick={() =>
                    handleUpdateConfiguracao(configuracaoVendaSemEstoque)
                  }
                  disabled={saving}
                >
                  {saving ? <IconRefresh /> : <IconSave />}
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>

            <div className={styles.configBody}>
              <div className={styles.configInputContainer}>
                <div className={styles.configBoolean}>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={configuracaoVendaSemEstoque.valor === "S"}
                      onChange={(e) =>
                        handleValorChange(
                          configuracaoVendaSemEstoque.codConfiguracao,
                          e.target.checked ? "S" : "N"
                        )
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                  <span className={styles.booleanLabel}>
                    {configuracaoVendaSemEstoque.valor === "S"
                      ? "Venda sem estoque permitida"
                      : "Venda sem estoque bloqueada"}
                  </span>
                </div>
              </div>

              <div className={styles.configStatus}>
                <label className={styles.statusToggle}>
                  <input
                    type="checkbox"
                    checked={configuracaoVendaSemEstoque.ativo}
                    onChange={(e) =>
                      handleAtivoChange(
                        configuracaoVendaSemEstoque.codConfiguracao,
                        e.target.checked
                      )
                    }
                  />
                  <span className={styles.statusLabel}>
                    {configuracaoVendaSemEstoque.ativo
                      ? "Configuração ativa"
                      : "Configuração inativa"}
                  </span>
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.noConfiguracoes}>
            <p>Configuração de venda sem estoque não encontrada.</p>
          </div>
        )}
      </div>

      {configuracoes.length > 0 && !configuracaoVendaSemEstoque && (
        <div className={styles.noConfiguracoes}>
          <p>
            Configuração de venda sem estoque não está disponível para esta
            empresa.
          </p>
        </div>
      )}
    </div>
  );
}
