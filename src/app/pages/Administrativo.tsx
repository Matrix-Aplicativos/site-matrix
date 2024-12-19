import React from 'react';
import styles from './Administrativo.module.css';
import ConfigComponent from '../components/ConfigComponent';

const AdmPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Administrativo</h1>
      <ConfigComponent />
    </div>
  );
};

export default AdmPage;
