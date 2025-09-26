// Sidebar.tsx / Sidebar.jsx

"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { deleteCookie, getCookie } from "cookies-next";
import "./Sidebar.css";
import Link from "next/link";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
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
} from "react-icons/fi";
// 1. Adicione o import para o novo ícone de outra biblioteca
import { HiOfficeBuilding } from "react-icons/hi";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const router = useRouter();
  const token = getCookie("token");
  const { usuario } = useGetLoggedUser(getUserFromToken(String(token)) || 0);

  const [isCadastrosOpen, setIsCadastrosOpen] = useState(false);

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

  return (
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
          <Link href="/Painel-Coletas" className="menu-item">
            <FiHome size={24} />
            {isOpen && <span className="menu-text">Home</span>}
          </Link>
        </li>
        <li>
          <Link href="/Painel-Coletas/Inventario" className="menu-item">
            <FiLayers size={24} />
            {isOpen && <span className="menu-text">Inventários</span>}
          </Link>
        </li>
        <li>
          <Link href="/Painel-Coletas/Transferencia" className="menu-item">
            <FiRepeat size={24} />
            {isOpen && <span className="menu-text">Transferências</span>}
          </Link>
        </li>
        <li>
          <Link href="/Painel-Coletas/Conferencias" className="menu-item">
            <FiClipboard size={24} />
            {isOpen && <span className="menu-text">Conferências</span>}
          </Link>
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
                {isCadastrosOpen ? <FiChevronDown /> : <FiChevronRight />}
              </span>
            )}
          </div>
          <ul className={`submenu ${isCadastrosOpen && isOpen ? "open" : ""}`}>
            <li>
              <Link
                href="/Painel-Coletas/Dispositivos"
                className="menu-item submenu-item"
              >
                <FiSmartphone size={24} />
                {isOpen && <span className="menu-text">Dispositivos</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/Painel-Coletas/Produtos"
                className="menu-item submenu-item"
              >
                <FiPackage size={24} />
                {isOpen && <span className="menu-text">Produtos</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/Painel-Coletas/Funcionarios"
                className="menu-item submenu-item"
              >
                <FiUsers size={24} />
                {isOpen && <span className="menu-text">Funcionários</span>}
              </Link>
            </li>
          </ul>
        </li>

        <li>
          <Link href="/Painel-Coletas/SelecionarEmpresa" className="menu-item">
            {/* 2. Substitua o ícone antigo pelo novo */}
            <HiOfficeBuilding size={24} />
            {isOpen && <span className="menu-text">Mudar Empresa</span>}
          </Link>
        </li>
      </ul>

      <div className="bottom-section">
        <button className="menu-item logout" onClick={handleLogout}>
          <FiLogOut size={24} className="logout-icon" />
          {isOpen && <span className="logout-text">Sair</span>}
        </button>
      </div>
    </div>
  );
}
