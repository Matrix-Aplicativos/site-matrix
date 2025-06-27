"use client";

import Sidebar from "./components/Sidebar";
import { Roboto } from "next/font/google";
import "./painel-globals.css";
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
  const hideSidebar =
    pathname === "/Painel-Coletas/Login" ||
    pathname === "/Painel-Coletas/RedefinirSenha";

  return (
    <html lang="pt-br">
      <body
        className={`painel-body ${roboto.className}`}
        style={{ display: "flex" }}
      >
        <LoadingProvider>
          {!hideSidebar && <Sidebar />}
          <main
            style={{
              marginLeft: hideSidebar ? "0" : "260px",
              padding: "20px",
              width: "100%",
            }}
          >
            {children}
          </main>
          <LoadingOverlay />
        </LoadingProvider>
      </body>
    </html>
  );
}
