"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteCookie, getCookie } from "cookies-next";
import Link from "next/link";
import "./Sidebar.css";

import useGetLoggedUser from "../hooks/useGetLoggedUser";
import { getUserFromToken } from "../utils/functions/getUserFromToken";

import {
  FiClipboard,
  FiHome,
  FiLogOut,
  FiPackage,
  FiSmartphone,
  FiTarget,
  FiUsers,
  FiMenu,
  FiChevronRight,
  FiChevronDown,
  FiArchive,
} from "react-icons/fi";
import { HiCog, HiOfficeBuilding } from "react-icons/hi";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const [isCadastrosOpen, setIsCadastrosOpen] = useState(false);

  const router = useRouter();
  const token = getCookie("token");
  const { usuario } = useGetLoggedUser(getUserFromToken(String(token)) || 0);

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
    router.push("/Painel-FDV/Login");
  };

  const handleCadastrosToggle = () => {
    if (isOpen) {
      setIsCadastrosOpen(!isCadastrosOpen);
    }
  };

  return (
    <div className={`sidebar ${isOpen ? "" : "closed"}`}>
      <div className="header-sidebar">
        <div className="user-info">
          {isOpen && <span>{usuario?.nome || "USUARIO GENERICO"}</span>}
        </div>
        <button
          type="button"
          className="toggle-button"
          onClick={toggleSidebar}
          aria-label={isOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
        >
          <FiMenu size={24} />
        </button>
      </div>

      <ul className="menu">
        <li>
          <Link href="/Painel-FDV" className="menu-item">
            <FiHome size={24} />
            {isOpen && <span className="menu-text">Home</span>}
          </Link>
        </li>

        <li>
          <Link href="/Painel-FDV/Pedidos" className="menu-item">
            <FiClipboard size={24} />
            {isOpen && <span className="menu-text">Pedidos</span>}
          </Link>
        </li>

        <li>
          <Link href="/Painel-FDV/Clientes" className="menu-item">
            <FiTarget size={24} />
            {isOpen && <span className="menu-text">Clientes</span>}
          </Link>
        </li>

        <li className="menu-item-wrapper">
          <button
            type="button"
            className="menu-item dropdown-toggle"
            onClick={handleCadastrosToggle}
            aria-expanded={isCadastrosOpen && isOpen}
            aria-controls="cadastros-submenu"
          >
            <FiArchive size={24} />
            {isOpen && <span className="menu-text">Cadastros</span>}
            {isOpen && (
              <span className="dropdown-icon">
                {isCadastrosOpen ? <FiChevronDown /> : <FiChevronRight />}
              </span>
            )}
          </button>
          <ul
            id="cadastros-submenu"
            className={`submenu ${isCadastrosOpen && isOpen ? "open" : ""}`}
          >
            <li>
              <Link
                href="/Painel-FDV/Produtos"
                className="menu-item submenu-item"
              >
                <FiPackage size={24} />
                {isOpen && <span className="menu-text">Produtos</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/Painel-FDV/Funcionarios"
                className="menu-item submenu-item"
              >
                <FiUsers size={24} />
                {isOpen && <span className="menu-text">Funcionários</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/Painel-FDV/Dispositivos"
                className="menu-item submenu-item"
              >
                <FiSmartphone size={24} />
                {isOpen && <span className="menu-text">Dispositivos</span>}
              </Link>
            </li>
          </ul>
        </li>

        <li>
          <Link href="/Painel-FDV/SelecionarEmpresa" className="menu-item">
            <HiOfficeBuilding size={24} />
            {isOpen && <span className="menu-text">Mudar Empresa</span>}
          </Link>
        </li>

        <li>
          <Link href="/Painel-FDV/Configuracoes" className="menu-item">
            <HiCog size={24} />
            {isOpen && <span className="menu-text">Configurações</span>}
          </Link>
        </li>
      </ul>

      <div className="bottom-section">
        <button type="button" className="menu-item logout" onClick={handleLogout}>
          <FiLogOut size={24} className="logout-icon" />
          {isOpen && <span className="logout-text">Sair</span>}
        </button>
      </div>
    </div>
  );
}
