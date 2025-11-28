import React, { useState, useEffect, useMemo } from "react";
import styles from "./ModalPermissoes.module.css";
import { UsuarioGet } from "../utils/types/UsuarioGet";
import useGetUsuarioById from "../hooks/useGetUsuarioById";
import useGetCargos from "../hooks/useGetCargos";
import useUpdateUsuarioCargos from "../hooks/useUpdateUsuarioCargos";

const GESTOR_ROLE = "ROLE_MOVIX_GESTOR";
const FUNCIONARIO_ROLE = "ROLE_MOVIX_FUNCIONARIO";

const MOVIX_ROLES = [
  "ROLE_MOVIX_INVENTARIO",
  "ROLE_MOVIX_TRANSFERENCIA",
  "ROLE_MOVIX_CONF_COMPRA",
  "ROLE_MOVIX_CONF_VENDA",
  "ROLE_MOVIX_AJUSTE_ENTRADA",
  "ROLE_MOVIX_AJUSTE_SAIDA",
  "ROLE_MOVIX_CADASTRAR_AVULSA",
  "ROLE_MOVIX_CADASTRAR_DEMANDA",
  "ROLE_MOVIX_FINALIZAR_COLETA",
];

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioInfo: UsuarioGet;
  onSave: () => void;
  codUsuarioLogado: number; 
}

const PERMISSION_DISPLAY_MAP = [
  {
    title: "Acessos Gerais",
    permissions: [
      { key: GESTOR_ROLE, description: "Acesso ao Painel Web" },
      {
        key: FUNCIONARIO_ROLE,
        description: "Acesso ao App",
      },
    ],
  },
  {
    title: "Acessos MOVIX",
    permissions: MOVIX_ROLES.map((role) => {
      const descriptions: { [key: string]: string } = {
        ROLE_MOVIX_INVENTARIO: "Visualizar Inventários",
        ROLE_MOVIX_TRANSFERENCIA: "Visualizar Transferências",
        ROLE_MOVIX_CONF_COMPRA: "Visualizar Conferências de Compra",
        ROLE_MOVIX_CONF_VENDA: "Visualizar Conferências de Venda",
        ROLE_MOVIX_AJUSTE_ENTRADA: "Visualizar Ajuste de Entrada",
        ROLE_MOVIX_AJUSTE_SAIDA: "Visualizar Ajuste de Saída",
        ROLE_MOVIX_CADASTRAR_AVULSA: "Cadastrar Coleta Avulsa",
        ROLE_MOVIX_CADASTRAR_DEMANDA: "Cadastrar Coleta Sob Demanda",
        ROLE_MOVIX_FINALIZAR_COLETA: "Finalizar Coletas no App",
      };
      return { key: role, description: descriptions[role] || role };
    }),
  },
];

const ModalPermissoes: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  usuarioInfo,
  onSave,
  codUsuarioLogado,
}) => {
  const {
    usuario: fullUser,
    loading: userLoading,
    error: userError,
  } = useGetUsuarioById(isOpen ? usuarioInfo.codUsuario ?? null : null);

  const {
    cargos: availableCargos,
    loading: cargosLoading,
    error: cargosError,
  } = useGetCargos();

  const {
    updateCargos,
    loading: updateLoading,
    error: updateError,
  } = useUpdateUsuarioCargos();

  const [currentPermissions, setCurrentPermissions] = useState<string[]>([]);
  const isFetchingData = userLoading || cargosLoading;
  const fetchError = userError || cargosError;

  useEffect(() => {
    if (fullUser && fullUser.cargos) {
      const userRoles = fullUser.cargos.map((cargo) => cargo.nome);
      setCurrentPermissions(userRoles);
    } else {
      setCurrentPermissions([]);
    }
  }, [fullUser]);

  const categorizedPermissions = useMemo(() => {
    if (!availableCargos || availableCargos.length === 0) return [];
    const availableRoleNames = new Set(availableCargos.map((c) => c.nomeCargo));
    return PERMISSION_DISPLAY_MAP.map((category) => ({
      ...category,
      permissions: category.permissions.filter((p) =>
        availableRoleNames.has(p.key)
      ),
    })).filter((category) => category.permissions.length > 0);
  }, [availableCargos]);

  const cargoNameToIdMap = useMemo(() => {
    const map = new Map<string, number>();
    availableCargos.forEach((cargo) => {
      map.set(cargo.nomeCargo, cargo.codCargo);
    });
    return map;
  }, [availableCargos]);

  const handleCheckboxChange = (permissionKey: string) => {
    setCurrentPermissions((prev) => {
      const isCurrentlyChecked = prev.includes(permissionKey);
      let newPermissions = [...prev];

      if (isCurrentlyChecked) {
        newPermissions = newPermissions.filter((p) => p !== permissionKey);
        if (permissionKey === FUNCIONARIO_ROLE) {
          newPermissions = newPermissions.filter(
            (p) => !MOVIX_ROLES.includes(p)
          );
        }
      } else {
        newPermissions.push(permissionKey);
      }
      return newPermissions;
    });
  };

  const handleSaveClick = async () => {
    if (!usuarioInfo.codUsuario) {
      console.error("ID do usuário é inválido.");
      return;
    }
    const codCargosParaEnviar = currentPermissions
      .map((permissionName) => cargoNameToIdMap.get(permissionName))
      .filter((id): id is number => id !== undefined);

    const success = await updateCargos(
      usuarioInfo.codUsuario,
      codCargosParaEnviar
    );

    if (success) {
      onSave();
    }
  };

  if (!isOpen) return null;

  const renderModalBody = () => {
    if (isFetchingData) {
      return (
        <div className={styles.loadingState}>Carregando permissões...</div>
      );
    }
    if (fetchError) {
      return <div className={styles.errorState}>{fetchError}</div>;
    }
    if (categorizedPermissions.length > 0) {
      const hasAppAccess = currentPermissions.includes(FUNCIONARIO_ROLE);

      return categorizedPermissions.map((category) => (
        <div key={category.title} className={styles.categoryContainer}>
          <h4 className={styles.categoryTitle}>{category.title}</h4>
          <div className={styles.permissionsGrid}>
            {category.permissions.map((permission) => {
              const cannotRemoveSelfGestor =
                permission.key === GESTOR_ROLE &&
                usuarioInfo.codUsuario === codUsuarioLogado &&
                currentPermissions.includes(GESTOR_ROLE);

              const isMovixPermission = MOVIX_ROLES.includes(permission.key);
              const movixPermissionDisabled =
                isMovixPermission && !hasAppAccess;

              const isDisabled =
                cannotRemoveSelfGestor || movixPermissionDisabled;

              return (
                <label
                  key={permission.key}
                  className={`${styles.permissionLabel} ${
                    isDisabled ? styles.disabledLabel : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={currentPermissions.includes(permission.key)}
                    onChange={() => handleCheckboxChange(permission.key)}
                    className={styles.checkbox}
                    disabled={isDisabled}
                  />
                  {permission.description}
                </label>
              );
            })}
          </div>
        </div>
      ));
    }
    return (
      <div className={styles.loadingState}>
        Nenhum cargo disponível para seleção.
      </div>
    );
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
          <div className={styles.footerError}>
            {updateError && <p className={styles.errorText}>{updateError}</p>}
          </div>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancelar
          </button>
          <button
            onClick={handleSaveClick}
            className={styles.saveButton}
            disabled={isFetchingData || updateLoading || !!fetchError}
          >
            {updateLoading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPermissoes;
