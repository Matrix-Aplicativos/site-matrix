'use client'; 

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import Image from 'next/image';
import Logo from '@/app/img/Logo.png';
import './Login.css';
import useLogin from '../hooks/useLogin';
import Link from 'next/link';
import { getCookie } from 'cookies-next';


export default function LoginPage() {
  const { loginUsuario,identificarUsuario, loading, error,definirPrimeiraSenhaUsuario} = useLogin();
  const [login, setLogin] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [textoIdentificacao, setTextoIdentificacao] = useState('');
  const [status, setStatus] = useState<Number>(0);
  const [senha, setSenha] = useState('');
  const [forcaSenha,setForcaSenha] = useState(0);
  const router = useRouter();


  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getCookie('token');
    if(token){
      router.push('/');
    }
    const status = await identificarUsuario(login);
    if(status === 1 || status === 2){
      setShowPasswordInput(true);
      setStatus(status);
    }
    if(status === 2){
      setTextoIdentificacao("Este é seu primeiro acesso, defina sua senha antes de continuar")
    }
  };

  const handleDefinirSenha = async (e: React.FormEvent)=>{
    e.preventDefault();


    if(forcaSenha >= 2){
    const message = await definirPrimeiraSenhaUsuario({login,senha});
    setTextoIdentificacao(message!);
    setShowPasswordInput(false);
    setSenha("");
    setStatus(0);
    }else{
      setTextoIdentificacao("Sua senha está muito fraca, tente uma senha mais forte");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tokenObtido = await loginUsuario({ login, senha });

    if (tokenObtido) {
      console.log("Login bem-sucedido! Token:", tokenObtido);
      router.push('/'); 
    }
  };

  const verificarForcaSenha = ()=>{
    let pontuacao = 0;
    if (senha.length >= 8) pontuacao++;

    if (/[A-Z]/.test(senha)) pontuacao++;

    if (/[a-z]/.test(senha)) pontuacao++;

    if (/\d/.test(senha))pontuacao++;

    if (/[!@#$%^&*(),.?":{}|<>]/.test(senha)) pontuacao++;
    console.log(pontuacao);
    if (pontuacao === 0) return 0; // Muito Fraco
    if (pontuacao <= 2) return 1; // Fraco
    if (pontuacao === 3) return 2; // Moderado
    else return 3;  // Forte
  }

  return (
    <div className="container">
      <div className="content">
        <div className="logo-container">
          <Image src={Logo} alt="Logo" width={250} height={220} priority />
        </div>

        <h5 className="heading">Área do Cliente</h5>
        <form className="login-form" onSubmit={(event : React.FormEvent)=>{
          if(status === 2){
              handleDefinirSenha(event);
          }else{
          if(showPasswordInput){
            handleSubmit(event);
          } else {
            handleIdentify(event);
          }
          }
        }}>
          <div className="input-field">
            <input
              disabled={showPasswordInput}
              id="login"
              type="text"
              className="validate"
              placeholder="Digite seu login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
            <label htmlFor="login">Login</label>
          </div>
          {showPasswordInput ?  (
          <div className="input-field">
            <input
              id="senha"
              type="password"
              className="validate"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value)
                if(status == 2)
                  setForcaSenha(verificarForcaSenha());
                }}
            />
            <label htmlFor="senha">Senha</label>
            {
              status === 2 ? (
                <>
                <div
                style={{backgroundColor: forcaSenha >= 3 ? "green" : forcaSenha >= 2 ? "orange" : "red",
                  width: `${forcaSenha * 33.3333}%`,
                } }
                className="forca-senha">
                </div>
                <p
                style={{color: forcaSenha >= 3 ? "green" : forcaSenha >= 2 ? "orange" : "red"}}
                className='texto-forca-senha'>{forcaSenha >= 3 ? "Forte" : forcaSenha >= 2 ? "Moderado" : "Fraco"}</p>
                </>
              ) : null
            }
          </div>
          ) : null}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Entrando...' : status === 2 ? "Definir Senha" : "Entrar"}
          </button>
          {showPasswordInput ? (
          <button onClick={(e)=>{e.preventDefault();
            setLogin("");
            setShowPasswordInput(false);
            setStatus(0);
            setTextoIdentificacao("");
            }} className="voltar-button" disabled={loading}>Voltar</button>
          ) : null}
            </form>
        <p style={{maxWidth:270}}>{textoIdentificacao}</p>
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
