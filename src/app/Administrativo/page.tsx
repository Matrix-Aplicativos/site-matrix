'use client'
import React from 'react';
import styles from './Administrativo.module.css';
import ConfigComponent from '../components/ConfigComponent';
import UserComponent from '../components/UserComponent';
import { getCookie } from 'cookies-next';
import useGetLoggedUser from '../hooks/useGetLoggedUser';
import { getUserFromToken } from '../utils/functions/getUserFromToken';

const AdmPage: React.FC = () => {
  const token = getCookie('token');
  const codUsuario = getUserFromToken(String(token));
  const {usuario} = useGetLoggedUser(codUsuario || 0);


  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ADMINISTRATIVO - {usuario?.empresas[0].nomeFantasia.toUpperCase()}</h1>
      <div className={styles.componentsContainer}>
        <div className={styles.component}>
          <UserComponent />
        </div>
        <div className={styles.component}>
          <ConfigComponent />
        </div>
      </div>
    </div>
  );
};

export default AdmPage;
