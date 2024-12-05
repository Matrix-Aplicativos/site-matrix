'use client';

import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from '@/app/components/Sidebar';
import PedidosPage from '@/app/pages/Pedidos';
import ClientesPage from '@/app/pages/Clientes';
import ProdutosPage from '@/app/pages/Produtos';
import UsuariosPage from '@/app/pages/Usuarios';
import LoginPage from '@/app/pages/Login';

function AppContent() {
  const location = useLocation(); 

  const showSidebar = location.pathname !== '/login';

  return (
    <div style={{ display: 'flex' }}>
      {showSidebar && <Sidebar />} 
      <div style={{ marginLeft: showSidebar ? '250px' : '0', padding: '20px', width: '100%' }}>
        <Routes>
          <Route path="/pedidos" element={<PedidosPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/produtos" element={<ProdutosPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
