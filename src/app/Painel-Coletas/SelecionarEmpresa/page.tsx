"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import { Usuario, Empresa } from "../utils/types/Usuario";
import Image from "next/image";
import Logo from "@/app/img/Logo.png";
import "./SelecionarEmpresa.css";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import SearchBar from "../components/SearchBar";

export default function SelecionarEmpresaPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // ... (lógica do useEffect permanece a mesma)
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          window.location.href = "/Painel-Coletas/Login";
          return;
        }
        const userId = getUserFromToken(token);
        const response = await axiosInstance.get(`/usuario/${userId}`);
        setUsuario(response.data);
      } catch (err: any) {
        setError("Não foi possível carregar os dados do usuário.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const filteredEmpresas = useMemo(() => {
    // ... (lógica do useMemo permanece a mesma)
    if (!usuario?.empresas) return [];
    if (!searchQuery) return usuario.empresas;
    const lowercasedQuery = searchQuery.toLowerCase();
    return usuario.empresas.filter(
      (empresa) =>
        empresa.nomeFantasia.toLowerCase().includes(lowercasedQuery) ||
        empresa.cnpj.replace(/[^\d]/g, "").includes(lowercasedQuery)
    );
  }, [usuario, searchQuery]);

  const handleSelectEmpresa = (empresa: Empresa) => {
    // ... (lógica do handleSelectEmpresa permanece a mesma)
    localStorage.setItem("empresaSelecionada", JSON.stringify(empresa));
    window.location.href = "/Painel-Coletas";
  };

  const formatCpfCnpj = (cnpj: string) => {
    // ... (lógica do formatCpfCnpj permanece a mesma)
    if (!cnpj) return "";
    return cnpj.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  };

  if (loading) {
    return <div className="loading-container">Carregando...</div>;
  }
  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="selecao-container-grid">
      <header className="selecao-header">
        {/* Ordem dos itens no header ajustada para o alinhamento */}
        <div className="header-left">
          <SearchBar
            placeholder="Buscar por nome ou CNPJ..."
            onSearch={setSearchQuery}
            showFilterIcon={false} // <-- Propriedade para esconder o ícone
          />
        </div>
        <div className="header-center">
          <h1>Selecione a Empresa</h1>
          <p>Escolha a empresa que deseja visualizar</p>
        </div>
        <div className="header-right">
          <Image src={Logo} alt="Logo" width={80} priority />
        </div>
      </header>

      <main className="empresas-grid">
        {/* ... (lógica do main permanece a mesma) ... */}
        {filteredEmpresas.length > 0 ? (
          filteredEmpresas.map((empresa) => (
            <button
              key={empresa.codEmpresa}
              className="empresa-box"
              onClick={() => handleSelectEmpresa(empresa)}
            >
              <h3 className="empresa-box-nome">{empresa.nomeFantasia}</h3>
              <p className="empresa-box-cnpj">{formatCpfCnpj(empresa.cnpj)}</p>
            </button>
          ))
        ) : (
          <div className="no-results">
            <p>Nenhuma empresa encontrada para sua busca.</p>
          </div>
        )}
      </main>
    </div>
  );
}
