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
  const [forcaSenha, setForcaSenha] = useState(0);
  const router = useRouter();

  const handleDefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forcaSenha >= 2) {
      const data = await definirPrimeiraSenhaUsuario({ login, senha });
      setTextoIdentificacao(
        data?.status === 200
          ? "Senha definida com sucesso"
          : "Ocorreu um erro ao definir a senha"
      );
      setTipoMensagem(data?.status === 200 ? "sucesso" : "erro");
      setDefinirPrimeiraSenha(false);
      setSenha("");
    } else {
      setTextoIdentificacao(
        "Sua senha está muito fraca, tente uma senha mais forte"
      );
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
      if (resp) {
        setTextoIdentificacao(
          "Vá para seu email para prosseguir com a redefinição"
        );
        setTipoMensagem("sucesso");

        // Reseta mensagem depois de 3 segundos
        setTimeout(() => {
          setTextoIdentificacao("");
          setTipoMensagem("");
          setModoEsqueciSenha(false);
        }, 3000);
      } else {
        setTextoIdentificacao("Erro ao solicitar redefinição de senha");
        setTipoMensagem("erro");
      }
      return;
    }

    const tokenObtido = await loginUsuario({ login, senha });
    if (tokenObtido) {
      try {
        const response = await axiosInstance.get(
          "/usuario/" + getUserFromToken(tokenObtido)
        );
        const usuario: Usuario = response.data;

        const codTipo = usuario.tipoUsuario?.codTipoUsuario;
        if (codTipo !== 1 && codTipo !== 5) {
          setError(
            "Acesso negado. Seu perfil de usuário não tem permissão para acessar o painel."
          );
          return;
        }

        if (usuario.primeiroAcesso) {
          setDefinirPrimeiraSenha(true);
          setSenha("");
          setTextoIdentificacao("Defina sua senha");
        } else {
          router.push("/Painel-Coletas");
        }
      } catch (err) {
        setError("Erro ao validar o tipo de usuário.");
      }
    }
  };

  const verificarForcaSenha = () => {
    let pontuacao = 0;
    if (senha.length >= 8) pontuacao++;
    if (/[A-Z]/.test(senha)) pontuacao++;
    if (/[a-z]/.test(senha)) pontuacao++;
    if (/\d/.test(senha)) pontuacao++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(senha)) pontuacao++;

    if (pontuacao === 0) return 0;
    if (pontuacao <= 2) return 1;
    if (pontuacao === 3) return 2;
    return 3;
  };

  return (
    <div className="container">
      <div className="content">
        <div className="logo-container">
          <Image src={Logo} alt="Logo" width={220} height={200} priority />
        </div>

        <h5 className="heading">Área do Cliente</h5>

        <form
          className="login-form"
          onSubmit={(event: React.FormEvent) => {
            if (definirPrimeiraSenha) {
              handleDefinirSenha(event);
            } else {
              handleSubmit(event);
            }
          }}
        >
          {/* Campo de login sempre aparece */}
          <div className="input-field">
            <input
              disabled={definirPrimeiraSenha}
              id="login"
              type="text"
              className="validate"
              placeholder="Digite seu login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
            <label htmlFor="login">Login</label>
          </div>

          {/* Modo Login normal */}
          {!modoEsqueciSenha && !definirPrimeiraSenha && (
            <div className="input-field">
              <input
                id="senha"
                type="password"
                className="validate"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  if (definirPrimeiraSenha)
                    setForcaSenha(verificarForcaSenha());
                }}
              />
              <label htmlFor="senha">Senha</label>

              <p
                style={{
                  color: "#007bff",
                  cursor: "pointer",
                  marginTop: "5px",
                }}
                onClick={() => {
                  setModoEsqueciSenha(true);
                  setTextoIdentificacao("");
                }}
              >
                Esqueceu sua senha?
              </p>
            </div>
          )}

          {/* Mensagem acima do botão */}
          {textoIdentificacao && (
            <p
              style={{
                textAlign: "center",
                margin: "10px 0",
                color: tipoMensagem === "sucesso" ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              {textoIdentificacao}
            </p>
          )}

          {/* Barra de força da senha */}
          {definirPrimeiraSenha && (
            <>
              <div
                style={{
                  backgroundColor:
                    forcaSenha >= 3
                      ? "green"
                      : forcaSenha >= 2
                      ? "orange"
                      : "red",
                  width: `${forcaSenha * 33.3333}%`,
                }}
                className="forca-senha"
              ></div>
              <p
                style={{
                  color:
                    forcaSenha >= 3
                      ? "green"
                      : forcaSenha >= 2
                      ? "orange"
                      : "red",
                }}
                className="texto-forca-senha"
              >
                {forcaSenha >= 3
                  ? "Forte"
                  : forcaSenha >= 2
                  ? "Moderado"
                  : "Fraco"}
              </p>
            </>
          )}

          {/* Botões */}
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button type="submit" className="action-button enviar" disabled={loading}>
              {loading
                ? "Processando..."
                : modoEsqueciSenha
                ? "Enviar"
                : definirPrimeiraSenha
                ? "Definir Senha"
                : "Entrar"}
            </button>

            {modoEsqueciSenha && (
              <button
                type="button"
                className="action-button voltar"
                onClick={() => {
                  setModoEsqueciSenha(false);
                  setTextoIdentificacao("");
                  setTipoMensagem("");
                }}
              >
                Voltar
              </button>
            )}

            {definirPrimeiraSenha && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setLogin("");
                  setDefinirPrimeiraSenha(false);
                  setTextoIdentificacao("");
                  setSenha("");
                }}
                className="voltar-button"
                disabled={loading}
              >
                Voltar
              </button>
            )}
          </div>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}
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

function setError(msg: string) {
  alert(msg);
}
