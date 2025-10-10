"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteCookie, getCookie } from "cookies-next";
import "./Sidebar.css";
import Link from "next/link";

// Hooks
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import useCurrentCompany from "../hooks/useCurrentCompany";
import useExportColetasCSV from "../hooks/useExportColetasCSV";

// Componentes e Utils
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import ExportCSVModal, { ExportOptions } from "./ExportCsvModal"; // Ajustei o nome do arquivo para o padrão (primeira letra maiúscula)

// Ícones
import {
  FiHome,
  FiLogOut,
  FiSmartphone,
  FiClipboard,
  FiMenu,
  FiArchive,
  FiPackage,
  FiUsers,
  FiChevronRight,
  FiChevronDown,
  FiRepeat,
  FiLayers,
  FiFileText,
} from "react-icons/fi";
import { HiOfficeBuilding } from "react-icons/hi";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const router = useRouter();
  const token = getCookie("token");
  const { usuario } = useGetLoggedUser(getUserFromToken(String(token)) || 0);

  const { empresa } = useCurrentCompany();
  const codEmpresa = empresa?.codEmpresa;
  const { exportar, exportando } = useExportColetasCSV();

  const [isCadastrosOpen, setIsCadastrosOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsCadastrosOpen(false);
    }
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem("empresaSelecionada");
    deleteCookie("token");
    deleteCookie("user");
    deleteCookie("refreshToken");
    router.push("/Painel-Coletas/Login");
  };

  const handleCadastrosToggle = () => {
    if (isOpen) {
      setIsCadastrosOpen(!isCadastrosOpen);
    }
  };

  // 👇 FUNÇÃO CORRIGIDA 👇
  const handleExportConfirm = (options: ExportOptions) => {
    if (!codEmpresa) {
      alert("Por favor, selecione uma empresa antes de exportar.");
      return;
    }
    exportar({
      codEmpresa: codEmpresa,
      dataInicial: options.startDate,
      dataFinal: options.endDate,
      formatoRelatorio: options.formato, // ✨ CORREÇÃO: Adicionada esta linha
      incluirItens: options.incluirItens,
      incluirLotes: options.incluirLotes,
      incluirNumerosSerie: options.incluirNumerosSerie,
    });
    setIsModalOpen(false);
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? "" : "closed"}`}>
        <div className="header-sidebar">
          <div className="user-info">
            {isOpen && <span>{usuario?.nome || "USUARIO GENERICO"}</span>}
          </div>
          <button className="toggle-button" onClick={toggleSidebar}>
            <FiMenu size={24} />
          </button>
        </div>

        <ul className="menu">
          <li>
            {" "}
            <Link href="/Painel-Coletas" className="menu-item">
              {" "}
              <FiHome size={24} />{" "}
              {isOpen && <span className="menu-text">Home</span>}{" "}
            </Link>{" "}
          </li>
          <li>
            {" "}
            <Link href="/Painel-Coletas/Inventario" className="menu-item">
              {" "}
              <FiLayers size={24} />{" "}
              {isOpen && <span className="menu-text">Inventários</span>}{" "}
            </Link>{" "}
          </li>
          <li>
            {" "}
            <Link href="/Painel-Coletas/Transferencia" className="menu-item">
              {" "}
              <FiRepeat size={24} />{" "}
              {isOpen && <span className="menu-text">Transferências</span>}{" "}
            </Link>{" "}
          </li>
          <li>
            {" "}
            <Link href="/Painel-Coletas/Conferencias" className="menu-item">
              {" "}
              <FiClipboard size={24} />{" "}
              {isOpen && <span className="menu-text">Conferências</span>}{" "}
            </Link>{" "}
          </li>

          <li className="menu-item-wrapper">
            <div
              className="menu-item dropdown-toggle"
              onClick={handleCadastrosToggle}
            >
              <FiArchive size={24} />
              {isOpen && <span className="menu-text">Cadastros</span>}
              {isOpen && (
                <span className="dropdown-icon">
                  {" "}
                  {isCadastrosOpen ? (
                    <FiChevronDown />
                  ) : (
                    <FiChevronRight />
                  )}{" "}
                </span>
              )}
            </div>
            <ul
              className={`submenu ${isCadastrosOpen && isOpen ? "open" : ""}`}
            >
              <li>
                {" "}
                <Link
                  href="/Painel-Coletas/Dispositivos"
                  className="menu-item submenu-item"
                >
                  {" "}
                  <FiSmartphone size={24} />{" "}
                  {isOpen && <span className="menu-text">Dispositivos</span>}{" "}
                </Link>{" "}
              </li>
              <li>
                {" "}
                <Link
                  href="/Painel-Coletas/Produtos"
                  className="menu-item submenu-item"
                >
                  {" "}
                  <FiPackage size={24} />{" "}
                  {isOpen && <span className="menu-text">Produtos</span>}{" "}
                </Link>{" "}
              </li>
              <li>
                {" "}
                <Link
                  href="/Painel-Coletas/Funcionarios"
                  className="menu-item submenu-item"
                >
                  {" "}
                  <FiUsers size={24} />{" "}
                  {isOpen && <span className="menu-text">Funcionários</span>}{" "}
                </Link>{" "}
              </li>
            </ul>
          </li>

          <li>
            {" "}
            <Link
              href="/Painel-Coletas/SelecionarEmpresa"
              className="menu-item"
            >
              {" "}
              <HiOfficeBuilding size={24} />{" "}
              {isOpen && <span className="menu-text">Mudar Empresa</span>}{" "}
            </Link>{" "}
          </li>

          <li>
            <button className="menu-item" onClick={() => setIsModalOpen(true)}>
              <FiFileText size={24} />
              {isOpen && <span className="menu-text">Exportar Relatório</span>}
            </button>
          </li>
        </ul>

        <div className="bottom-section">
          <button className="menu-item logout" onClick={handleLogout}>
            <FiLogOut size={24} className="logout-icon" />
            {isOpen && <span className="logout-text">Sair</span>}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <ExportCSVModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleExportConfirm}
          isExporting={exportando}
        />
      )}
    </>
  );
}
