export type UsuarioGet = {
  codFuncionario: number; // Chave principal, sempre presente
  codUsuario?: number | undefined; // Opcional, pode ser nulo ou inexistente

  codUsuarioErp: string;
  nome: string;
  cpf: string;
  email: string;
  login: string;
  tipoUsuario: {
    codTipoUsuario: number;
    nome: string;
    ativo: true;
  };
  ativo: boolean;
};
