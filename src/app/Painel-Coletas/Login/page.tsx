"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "@/app/img/Logo.png";
import "./Login.css";
import useLogin from "../hooks/useLogin";
import Link from "next/link";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { Usuario } from "../utils/types/Usuario";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const {
    loginUsuario,
    loading,
    error,
    definirPrimeiraSenhaUsuario,
    solicitarRedefinicaoSenha,
  } = useLogin();

  const [definirPrimeiraSenha, setDefinirPrimeiraSenha] = useState(false);
  const [modoEsqueciSenha, setModoEsqueciSenha] = useState(false);
  const [login, setLogin] = useState("");
  const [textoIdentificacao, setTextoIdentificacao] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<"sucesso" | "erro" | "">("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [forcaSenha, setForcaSenha] = useState(0);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!textoIdentificacao) return;
    const timer = setTimeout(() => {
      setTextoIdentificacao("");
      setTipoMensagem("");
    }, 3000);
    return () => clearTimeout(timer);
  }, [textoIdentificacao]);

  useEffect(() => {
    if (!textoIdentificacao) {
      setTextoIdentificacao("");
      setTipoMensagem("");
    }
  }, [modoEsqueciSenha, definirPrimeiraSenha]);

  const handleDefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await definirPrimeiraSenhaUsuario({
      senha,
      confirmacaoSenha,
    });
    if (!data) return;
    if (
      data.status === 200 ||
      data.message?.toLowerCase().includes("sucesso")
    ) {
      setTextoIdentificacao(
        "Senha definida com sucesso! Faça login novamente."
      );
      setTipoMensagem("sucesso");
      setDefinirPrimeiraSenha(false);
      setSenha("");
      setConfirmacaoSenha("");
      setLogin("");
    } else {
      setTextoIdentificacao(data.message || "Erro ao definir senha.");
      setTipoMensagem("erro");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (modoEsqueciSenha) {
      if (!login) {
        setTextoIdentificacao("Digite seu login para continuar");
        setTipoMensagem("erro");
        return;
      }
      const resp = await solicitarRedefinicaoSenha(login);
      if (resp?.success) {
        setTextoIdentificacao(
          resp.message ||
            "Solicitação enviada com sucesso! Verifique seu email."
        );
        setTipoMensagem("sucesso");
        setModoEsqueciSenha(false);
        setLogin("");
      } else if (!resp) {
        setTextoIdentificacao(error || "Erro ao enviar solicitação");
        setTipoMensagem("erro");
      }
      return;
    }

    const loginResult = await loginUsuario({ login, senha });

    if (loginResult) {
      const { token, primeiroAcesso } = loginResult;

      if (primeiroAcesso) {
        setDefinirPrimeiraSenha(true);
        setSenha("");
        setConfirmacaoSenha("");
        setTextoIdentificacao(
          "Este é o seu primeiro acesso, defina sua nova senha:"
        );
        setTipoMensagem("");
      } else {
        try {
          const response = await axiosInstance.get(
            "/usuario/" + getUserFromToken(token)
          );
          const usuario: Usuario = response.data;
          const codTipo = usuario.tipoUsuario?.codTipoUsuario;

          if (codTipo !== 1 && codTipo !== 5) {
            setTextoIdentificacao(
              "Acesso negado. Seu perfil de usuário não tem permissão para acessar o painel."
            );
            setTipoMensagem("erro");
            return;
          }

          // ===== INÍCIO DA LÓGICA DE EMPRESAS =====
          if (!usuario.empresas || usuario.empresas.length === 0) {
            setTextoIdentificacao("Usuário não vinculado a nenhuma empresa.");
            setTipoMensagem("erro");
            return;
          }

          if (usuario.empresas.length === 1) {
            const empresa = usuario.empresas[0];
            localStorage.setItem("empresaSelecionada", JSON.stringify(empresa));
            router.push("/Painel-Coletas");
          } else {
            router.push("/Painel-Coletas/SelecionarEmpresa");
          }
        } catch {
          setTextoIdentificacao("Erro ao validar os dados do usuário.");
          setTipoMensagem("erro");
        }
      }
    }
  };

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

  // O restante do seu componente (o return com o JSX) permanece o mesmo.
  // Cole o código acima e mantenha seu JSX original.

  return (
    <div className="container">
      <div className="content">
        <div className="logo-container">
          <Image src={Logo} alt="Logo" width={220} height={200} priority />
        </div>

        <h5 className="heading">Área do Cliente MOVIX</h5>

        <form
          className="login-form"
          onSubmit={definirPrimeiraSenha ? handleDefinirSenha : handleSubmit}
        >
          {!definirPrimeiraSenha && (
            <div className="input-field">
              <input
                id="login"
                type="text"
                placeholder="Digite seu login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
              <label htmlFor="login">Login</label>
            </div>
          )}

          {!modoEsqueciSenha && (
            <div className="input-field senha-container">
              <input
                id="senha"
                type={mostrarSenha ? "text" : "password"}
                placeholder={
                  definirPrimeiraSenha
                    ? "Digite sua nova senha"
                    : "Digite sua senha"
                }
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  if (definirPrimeiraSenha) {
                    setForcaSenha(verificarForcaSenha(e.target.value));
                  }
                }}
              />
              <label htmlFor="senha">
                {definirPrimeiraSenha ? "Nova Senha" : "Senha"}
              </label>
              <span
                className="eye-icon"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          )}
          {definirPrimeiraSenha && senha && (
            <>
              <div
                style={{
                  height: "5px",
                  borderRadius: "2.5px",
                  marginTop: "-30px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: "2.5px",
                    transition:
                      "width 0.3s ease-in-out, background-color 0.3s ease-in-out",
                    backgroundColor:
                      forcaSenha >= 3
                        ? "green"
                        : forcaSenha >= 2
                        ? "orange"
                        : "red",
                    width: `${forcaSenha * 33.3333}%`,
                  }}
                ></div>
              </div>
              <p
                style={{
                  textAlign: "left",
                  fontSize: "0.8rem",
                  color:
                    forcaSenha >= 3
                      ? "green"
                      : forcaSenha >= 2
                      ? "orange"
                      : "red",
                  marginBottom: "40px",
                }}
              >
                {forcaSenha >= 3
                  ? "Forte"
                  : forcaSenha >= 2
                  ? "Moderado"
                  : "Fraca"}
              </p>
            </>
          )}

          {definirPrimeiraSenha && (
            <div className="input-field senha-container">
              <input
                id="confirmacaoSenha"
                type={mostrarConfirmacao ? "text" : "password"}
                placeholder="Confirme sua nova senha"
                value={confirmacaoSenha}
                onChange={(e) => setConfirmacaoSenha(e.target.value)}
              />
              <label htmlFor="confirmacaoSenha">Confirmar Senha</label>
              <span
                className="eye-icon"
                onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
              >
                {mostrarConfirmacao ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          )}

          {!definirPrimeiraSenha && !modoEsqueciSenha && (
            <p
              style={{
                color: "#007bff",
                cursor: "pointer",
                textAlign: "center",
              }}
              onClick={() => setModoEsqueciSenha(true)}
            >
              Esqueceu sua senha?
            </p>
          )}

          {(textoIdentificacao || error) && (
            <p
              style={{
                textAlign: "center",
                margin: "10px 0",
                color:
                  tipoMensagem === "sucesso" || (!tipoMensagem && !error)
                    ? "green"
                    : "red",
                fontWeight: "bold",
              }}
            >
              {textoIdentificacao || error}
            </p>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "7px" }}>
            <button
              type="submit"
              className="action-button enviar"
              disabled={loading}
            >
              {loading
                ? "Processando..."
                : modoEsqueciSenha
                ? "Enviar"
                : definirPrimeiraSenha
                ? "Definir Senha"
                : "Entrar"}
            </button>
            {(modoEsqueciSenha || definirPrimeiraSenha) && (
              <button
                type="button"
                className="action-button voltar"
                onClick={() => {
                  setModoEsqueciSenha(false);
                  setDefinirPrimeiraSenha(false);
                  setSenha("");
                  setConfirmacaoSenha("");
                  setLogin("");
                }}
              >
                Voltar
              </button>
            )}
          </div>
        </form>
      </div>

      <footer className="footer">
        <Link href="/" className="back-button">
          Voltar ao site
        </Link>
        <p>© {new Date().getFullYear()} Todos direitos reservados</p>
      </footer>
    </div>
  );
}
