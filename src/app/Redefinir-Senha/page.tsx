"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/app/img/Logo.png";
import "./RedefinirSenha.css";
import useRedefinirSenha from "../shared/useRedefinirSenha";

// Componente de carregamento para o Suspense
const LoadingFallback = () => (
  <div className="password-reset-container">
    <div className="password-reset-content">
      <div className="password-reset-logo">
        <Image src={Logo} alt="Logo" width={180} height={150} priority />
      </div>
      <p>Carregando formulário de redefinição de senha...</p>
    </div>
  </div>
);

// Componente principal que envolve com Suspense
export default function RedefinirSenhaWrapper() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RedefinirSenhaPage />
    </Suspense>
  );
}

// Componente da página de redefinição de senha
function RedefinirSenhaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { redefinirSenha, loading, error } = useRedefinirSenha();

  const token = searchParams.get("token");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [senhaForca, setSenhaForca] = useState(0);
  const [mensagemErro, setMensagemErro] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !token) {
      router.push("/");
    }
  }, [token, router, isMounted]);

  const verificarForcaSenha = (valor: string) => {
    if (valor.length === 0) return 0;
    if (valor.length < 6) return 1; // Fraca
    if (valor.length < 10) return 2; // Moderada
    return 3; // Forte
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      setMensagemErro("As senhas não coincidem!");
      return;
    }

    if (!token) {
      setMensagemErro("Token inválido. Solicite um novo link de redefinição.");
      return;
    }

    const result = await redefinirSenha(senha, token);
    if (result) {
      alert("Senha redefinida com sucesso!");
      router.push("/");
    } else {
      setMensagemErro(error || "Erro ao redefinir senha. Tente novamente.");
    }
  };

  const handleSenhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novaSenha = e.target.value;
    setSenha(novaSenha);
    setSenhaForca(verificarForcaSenha(novaSenha));
    setMensagemErro("");
  };

  return (
    <div className="password-reset-container">
      <div className="password-reset-content">
        <div className="password-reset-logo">
          <Image src={Logo} alt="Logo" width={180} height={150} priority />
        </div>

        <h5 className="password-reset-heading">Redefinição de Senha</h5>

        <p className="password-reset-instructions">
          Digite e confirme sua nova senha abaixo:
        </p>

        <form className="password-reset-form" onSubmit={handleSubmit}>
          <div className="password-reset-input-field">
            <input
              id="nova-senha"
              type="password"
              value={senha}
              onChange={handleSenhaChange}
              placeholder="Digite sua nova senha"
              required
            />
            <label htmlFor="nova-senha">Nova Senha</label>

            {senha && (
              <div
                style={{
                  marginTop: "5px",
                  textAlign: "right",
                  fontSize: "0.8rem",
                  color:
                    senhaForca === 3
                      ? "#4CAF50"
                      : senhaForca === 2
                      ? "#FFC107"
                      : "#F44336",
                }}
              >
                {senhaForca === 3
                  ? "Forte"
                  : senhaForca === 2
                  ? "Moderada"
                  : "Fraca"}
              </div>
            )}
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

          {mensagemErro && (
            <div
              style={{
                color: "#F44336",
                fontSize: "0.9rem",
                marginBottom: "15px",
                textAlign: "center",
              }}
            >
              {mensagemErro}
            </div>
          )}

          <button
            type="submit"
            className="password-reset-button"
            disabled={loading}
          >
            {loading ? "Alterando..." : "ALTERAR SENHA"}
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
