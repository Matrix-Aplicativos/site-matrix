// src/app/layout.tsx
export const metadata = {
  title: 'Minha Aplicação',
  description: 'Projeto com múltiplos painéis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
