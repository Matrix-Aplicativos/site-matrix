"use client";

import React from "react";
import { useLoading } from "../Context/LoadingContext";
import styles from "./LoadingOverlay.module.css"; 

const LoadingOverlay = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.spinner}></div>
    </div>
  );
};

export default LoadingOverlay;
