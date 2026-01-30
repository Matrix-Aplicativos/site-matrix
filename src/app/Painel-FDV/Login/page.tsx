"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import Logo from "@/app/img/Logo.png";
import "./Login.css";

import useLogin from "../hooks/useLogin";
import useGetCargosPorUsuario from "../hooks/useGetCargosPorUsuario";

import { getUserFromToken } from "../utils/functions/getUserFromToken";
import axiosInstance from "../../shared/axios/axiosInstanceFDV"; 
import { Usuario } from "../utils/types/Usuario";

export default function LoginPage() {
  const [definirPrimeiraSenha, setDefinirPrimeiraSenha] = useState(false);
  const [modoEsqueciSenha, setModoEsqueciSenha] = useState(false);
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [textoIdentificacao, setTextoIdentificacao] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<"sucesso" | "erro" | "">("");
  const [forcaSenha, setForcaSenha] = useState(0);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const router = useRouter();

  // Hook de Login
  const {
    loginUsuario,
    loading: loadingLogin,
    error: errorLogin,
    definirPrimeiraSenhaUsuario,
    solicitarRedefinicaoSenha,
  } = useLogin();

  // Hook de Cargos (Igual ao exemplo)
  const {
    getCargos,
    loading: loadingCargos,
    error: errorCargos,
  } = useGetCargosPorUsuario();

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

  const handleDefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha.length > 50) {
      setTextoIdentificacao("A senha não pode ter mais de 50 caracteres.");
      setTipoMensagem("erro");
      return;
    }

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
        "Senha definida com sucesso! Faça login novamente.",
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
            "Solicitação enviada com sucesso! Verifique seu email.",
        );
        setTipoMensagem("sucesso");
        setModoEsqueciSenha(false);
        setLogin("");
      } else if (!resp) {
        setTextoIdentificacao(errorLogin || "Erro ao enviar solicitação");
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
          "Este é o seu primeiro acesso, defina sua nova senha:",
        );
        setTipoMensagem("");
      } else {
        localStorage.setItem("authToken", token);
        try {
          const userId = getUserFromToken(token);
          // Rota do usuário no endpoint FDV (garantindo que pega as empresas vinculadas)
          const response = await axiosInstance.get("/usuario/" + userId);
          const usuario: Usuario = response.data;

          if (!usuario.empresas || usuario.empresas.length === 0) {
            setTextoIdentificacao("Usuário não vinculado a nenhuma empresa.");
            setTipoMensagem("erro");
            return;
          }

          // Lógica IDÊNTICA ao exemplo fornecido
          if (usuario.empresas.length === 1) {
            const empresaUnica = usuario.empresas[0];

            // Busca os cargos especificamente dessa empresa para validar permissão
            const listaCargos = await getCargos(
              userId ? Number(userId) : 0,
              empresaUnica.codEmpresa,
            );

            // Verifica se é Gestor FDV
            const isGestor = listaCargos.some(
              (cargo) => cargo.nome === "ROLE_FDV_GESTOR",
            );

            // Verifica se é Funcionário FDV (para mensagem de erro específica)
            const isFuncionario = listaCargos.some(
              (cargo) => cargo.nome === "ROLE_FDV_FUNCIONARIO",
            );

            if (isGestor) {
              localStorage.setItem(
                "empresaSelecionada",
                JSON.stringify(empresaUnica),
              );
              router.push("/Painel-FDV");
            } else {
              // Feedback específico caso seja apenas funcionário
              if (isFuncionario) {
                setTextoIdentificacao(
                  "Acesso restrito. Utilize o Aplicativo Móvel para acessar.",
                );
              } else {
                setTextoIdentificacao(
                  "Acesso negado. Perfil sem permissão de Gestor nesta empresa.",
                );
              }
              setTipoMensagem("erro");
            }
          } else {
            // Mais de uma empresa: manda para seleção (lá terá validação novamente)
            router.push("/Painel-FDV/SelecionarEmpresa");
          }
        } catch (err) {
          console.error(err);
          setTextoIdentificacao("Erro ao validar os dados do usuário.");
          setTipoMensagem("erro");
        }
      }
    }
  };

  const handleVoltar = () => {
    setModoEsqueciSenha(false);
    setDefinirPrimeiraSenha(false);
    setSenha("");
    setConfirmacaoSenha("");
    setLogin("");
  };

  // Loading unificado
  const isLoading = loadingLogin || loadingCargos;

  return (
    <div className="container">
      <div className="content">
        <div className="logo-container">
          <Image src={Logo} alt="Logo" width={220} height={200} priority />
        </div>

        <h5 className="heading">Área do Cliente FDV</h5>

        <form
          className="login-form"
          onSubmit={definirPrimeiraSenha ? handleDefinirSenha : handleSubmit}
        >
          <div className="input-field">
            <input
              id="login"
              type="text"
              placeholder="Digite seu login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              disabled={definirPrimeiraSenha}
            />
            <label htmlFor="login">Login</label>
          </div>

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
                maxLength={50}
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
                maxLength={50}
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

          {(textoIdentificacao || errorLogin || errorCargos) && (
            <p
              style={{
                textAlign: "center",
                margin: "10px 0",
                color:
                  tipoMensagem === "sucesso" ||
                  (!tipoMensagem && !errorLogin && !errorCargos)
                    ? "green"
                    : "red",
                fontWeight: "bold",
              }}
            >
              {textoIdentificacao || errorLogin || errorCargos}
            </p>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "7px" }}>
            <button
              type="submit"
              className="action-button enviar"
              disabled={isLoading}
            >
              {isLoading
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
                onClick={handleVoltar}
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
