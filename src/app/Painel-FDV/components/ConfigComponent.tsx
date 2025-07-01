"use client";

import React, { useState } from "react";
import styles from "./ConfigComponent.module.css";

const ConfigComponent = () => {
  const [allowSalesWithDebts, setAllowSalesWithDebts] = useState(false);
  const [allowSalesWithInsufficientLimit, setAllowSalesWithInsufficientLimit] =
    useState(false);
    const [allowProductsNone, setAllowProductsNone] = useState(false);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>DISPOSITIVOS</h3>

      <div className={styles.fieldGroup}>
        <label htmlFor="allowSalesWithDebts" className={styles.label}>
          Permitir venda para clientes com débitos em atraso
        </label>
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
        <label
          htmlFor="allowSalesWithInsufficientLimit"
          className={styles.label}
        >
          Permitir venda para cliente com limite insuficiente
        </label>
        <label className={styles.switch}>
          <input
            id="allowSalesWithInsufficientLimit"
            type="checkbox"
            checked={allowSalesWithInsufficientLimit}
            onChange={(e) =>
              setAllowSalesWithInsufficientLimit(e.target.checked)
            }
          />
          <span className={styles.slider}></span>
        </label>
      </div>
      <div className={styles.fieldGroup}>
        <label
          htmlFor="allowProductsNone"
          className={styles.label}
        >
          Permitir fazer pedido com produtos sem saldo
        </label>
        <label className={styles.switch}>
          <input
            id="allowProductsNone"
            type="checkbox"
            checked={allowProductsNone}
            onChange={(e) =>
              setAllowProductsNone(e.target.checked)
            }
          />
          <span className={styles.slider}></span>
        </label>
      </div>
    </div>
  );
};

export default ConfigComponent;