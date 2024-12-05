import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import './Sidebar.css';
import { FaClipboardList, FaUsers, FaBox, FaCog, FaSignOutAlt } from 'react-icons/fa';

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
            <FaUsers />
            Usuários
          </Link>
        </li>
      </ul>
      <div className="bottom-section">
        <Link to="/configuracoes" className="menu-item">
          <FaCog />
          Configurações
        </Link>
        <button className="menu-item logout" onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" />
          <span className="logout-text">Sair</span>
        </button>
      </div>
    </div>
  );
}
