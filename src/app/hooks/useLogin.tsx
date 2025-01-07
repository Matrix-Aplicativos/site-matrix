import { useState } from "react";
import axiosInstance from "./axiosInstance";
import {setCookie} from 'cookies-next';
import { AxiosError } from "axios";

interface LoginCredenciais {
  login: string;
  senha: string;
}



interface UseLoginHook {
  loginUsuario: (credenciais: LoginCredenciais) => Promise<string | null>;
  identificarUsuario: (login: String) => Promise<Number | null>;
  definirPrimeiraSenhaUsuario(credenciais: LoginCredenciais) : Promise<string | null>;
  loading: boolean;
  error: string | null;
  token: string | null;
  refreshToken : string | null;
  codUsuario : Number | null;
  statusIdentificacao : Number | null;
}

const useLogin = (): UseLoginHook => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken,setRefreshToken] = useState<string | null>(null);
  const [statusIdentificacao,setStatusIdentificacao] = useState<Number | null>(null);
  const [codUsuario,setCodUsuario] = useState<Number | null>(null);


  const loginUsuario = async (credenciais: LoginCredenciais): Promise<string | null> => {
    setLoading(true);
    setError(null);
    setToken(null);

    try {
      const response = await axiosInstance.post("/auth/login/autenticacao", credenciais);
      const { token,refreshToken,codUsuario } = response.data; 
      setToken(token);
      setRefreshToken(refreshToken);
      setCodUsuario(codUsuario);
      setCookie("token", token, { maxAge :60*10, secure: process.env.NODE_ENV === "production" });
      setCookie("refreshToken", refreshToken, { maxAge: 60*60, secure: process.env.NODE_ENV === "production" });

      console.log("Logou")
      return token;
    } catch (err) {
      console.log(err)
      setError(
        err instanceof AxiosError ? err.response?.data.message : "Ocorreu um erro ao realizar o login."
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const identificarUsuario = async (login: String): Promise<Number | null> => {
    setLoading(true);
    setError(null);
    setStatusIdentificacao(null);
    setCodUsuario(null);
    try {
      const response = await axiosInstance.post("/auth/login/identificacao", {login});
        const status = response.data;
        setStatusIdentificacao(status);
      return status;

    } catch (err){
      setError(err instanceof AxiosError ? err.response?.data.message : "Ocorreu um erro ao realizar o login"); 
      return null;
    } finally {
      setLoading(false);
    }
  }

  const definirPrimeiraSenhaUsuario = async (credenciais: LoginCredenciais): Promise<string | null> => {
    setLoading(true);
    setError(null);
    setStatusIdentificacao(null);
    setCodUsuario(null);
    try{
      const response = await axiosInstance.post("/auth/definir-senha", {login: credenciais.login,senha: credenciais.senha});
      if(response.status === 200){
      return response.data;
      }
      return null;
    }catch(err){
      setError("Ocorreu um erro ao definir a senha.");
      return null;
    }finally{
      setLoading(false);
    }
  }

  return { 
    loginUsuario,
    identificarUsuario,
    definirPrimeiraSenhaUsuario,
    loading,
    error,
    token,
    refreshToken,
    codUsuario,
    statusIdentificacao
  };
};

export default useLogin;