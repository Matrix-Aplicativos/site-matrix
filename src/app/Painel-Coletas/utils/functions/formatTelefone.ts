export function formatTelefone(value: string): string {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, "");
  
    if (numericValue.length === 10) {
      // Formato para telefone fixo: (XX) XXXX-XXXX
      return numericValue.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    } else if (numericValue.length === 11) {
      // Formato para celular: (XX) XXXXX-XXXX
      return numericValue.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else {
      // Retorna o valor sem formatação se não for um número válido
      return value;
    }
  }