"use client";

import Sidebar from "../Painel-FDV/components/Sidebar";
import { Roboto } from "next/font/google";
import "./globals.css";
import { usePathname } from "next/navigation";
import { LoadingProvider } from "../shared/Context/LoadingContext";
import LoadingOverlay from "../shared/components/LoadingOverlay";

const roboto = Roboto({ weight: "300", subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideSidebar =
    pathname?.includes("/Painel-FDV/Login") ||
    pathname?.includes("/Painel-FDV/RedefinirSenha");

  return (
    <html lang="en">
      <body style={{ display: "flex" }} className={roboto.className}>
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
