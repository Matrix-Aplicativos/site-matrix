import React, { useState, useEffect, useMemo } from "react";
import styles from "./ModalPermissoes.module.css";
import { UsuarioGet } from "../utils/types/UsuarioGet";

import useGetCargosDisponiveis from "../hooks/useGetCargos";
import useGetCargosPorUsuario from "../hooks/useGetCargosPorUsuario";
import useUpdateUsuarioCargos from "../hooks/useUpdateUsuarioCargo";

const GESTOR_ROLE = "ROLE_FDV_GESTOR";
const FUNCIONARIO_ROLE = "ROLE_FDV_FUNCIONARIO";

const FDV_PERMISSIONS_KEYS = [
  "PERM_FDV_REALIZAR_PEDIDO",
  "PERM_FDV_VISUALIZAR_PEDIDOS",
  "PERM_FDV_CADASTRAR_CLIENTES",
  "PERM_FDV_VISUALIZAR_CLIENTES",
  "PERM_FDV_GERENCIAR_USUARIOS",
  "PERM_FDV_GERENCIAR_CONFIGURACOES",
  "PERM_FDV_GERENCIAR_DISPOSITIVOS",
  "PERM_FDV_VISUALIZAR_FORNECEDORES",
  "PERM_FDV_VISUALIZAR_ITENS",
  "PERM_FDV_VISUALIZAR_COND_PAGAMENTO",
  "PERM_FDV_VISUALIZAR_CONFIGURACOES",
  "PERM_FDV_SINCRONIZAR_DADOS_OFFLINE",
];

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioInfo: UsuarioGet;
  onSave: () => void;
  codUsuarioLogado: number;
  codEmpresa: number;
}

const PERMISSION_DISPLAY_MAP = [
  {
    title: "Acessos Gerais",
    permissions: [
      { key: GESTOR_ROLE, description: "Acesso ao Painel Web" },
      { key: FUNCIONARIO_ROLE, description: "Acesso ao App" },
    ],
  },
  {
    title: "Permissões FDV",
    permissions: FDV_PERMISSIONS_KEYS.map((role) => {
      const descriptions: { [key: string]: string } = {
        PERM_FDV_REALIZAR_PEDIDO: "Permite Realizar Pedidos pelo Aplicativo",
        PERM_FDV_VISUALIZAR_PEDIDOS:
          "Permite Visualizar Pedidos no Painel e Aplicativo",
        PERM_FDV_CADASTRAR_CLIENTES: "Permite Cadastrar Clientes",
        PERM_FDV_VISUALIZAR_CLIENTES: "Permite Visualizar Clientes",
        PERM_FDV_GERENCIAR_USUARIOS: "Permite Gerenciar Usuarios do FDV",
        PERM_FDV_GERENCIAR_CONFIGURACOES:
          "Permite Gerenciar Configurações do FDV",
        PERM_FDV_GERENCIAR_DISPOSITIVOS:
          "Permite Gerenciar Dispositivos do FDV",
        PERM_FDV_VISUALIZAR_FORNECEDORES: "Permite Visualizar Fornecedores",
        PERM_FDV_VISUALIZAR_ITENS: "Permite Visualizar Itens",
        PERM_FDV_VISUALIZAR_COND_PAGAMENTO:
          "Permite Visualizar Condições de Pagamento",
        PERM_FDV_VISUALIZAR_CONFIGURACOES:
          "Permite Visualizar Configurações do Aplicativo FDV",
        PERM_FDV_SINCRONIZAR_DADOS_OFFLINE:
          "Permite Sincronizar Dados Offline do Aplicativo FDV",
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
  codEmpresa,
}) => {
  const {
    cargos: availableCargos,
    loading: loadingAvailable,
    error: errorAvailable,
    getCargos: getAvailableCargos,
  } = useGetCargosDisponiveis();

  const {
    cargos: userCargos,
    loading: loadingUserCargos,
    error: errorUserCargos,
    getCargos: getUserCargos,
  } = useGetCargosPorUsuario();

  const {
    updateCargos,
    loading: updateLoading,
    error: updateError,
  } = useUpdateUsuarioCargos();

  const [selectedPermissionKeys, setSelectedPermissionKeys] = useState<
    string[]
  >([]);

  useEffect(() => {
    if (isOpen && usuarioInfo.codUsuario && codEmpresa) {
      getAvailableCargos(codEmpresa);
      getUserCargos(usuarioInfo.codUsuario, codEmpresa);
    } else {
      setSelectedPermissionKeys([]);
    }
  }, [isOpen, usuarioInfo, codEmpresa, getAvailableCargos, getUserCargos]);

  useEffect(() => {
    if (userCargos) {
      const userRoles = userCargos.map((cargo) => cargo.nome);
      setSelectedPermissionKeys(userRoles);
    }
  }, [userCargos]);

  const roleNameToIdMap = useMemo(() => {
    const map = new Map<string, number>();
    availableCargos.forEach((c) => {
      map.set(c.nome, c.codCargo);
    });
    return map;
  }, [availableCargos]);

  const categorizedPermissions = useMemo(() => {
    if (!availableCargos || availableCargos.length === 0) return [];

    const availableRoleNames = new Set(availableCargos.map((c) => c.nome));

    return PERMISSION_DISPLAY_MAP.map((category) => ({
      ...category,
      permissions: category.permissions.filter((p) =>
        availableRoleNames.has(p.key),
      ),
    })).filter((category) => category.permissions.length > 0);
  }, [availableCargos]);

  const handleCheckboxChange = (permissionKey: string) => {
    setSelectedPermissionKeys((prev) => {
      const isCurrentlyChecked = prev.includes(permissionKey);
      let newPermissions = [...prev];

      if (isCurrentlyChecked) {
        newPermissions = newPermissions.filter((p) => p !== permissionKey);
        if (permissionKey === FUNCIONARIO_ROLE) {
          newPermissions = newPermissions.filter(
            (p) => !FDV_PERMISSIONS_KEYS.includes(p),
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

    const chavesVisiveis = new Set<string>();
    categorizedPermissions.forEach((cat) => {
      cat.permissions.forEach((p) => chavesVisiveis.add(p.key));
    });

    const chavesParaEnviar = selectedPermissionKeys.filter((key) =>
      chavesVisiveis.has(key),
    );

    const codCargosParaEnviar = chavesParaEnviar
      .map((roleName) => roleNameToIdMap.get(roleName))
      .filter((id): id is number => id !== undefined);

    console.log("Enviando IDs limpos:", codCargosParaEnviar);

    const success = await updateCargos(
      usuarioInfo.codUsuario,
      codEmpresa,
      codCargosParaEnviar,
    );

    if (success) {
      onSave();
      onClose();
    }
  };

  if (!isOpen) return null;

  const isLoadingData = loadingAvailable || loadingUserCargos;
  const loadError = errorAvailable || errorUserCargos;

  const renderModalBody = () => {
    if (isLoadingData) {
      return (
        <div className={styles.loadingState}>Carregando permissões...</div>
      );
    }
    if (loadError) {
      return <div className={styles.errorState}>{loadError}</div>;
    }

    if (categorizedPermissions.length > 0) {
      const hasAppAccess = selectedPermissionKeys.includes(FUNCIONARIO_ROLE);

      return categorizedPermissions.map((category) => (
        <div key={category.title} className={styles.categoryContainer}>
          <h4 className={styles.categoryTitle}>{category.title}</h4>
          <div className={styles.permissionsGrid}>
            {category.permissions.map((permission) => {
              const cannotRemoveSelfGestor =
                permission.key === GESTOR_ROLE &&
                usuarioInfo.codUsuario === codUsuarioLogado &&
                selectedPermissionKeys.includes(GESTOR_ROLE);

              const isFdvPermission = FDV_PERMISSIONS_KEYS.includes(
                permission.key,
              );
              const fdvPermissionDisabled = isFdvPermission && !hasAppAccess;

              const isDisabled =
                cannotRemoveSelfGestor || fdvPermissionDisabled;

              return (
                <label
                  key={permission.key}
                  className={`${styles.permissionLabel} ${
                    isDisabled ? styles.disabledLabel : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissionKeys.includes(permission.key)}
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
        Nenhum cargo disponível encontrado para esta empresa.
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
            disabled={isLoadingData || updateLoading || !!loadError}
          >
            {updateLoading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPermissoes;
