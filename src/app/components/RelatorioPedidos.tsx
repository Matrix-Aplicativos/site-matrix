"use client";

import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RelatorioPedidos() {
  const [view, setView] = useState('mensal');

  // Dados para o gráfico diário (mensal)
  const dataMensal = {
    labels: Array.from({ length: 31 }, (_, i) => `Dia ${i + 1}`),
    datasets: [
      {
        label: 'Pedidos Diários',
        data: [12, 14, 15, 20, 18, 22, 25, 19, 23, 24, 20, 18, 17, 21, 25, 26, 28, 30, 29, 24, 22, 20, 18, 16, 17, 15, 14, 13, 18, 19, 20],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Dados para o gráfico mensal (anual)
  const dataAnual = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Pedidos Mensais',
        data: [120, 100, 140, 180, 90, 130, 150, 170, 200, 210, 190, 180],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Opções de configuração
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Relatório de Pedidos' },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ padding: '20px 0', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '0 20px',
        }}
      >
        <h2>Relatório de Pedidos</h2>
        <div>
          <button
            style={{
              marginRight: '10px',
              padding: '5px 10px',
              background: view === 'mensal' ? '#007BFF' : '#FFF',
              color: view === 'mensal' ? '#FFF' : '#007BFF',
              border: '1px solid #007BFF',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={() => setView('mensal')}
          >
            Mensal
          </button>
          <button
            style={{
              padding: '5px 10px',
              background: view === 'anual' ? '#007BFF' : '#FFF',
              color: view === 'anual' ? '#FFF' : '#007BFF',
              border: '1px solid #007BFF',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={() => setView('anual')}
          >
            Anual
          </button>
        </div>
      </div>
      <div
        style={{
          height: '250px',
          width: '95%',
          margin: '0 auto',
        }}
      >
        {view === 'mensal' ? (
          <Bar data={dataMensal} options={options} />
        ) : (
          <Bar data={dataAnual} options={options} />
        )}
      </div>
    </div>
  );
}
