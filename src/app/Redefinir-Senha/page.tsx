"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/app/img/Logo.png";
import "./RedefinirSenha.css";
import useLogin from "../shared/useLogin";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { redefinirSenha, loading, error } = useLogin();

  const token = searchParams.get("token");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

    useEffect(() => {
    // Se não tiver token, redireciona para home
    if (!token) {
      router.push("/");
    }
  }, [token, router]); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    if (!token) return; // Garantia extra

    const result = await redefinirSenha(senha, token);
    if (result) {
      alert("Senha redefinida com sucesso!");
      router.push("/");
    }
  };

  return (
    <div className="password-reset-container">
      <div className="password-reset-content">
        <div className="password-reset-logo">
          <Image src={Logo} alt="Logo" width={180} height={150} priority />
        </div>

        <h5 className="password-reset-heading">Redefinição de Senha</h5>

        <p className="password-reset-instructions">
          Digite a sua nova senha abaixo:
        </p>

        <form className="password-reset-form" onSubmit={handleSubmit}>
          <div className="password-reset-input-field">
            <input
              id="nova-senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua nova senha"
              required
            />
            <label htmlFor="nova-senha">Nova Senha</label>
          </div>
          <div className="password-reset-input-field">
            <input
              id="confirmar-senha"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Confirme sua senha"
              required
            />
            <label htmlFor="confirmar-senha">Confirme sua senha</label>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button
            type="submit"
            className="password-reset-button"
            disabled={loading}
          >
            {loading ? "Alterando..." : "ALTERAR"}
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
