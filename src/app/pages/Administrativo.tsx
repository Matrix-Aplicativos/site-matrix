import React from 'react';
import styles from './Administrativo.module.css';
import ConfigComponent from '../components/ConfigComponent';
import UserComponent from '../components/UserComponent';

const AdmPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ADMINISTRATIVO</h1>
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
