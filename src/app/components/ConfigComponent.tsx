import React, { useState } from 'react';
import styles from './ConfigComponent.module.css';

const ConfigComponent = () => {
  const [maxDevices, setMaxDevices] = useState(3);
  const [allowSalesWithDebts, setAllowSalesWithDebts] = useState(false);
  const [allowSalesWithInsufficientLimit, setAllowSalesWithInsufficientLimit] = useState(false);

  return (
    <div className={styles.container}>
      <h2>Configurações</h2>

      <div className={styles.fieldGroup}>
        <label htmlFor="maxDevices" className={styles.label}>Máximo de Dispositivos por usuário</label>
        <input
          id="maxDevices"
          type="number"
          value={maxDevices}
          onChange={(e) => setMaxDevices(Number(e.target.value))}
          className={styles.input}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="allowSalesWithDebts" className={styles.label}>Permitir venda para clientes com débitos em atraso</label>
        <label className={styles.switch}>
          <input
            id="allowSalesWithDebts"
            type="checkbox"
            checked={allowSalesWithDebts}
            onChange={(e) => setAllowSalesWithDebts(e.target.checked)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="allowSalesWithInsufficientLimit" className={styles.label}>Permitir venda para cliente com limite insuficiente</label>
        <label className={styles.switch}>
          <input
            id="allowSalesWithInsufficientLimit"
            type="checkbox"
            checked={allowSalesWithInsufficientLimit}
            onChange={(e) => setAllowSalesWithInsufficientLimit(e.target.checked)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>
    </div>
  );
};

export default ConfigComponent;
