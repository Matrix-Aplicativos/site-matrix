"use client";

// Adicione o 'useState' na importação do React
import React, { useState } from "react";
import Sidebar from "./components/Sidebar"; // Verifique se o caminho está correto
import { Roboto } from "next/font/google";
import "./painel-globals.css"; // Vamos adicionar os novos estilos aqui
import { usePathname } from "next/navigation";
import { LoadingProvider } from "../shared/Context/LoadingContext";
import LoadingOverlay from "../shared/components/LoadingOverlay";

const roboto = Roboto({ weight: "300", subsets: ["latin"] });

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 1. Adicionando o estado para controlar a sidebar
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const hideSidebar =
    pathname === "/Painel-FDV/Login" ||
    pathname === "/Painel-FDV/Login/" ||
    pathname === "/Painel-FDV/SelecionarEmpresa" ||
    pathname === "/Painel-FDV/RedefinirSenha";

  // 2. Lógica para determinar a classe do 'main'
  let mainClassName = "";
  if (hideSidebar) {
    mainClassName = "content-no-sidebar";
  } else {
    mainClassName = isSidebarOpen ? "content-shifted" : "content-full";
  }

  return (
    <div
      className={`painel-body ${roboto.className}`}
      style={{ display: "flex" }}
    >
      <LoadingProvider>
        {/* 3. Passando as props para o Sidebar */}
        {!hideSidebar && (
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        )}

        {/* 4. Usando className em vez de style para o 'main' */}
        <main className={mainClassName}>{children}</main>

        <LoadingOverlay />
      </LoadingProvider>
    </div>
  );
}
