import React from 'react';
import { Link } from 'react-router-dom'; 
import Image from 'next/image';
import Logo from '@/app/img/Logo.png'; 
import './Login.css';

export default function LoginPage() {
  return (
    <div className="container">
      <div className="content">
        <div className="logo-container">
          <Image src={Logo} alt="Logo" width={250} height={220} priority />
        </div>

        <h5 className="heading">Área do Cliente</h5>
        <form className="login-form">
          <div className="input-field">
            <input id="login" type="text" className="validate" placeholder="Digite seu login" />
            <label htmlFor="login">Login</label>
          </div>
          <div className="input-field">
            <input id="senha" type="password" className="validate" placeholder="Digite sua senha" />
            <label htmlFor="senha">Senha</label>
          </div>
          <button type="submit" className="login-button">
            ENTRAR
          </button>
        </form>
      </div>

      <footer className="footer">
        <Link to="/" className="back-button">
          Voltar ao site
        </Link>
        <p>© 2024 Todos direitos reservados</p>
      </footer>
    </div>
  );
}
