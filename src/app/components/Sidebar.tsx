'use client'; 

import React from 'react';
import { useRouter } from 'next/navigation'; 
import { deleteCookie,getCookie } from 'cookies-next';
import './Sidebar.css';
import { FaClipboardList, FaUsers, FaBox, FaSignOutAlt, FaHome, FaAddressCard } from 'react-icons/fa';
import Link from 'next/link';
import useGetLoggedUser from '../hooks/useGetLoggedUser';
import { getUserFromToken } from '../utils/functions/getUserFromToken';

export default function Sidebar() {
  const router = useRouter();
  const token = getCookie('token');
  const {usuario} = useGetLoggedUser(getUserFromToken(String(token)) || 0);

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
            <FaHome />
            Home
          </Link>
        </li>
        <li>
          <Link href="/Pedidos" className="menu-item">
            <FaClipboardList />
            Pedidos
          </Link>
        </li>
        <li>
          <Link href="/Clientes" className="menu-item">
            <FaUsers />
            Clientes
          </Link>
        </li>
        <li>
          <Link href="/Produtos" className="menu-item">
            <FaBox />
            Produtos
          </Link>
        </li>
      </ul>
      <div className="bottom-section">
        <Link href="/Administrativo" className="menu-item">
          <FaAddressCard />
          Adm
        </Link>
        <button className="menu-item logout" onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" />
          <span className="logout-text">Sair</span>
        </button>
      </div>
    </div>
  );
}
