// ./src/app/Painel-Coletas/Funcionarios/components/ModalPermissoes.tsx (CORRIGIDO)

import React, { useState, useEffect } from "react";
import styles from "./ModalPermissoes.module.css";
import { UsuarioGet } from "../utils/types/UsuarioGet"; // ALTERADO: Importa o tipo correto
import useGetUsuarioById from "../hooks/useGetUsuarioById";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioInfo: UsuarioGet; // ALTERADO: Aceita o tipo da lista (summary)
  onSave: (userId: number, permissions: string[]) => void;
}

// Estrutura de dados com as permissões organizadas por categoria (sem alterações)
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
  usuarioInfo,
  onSave,
}) => {
  // Busca os detalhes completos do usuário (incluindo cargos) quando o modal abre
  const {
    usuario: fullUser,
    loading: userLoading,
    error: userError,
  } = useGetUsuarioById(
    // ALTERADO: Lida com codUsuario opcional de forma segura
    isOpen ? usuarioInfo.codUsuario ?? null : null
  );

  const [currentPermissions, setCurrentPermissions] = useState<string[]>([]);

  // Atualiza as permissões selecionadas quando os dados do usuário completo são carregados
  useEffect(() => {
    if (fullUser && fullUser.cargos) {
      const userRoles = fullUser.cargos.map((cargo) => cargo.nome);
      setCurrentPermissions(userRoles);
    } else {
      setCurrentPermissions([]);
    }
  }, [fullUser]);

  const handleCheckboxChange = (permissionKey: string) => {
    setCurrentPermissions((prev) =>
      prev.includes(permissionKey)
        ? prev.filter((p) => p !== permissionKey)
        : [...prev, permissionKey]
    );
  };

  const handleSaveClick = () => {
    // ALTERADO: Adiciona uma verificação para garantir que codUsuario existe antes de salvar
    if (usuarioInfo.codUsuario) {
      onSave(usuarioInfo.codUsuario, currentPermissions);
    } else {
      console.error("Tentativa de salvar permissões sem um codUsuario válido.");
    }
  };

  if (!isOpen) return null;

  // Função para renderizar o conteúdo do corpo do modal (sem alterações)
  const renderModalBody = () => {
    if (userLoading) {
      return (
        <div className={styles.loadingState}>Carregando permissões...</div>
      );
    }
    if (userError) {
      return <div className={styles.errorState}>{userError}</div>;
    }
    if (fullUser) {
      return PERMISSIONS_CATEGORIES.map((category) => (
        <div key={category.title} className={styles.categoryContainer}>
          <h4 className={styles.categoryTitle}>{category.title}</h4>
          <div className={styles.permissionsGrid}>
            {category.permissions.map((permission) => (
              <label key={permission.key} className={styles.permissionLabel}>
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
      ));
    }
    return null;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Gerenciar Permissões de</h3>
          <h2>{usuarioInfo.nome}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>{renderModalBody()}</div>
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancelar
          </button>
          <button
            onClick={handleSaveClick}
            className={styles.saveButton}
            disabled={userLoading || !!userError}
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPermissoes;
