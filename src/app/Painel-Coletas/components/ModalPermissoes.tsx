import React, { useState, useEffect } from "react";
import styles from "./ModalPermissoes.module.css";
import { Usuario } from "../utils/types/Usuario";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario;
  onSave: (userId: number, permissions: string[]) => void;
}

// --- ESTRUTURA DE DADOS ATUALIZADA PARA CATEGORIAS ---
const PERMISSIONS_CATEGORIES = [
  {
    title: "Acessos Gerais",
    permissions: [
      {
        key: "ROLE_MOVIX_GESTOR",
        description: "Acesso de Gestor (App e Painel Web)",
      },
      {
        key: "ROLE_MOVIX_FUNCIONARIO",
        description: "Acesso de Funcionário (Apenas App)",
      },
    ],
  },
  {
    title: "Módulos MOVIX",
    permissions: [
      { key: "ROLE_MOVIX_INVENTARIO", description: "Visualizar Inventários" },
      {
        key: "ROLE_MOVIX_TRANSFERENCIA",
        description: "Visualizar Transferências",
      },
      {
        key: "ROLE_MOVIX_CONF_COMPRA",
        description: "Visualizar Conferências de Compra",
      },
      {
        key: "ROLE_MOVIX_CONF_VENDA",
        description: "Visualizar Conferências de Venda",
      },
      {
        key: "ROLE_MOVIX_CADASTRAR_AVULSA",
        description: "Cadastrar Coleta Avulsa",
      },
      {
        key: "ROLE_MOVIX_CADASTRAR_DEMANDA",
        description: "Cadastrar Coleta Sob Demanda",
      },
    ],
  },
];

const ModalPermissoes: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  usuario,
  onSave,
}) => {
  const [currentPermissions, setCurrentPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (usuario && usuario.cargos) {
      const userRoles = usuario.cargos.map((cargo) => cargo.nome);
      setCurrentPermissions(userRoles);
    } else {
      setCurrentPermissions([]);
    }
  }, [usuario]);

  const handleCheckboxChange = (permissionKey: string) => {
    setCurrentPermissions((prev) =>
      prev.includes(permissionKey)
        ? prev.filter((p) => p !== permissionKey)
        : [...prev, permissionKey]
    );
  };

  const handleSaveClick = () => {
    onSave(usuario.codUsuario, currentPermissions);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Gerenciar Permissões de</h3>
          <h2>{usuario.nome}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          {/* --- RENDERIZAÇÃO BASEADA EM CATEGORIAS --- */}
          {PERMISSIONS_CATEGORIES.map((category) => (
            <div key={category.title} className={styles.categoryContainer}>
              <h4 className={styles.categoryTitle}>{category.title}</h4>
              <div className={styles.permissionsGrid}>
                {category.permissions.map((permission) => (
                  <label
                    key={permission.key}
                    className={styles.permissionLabel}
                  >
                    <input
                      type="checkbox"
                      checked={currentPermissions.includes(permission.key)}
                      onChange={() => handleCheckboxChange(permission.key)}
                      className={styles.checkbox}
                    />
                    {permission.description}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancelar
          </button>
          <button onClick={handleSaveClick} className={styles.saveButton}>
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPermissoes;
