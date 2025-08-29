"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/app/img/Logo.png";
import "./RedefinirSenha.css";
import useRedefinirSenha from "../shared/useRedefinirSenha";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // <- ícones de olho

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

export default function RedefinirSenhaWrapper() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RedefinirSenhaPage />
    </Suspense>
  );
}

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
  const [mostrarSenha, setMostrarSenha] = useState(false); // <- olho da senha
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false); // <- olho da confirmação

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !token) router.push("/");
  }, [token, router, isMounted]);

  const verificarForcaSenha = (valor: string) => {
    if (valor.length < 6) return 1;
    let forca = 0;
    if (/[A-Z]/.test(valor)) forca++;
    if (/[a-z]/.test(valor)) forca++;
    if (/[0-9]/.test(valor)) forca++;
    if (/[^A-Za-z0-9]/.test(valor)) forca++;
    if (forca <= 1) return 1;
    if (forca === 2 || forca === 3) return 2;
    return 3;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmarSenha) {
      setMensagemErro("As senhas não coincidem!");
      return;
    }
    if (senhaForca < 2 || senha.length < 6) {
      setMensagemErro(
        "A senha deve ser moderada ou forte e ter no mínimo 6 caracteres."
      );
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
          <div className="password-reset-input-field senha-container">
            <input
              id="nova-senha"
              type={mostrarSenha ? "text" : "password"} // <- alterna
              value={senha}
              onChange={handleSenhaChange}
              placeholder="Digite sua nova senha"
              required
            />
            <label htmlFor="nova-senha">Nova Senha</label>
            <span
              className="eye-icon"
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {senha && (
            <div style={{width:'100%',flexDirection:'column',height:32,display: "flex",justifyContent:'flex-start',alignItems:'flex-start'}}>
              <div
                style={{
                  marginTop: "-30px",
                  textAlign: "right",
                  fontSize: "0.1rem",
                  height: '5px',
                  transition: "width 0.3s ease-in-out, background-color 0.3s ease-in-out",
                  width: `${senhaForca * 33.3333}%`,
                  userSelect: 'none',
                  borderRadius: 5,
                  backgroundColor: senhaForca === 3
                      ? "#4CAF50"
                      : senhaForca === 2
                      ? "#FFC107"
                      : "#F44336",
                  color:
                    senhaForca === 3
                      ? "#4CAF50"
                      : senhaForca === 2
                      ? "#FFC107"
                      : "#F44336",
                }}
              >
                Barra
              </div>
              <span style={{color:senhaForca === 3
                      ? "#4CAF50"
                      : senhaForca === 2
                      ? "#FFC107"
                      : "#F44336",
                      fontSize: '0.9em'}}>
                {senhaForca === 3
              ? "Forte"
              : senhaForca === 2
              ? "Moderada"
              : "Fraca"}
              </span>
              </div>
            )}

          <div className="password-reset-input-field senha-container">
            <input
              id="confirmar-senha"
              type={mostrarConfirmar ? "text" : "password"} // <- alterna
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Confirme sua senha"
              required
            />
            <label htmlFor="confirmar-senha">Confirme sua senha</label>
            <span
              className="eye-icon"
              onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
            >
              {mostrarConfirmar ? <FaEyeSlash /> : <FaEye />}
            </span>
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
