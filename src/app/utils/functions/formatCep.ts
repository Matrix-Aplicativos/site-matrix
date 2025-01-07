export function formatCep(value: string): string {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, "");
  
    // Formatar como CEP: XXXXX-XXX
    return numericValue.replace(/(\d{5})(\d{3})/, "$1-$2");
  }
  