"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "@/app/img/Logo.png";
import "./Login.css";
import useLogin from "../hooks/useLogin";
import Link from "next/link";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import { Usuario } from "../utils/types/Usuario";

export default function LoginPage() {
  const { loginUsuario, loading, error, definirPrimeiraSenhaUsuario } =
    useLogin();
  const [codUsuario, setCodUsuario] = useState<Number | 0>(0);
  const [definirPrimeiraSenha, setDefinirPrimeiraSenha] = useState(false);
  const [login, setLogin] = useState("");
  const [textoIdentificacao, setTextoIdentificacao] = useState("");
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
      setDefinirPrimeiraSenha(false);
      setSenha("");
    } else {
      setTextoIdentificacao(
        "Sua senha está muito fraca, tente uma senha mais forte"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          router.push("/Painel-FDV");
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
    if (pontuacao === 0) return 0; // Muito Fraco
    if (pontuacao <= 2) return 1; // Fraco
    if (pontuacao === 3) return 2; // Moderado
    else return 3; // Forte
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
            } else handleSubmit(event);
          }}
        >
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

          <div className="input-field">
            <input
              id="senha"
              type="password"
              className="validate"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                if (definirPrimeiraSenha) setForcaSenha(verificarForcaSenha());
              }}
            />
            <label htmlFor="senha">Senha</label>
            {definirPrimeiraSenha ? (
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
            ) : null}
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading
              ? "Entrando..."
              : definirPrimeiraSenha
              ? "Definir Senha"
              : "Entrar"}
          </button>
          {definirPrimeiraSenha ? (
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
          ) : null}
        </form>
        <p style={{ maxWidth: 270 }}>{textoIdentificacao}</p>
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
function setError(arg0: string) {
  alert("Esse tipo de usuário nao tem acesso ao painel.");
}

