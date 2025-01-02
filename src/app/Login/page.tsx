'use client'; 

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import Image from 'next/image';
import Logo from '@/app/img/Logo.png';
import './Login.css';
import useLogin from '../hooks/useLogin';
import Link from 'next/link';

export default function LoginPage() {
  const { loginUsuario, loading, error } = useLogin();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tokenObtido = await loginUsuario({ login, senha });

    if (tokenObtido) {
      console.log("Login bem-sucedido! Token:", tokenObtido);
      router.push('/'); // Substitua o navigate('/'); 
    }
  };

  return (
    <div className="container">
      <div className="content">
        <div className="logo-container">
          <Image src={Logo} alt="Logo" width={250} height={220} priority />
        </div>

        <h5 className="heading">Área do Cliente</h5>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-field">
            <input
              id="login"
              type="text"
              className="validate"
              placeholder="Digite seu login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
            <label htmlFor="login">Login</label>
          </div>
          <div className="input-field">
            <input
              id="senha"
              type="password"
              className="validate"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <label htmlFor="senha">Senha</label>
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Entrando...' : 'ENTRAR'}
          </button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      <footer className="footer">
        <Link href="/" className="back-button">
          Voltar ao site
        </Link>
        <p>© 2024 Todos direitos reservados</p>
      </footer>
    </div>
  );
}
