"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { deleteCookie, getCookie } from "cookies-next";
import "./Sidebar.css";
import Link from "next/link";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import { FiHome, FiLogOut, FiSmartphone, FiBarChart2 } from "react-icons/fi";

export default function Sidebar() {
  const router = useRouter();
  const token = getCookie("token");
  const { usuario } = useGetLoggedUser(getUserFromToken(String(token)) || 0);
  const pathname = usePathname();

  const handleLogout = () => {
    router.push("/Painel-Coletas/Login");
    deleteCookie("token");
    deleteCookie("user");
    deleteCookie("refreshToken");
  };

  return (
    <div className="sidebar">
      <ul className="menu">
        <li className="user-info">
          <span>{usuario?.nome || "USUARIO GENERICO"}</span>
        </li>
        <li>
          <Link href="/Painel-Coletas" className="menu-item">
            <FiHome size={24} />
            Home
          </Link>
        </li>
        <li>
          <Link href="/Painel-Coletas/Coletas" className="menu-item">
            <FiBarChart2 size={24} />
            Coletas
          </Link>
        </li>
        <li>
          <Link href="/Painel-Coletas/Dispositivos" className="menu-item">
            <FiSmartphone size={24} />
            Dispositivos
          </Link>
        </li>
      </ul>
      <div className="bottom-section">
        <button className="menu-item logout" onClick={handleLogout}>
          <FiLogOut size={24} className="logout-icon" />
          <span className="logout-text">Sair</span>
        </button>
      </div>
    </div>
  );
}
