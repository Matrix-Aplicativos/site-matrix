"use client";

import React from "react";
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
  FiBox,
  FiTruck,
  FiClipboard,
  FiBriefcase,
  FiMenu, 
} from "react-icons/fi";

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
    localStorage.removeItem("empresaSelecionada");
    deleteCookie("token");
    deleteCookie("user");
    deleteCookie("refreshToken");
    router.push("/Painel-Coletas/Login");
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
            <FiBox size={24} />
            {isOpen && <span className="menu-text">Inventários</span>}
          </Link>
        </li>
        <li>
          <Link href="/Painel-Coletas/Transferencia" className="menu-item">
            <FiTruck size={24} />
            {isOpen && <span className="menu-text">Transferências</span>}
          </Link>
        </li>
        <li>
          <Link href="/Painel-Coletas/Conferencias" className="menu-item">
            <FiClipboard size={24} />
            {isOpen && <span className="menu-text">Conferências</span>}
          </Link>
        </li>
        <li>
          <Link href="/Painel-Coletas/Dispositivos" className="menu-item">
            <FiSmartphone size={24} />
            {isOpen && <span className="menu-text">Dispositivos</span>}
          </Link>
        </li>
        <li>
          <Link href="/Painel-Coletas/SelecionarEmpresa" className="menu-item">
            <FiBriefcase size={24} />
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
