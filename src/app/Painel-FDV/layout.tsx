"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import { Roboto } from "next/font/google";
import "./painel-globals.css";
import { usePathname } from "next/navigation";
import { LoadingProvider } from "../shared/Context/LoadingContext";
import LoadingOverlay from "../shared/components/LoadingOverlay";
import { FiMenu } from "react-icons/fi";

const roboto = Roboto({ weight: "300", subsets: ["latin"] });

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const handleMediaChange = (event: MediaQueryListEvent | MediaQueryList) => {
      const mobile = event.matches;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    handleMediaChange(mediaQuery);

    const listener = (event: MediaQueryListEvent) => handleMediaChange(event);
    mediaQuery.addEventListener("change", listener);

    return () => {
      mediaQuery.removeEventListener("change", listener);
    };
  }, []);

  const hideSidebar =
    pathname === "/Painel-FDV/Login" ||
    pathname === "/Painel-FDV/Login/" ||
    pathname === "/Painel-FDV/SelecionarEmpresa" ||
    pathname === "/Painel-FDV/RedefinirSenha";

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
        {!hideSidebar && (
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        )}

        {!hideSidebar && isMobile && !isSidebarOpen && (
          <button
            type="button"
            className="mobile-menu-button"
            onClick={toggleSidebar}
            aria-label="Abrir menu"
          >
            <FiMenu size={22} />
          </button>
        )}

        {!hideSidebar && isMobile && isSidebarOpen && (
          <div className="sidebar-overlay" onClick={toggleSidebar} />
        )}

        <main className={mainClassName}>{children}</main>

        <LoadingOverlay />
      </LoadingProvider>
    </div>
  );
}
