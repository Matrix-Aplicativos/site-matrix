"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/app/img/Logo.png";
import "./RedefinirSenha.css";

export default function RedefinirSenhaPage() {
  return (
    <div className="password-reset-container">
      <div className="password-reset-content">
        <div className="password-reset-logo">
          <Image src={Logo} alt="Logo" width={180} height={150} priority />
        </div>

        <h5 className="password-reset-heading">Redefinição de Senha</h5>

        <p className="password-reset-instructions">
          Digite o token enviado no seu e-mail:
        </p>

        <div className="token-input-container">
          {[...Array(6)].map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength={1} 
              className="token-input-box"
              inputMode="numeric"
            />
          ))}
        </div>

        <form className="password-reset-form">
          <div className="password-reset-input-field">
            <input
              id="nova-senha"
              type="password"
              className="validate"
              placeholder="Digite sua nova senha"
            />
            <label htmlFor="nova-senha">Nova Senha</label>
          </div>
          <div className="password-reset-input-field">
            <input
              id="confirmar-senha"
              type="password"
              className="validate"
              placeholder="Confirme sua senha"
            />
            <label htmlFor="confirmar-senha">Confirme sua senha</label>
          </div>
          <button type="submit" className="password-reset-button">
            ALTERAR
          </button>
        </form>
      </div>

      <footer className="password-reset-footer">
        <Link href="/" className="password-reset-back-button">
          Voltar ao site
        </Link>
        <p>© {new Date().getFullYear()} Todos direitos reservados</p>
      </footer>
    </div>
  );
}
