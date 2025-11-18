"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { deleteCookie, getCookie } from "cookies-next";
import Link from "next/link";
import "./Sidebar.css";

// Hooks e Utils
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import { getUserFromToken } from "../utils/functions/getUserFromToken";

// Ícones
import {
  FiClipboard,
  FiHome,
  FiLogOut,
  FiPackage,
  FiSmartphone, 
  FiTarget,
  FiUsers,
  FiMenu,
} from "react-icons/fi";
import { HiCog, HiOfficeBuilding } from "react-icons/hi";

// --- Interface de Props ---
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const router = useRouter();
  const token = getCookie("token");
  const { usuario } = useGetLoggedUser(getUserFromToken(String(token)) || 0);
  const pathname = usePathname();

  const handleLogout = () => {
    router.push("/Painel-FDV/Login");
    deleteCookie("token");
    deleteCookie("user");
    deleteCookie("refreshToken");
  };

  return (
    <div className={`sidebar ${isOpen ? "" : "closed"}`}>
      <div className="header-sidebar">
        <div className="user-info">
          {isOpen && <span>{usuario?.nome || "USUARIO"}</span>}
        </div>

        <button className="toggle-button" onClick={toggleSidebar}>
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

        <li>
          <Link href="/Painel-FDV/Produtos" className="menu-item">
            <FiPackage size={24} />
            {isOpen && <span className="menu-text">Produtos</span>}
          </Link>
        </li>

        <li>
          <Link href="/Painel-FDV/Funcionarios" className="menu-item">
            <FiUsers size={24} />
            {isOpen && <span className="menu-text">Funcionários</span>}
          </Link>
        </li>
        <li>
          <Link href="/Painel-FDV/Dispositivos" className="menu-item">
            <FiSmartphone size={24} />
            {isOpen && <span className="menu-text">Dispositivos</span>}
          </Link>
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
        <button className="menu-item logout" onClick={handleLogout}>
          <FiLogOut size={24} className="logout-icon" />
          {isOpen && <span className="logout-text">Sair</span>}
        </button>
      </div>
    </div>
  );
}
