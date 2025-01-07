'use client'; 

import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import styles from "./NewUser.module.css";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import useNovoUsuario from "../hooks/useNovoUsuario";

export default function NewUser({ closeModal} : {closeModal : ()=>void}) {
  const token = getCookie("token");
  const codCurrentUser = getUserFromToken(String(token));
  const {usuario} = useGetLoggedUser(codCurrentUser || 0);
  const {createNovoUsuario} = useNovoUsuario();
  const [formData, setFormData] = useState({
    nome: "",
    cnpjcpf: "",
    login: "",
    email: "",
    codEmpresas : [0],
    codCargo : 3
  });

  const handleChange = (e : any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e : FormEvent) => {
    e.preventDefault();
    console.log("Novo usuário criado:", {...formData,codEmpresas: [usuario?.empresas[0].codEmpresa]});
    createNovoUsuario({...formData,codEmpresas: [usuario?.empresas[0].codEmpresa || 0]})
    closeModal();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Criar Novo Usuário</h2>
          <button onClick={closeModal} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="nome" className={styles.label}>
              Nome
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="cnpjcpf" className={styles.label}>
              CPF
            </label>
            <input
              type="text"
              id="cnpjcpf"
              name="cnpjcpf"
              value={formData.cnpjcpf}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="login" className={styles.label}>
              Login
            </label>
            <input
              type="text"
              id="login"
              name="login"
              value={formData.login}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="cargo" className={styles.label}>
                  <p>Tipo de Usuário:</p>
                  <select value={formData.codCargo} onChange={(e) => {setFormData({ ...formData, codCargo: Number(e.target.value) })}}>
                    <option value="3">Representante</option>
                    <option value="4">Loja</option>
                  </select>
              </label>
            </div>
          <button type="submit" className={styles.button}>
            Criar Usuário
          </button>
        </form>
      </div>
    </div>
  );
}
