import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import './Sidebar.css';
import { FaClipboardList, FaUsers, FaUser, FaBox, FaSignOutAlt, FaHome, FaAddressCard } from 'react-icons/fa';

export default function Sidebar() {
  const navigate = useNavigate(); 

  const handleLogout = () => {
    navigate('/login'); 
  };

  return (
    <div className="sidebar">
      <ul className="menu">
        <li className="user-info">
          <span>Nome do Usuário</span>
        </li>
        <li>
        <li>
          <Link to="/" className="menu-item">
            <FaHome />
            Home
          </Link>
        </li>
          <Link to="/pedidos" className="menu-item">
            <FaClipboardList />
            Pedidos
          </Link>
        </li>
        <li>
          <Link to="/clientes" className="menu-item">
            <FaUsers />
            Clientes
          </Link>
        </li>
        <li>
          <Link to="/produtos" className="menu-item">
            <FaBox />
            Produtos
          </Link>
        </li>
        <li>
          <Link to="/usuarios" className="menu-item">
            <FaUser />
            Usuários
          </Link>
        </li>
      </ul>
      <div className="bottom-section">
        <Link to="/adm" className="menu-item">
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
