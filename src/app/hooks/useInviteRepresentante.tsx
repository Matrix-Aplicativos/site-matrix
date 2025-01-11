import { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";


interface useInviteRepresentanteHook {    
    invite(email : string) : Promise<{status : number, id : number, message: string} | null>;
    loading: boolean;
    error: string | null;
  }
  
  const useInviteRepresentante = (): useInviteRepresentanteHook => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const invite = async (email : string): Promise<{status : number, id : number, message: string} | null> => {
        try {
          setLoading(true);
          const response = await axiosInstance.post("/usuario/representante/invite",{email: email});
          setError(null);
          return response.data;
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Ocorreu um erro ao convidar o representante."
          );
          return null;
        } finally {
          setLoading(false);
        }
      };

  
    return { invite, loading, error };
  };
  
  export default useInviteRepresentante;
  