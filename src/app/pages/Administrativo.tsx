import React from 'react';
import NewUser from '../components/NewUser';
import styles from './Administrativo.module.css';

const AdmPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Administração</h1>
      <div className={styles.formContainer}>
        <NewUser />
      </div>
    </div>
  );
};

export default AdmPage;
