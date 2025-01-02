"use client";

import Sidebar from './components/Sidebar';
import './globals.css';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideSidebar = pathname === '/Login' || pathname === '/RedefinirSenha';

  return (
    <html lang="en">
      <body style={{ display: 'flex' }}>
        {!hideSidebar && <Sidebar />}
        <main
          style={{
            marginLeft: hideSidebar ? '0' : '250px',
            padding: '20px',
            width: '100%',
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
