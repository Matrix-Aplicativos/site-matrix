// src/app/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function Home() {
  const router = useRouter();

  return (
    <div style={{ padding: 40 }}>
      <h1>Escolha um Painel</h1>
      <button onClick={() => router.push('/fdv')}>Painel Força de Vendas</button>
      <button onClick={() => router.push('/coletas')}>Painel Coletas</button>
    </div>
  );
}
