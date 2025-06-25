'use client'; 

import React from 'react';
import { usePathname, useRouter } from 'next/navigation'; 
import { deleteCookie,getCookie } from 'cookies-next';
import './Sidebar.css';
import Link from 'next/link';
import useGetLoggedUser from '../hooks/useGetLoggedUser';
import { getUserFromToken } from '../utils/functions/getUserFromToken';
import { FiBox, FiClipboard, FiHome, FiLogOut, FiPackage, FiSettings, FiTarget, FiUser, FiUsers } from 'react-icons/fi';

export default function Sidebar() {
  const router = useRouter();
  const token = getCookie('token');
  const {usuario} = useGetLoggedUser(getUserFromToken(String(token)) || 0);
  const pathname = usePathname();

  const handleLogout = () => {
    router.push('/Login'); 
    deleteCookie("token");
    deleteCookie("user");
    deleteCookie ("refreshToken");
  };

  return (
    <div className="sidebar">
      <ul className="menu">
        <li className="user-info">
          <span>{usuario?.nome || ""}</span>
        </li>
        <li>
          <Link href="/" className="menu-item">
            <FiHome size={24} />
            Home
          </Link>
        </li>
        <li>
          <Link href="/Pedidos" className="menu-item">
            <FiClipboard size={24} />
            Pedidos
          </Link>
        </li>
        <li>
          <Link href="/Clientes" className="menu-item">
            <FiTarget size={24} />
            Clientes
          </Link>
        </li>
        <li>
          <Link href="/Produtos" className="menu-item">
            <FiPackage size={24} />
            Produtos
          </Link>
        </li>
        <li>
          <Link href="/Usuarios" className="menu-item">
            <FiUsers size={24} />
            Usuários
          </Link>
        </li>
      </ul>
      <div className="bottom-section">
        <Link href="/Administrativo" className="menu-item">
          <FiSettings size={24}/>
          Administrativo
        </Link>
        <button className="menu-item logout" onClick={handleLogout}>
          <FiLogOut size={24} className="logout-icon" />
          <span className="logout-text">Sair</span>
        </button>
      </div>
    </div>
  );
}
