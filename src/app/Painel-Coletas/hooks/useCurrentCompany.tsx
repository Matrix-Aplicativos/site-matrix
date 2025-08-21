import { getCookie } from "cookies-next";
import useGetLoggedUser from "./useGetLoggedUser";
import { useEffect, useState } from "react";
import { getUserFromToken } from "../utils/functions/getUserFromToken";

export default function useCurrentCompany() {
  const token = getCookie("token");
  const codUsuario = getUserFromToken(String(token));
  const { usuario, loading: userLoading } = useGetLoggedUser(codUsuario || 0);
  const [codEmpresa, setCodEmpresa] = useState<number | null>(null);

  useEffect(() => {
    if (!userLoading && usuario) {
      const empresa = usuario.empresas?.[0];
      if (!empresa) {
        console.error("Usuário não tem empresas vinculadas:", usuario);
      }
      setCodEmpresa(empresa?.codEmpresa || null);
    }
  }, [userLoading, usuario]);

  return { codEmpresa, loading: userLoading };
}