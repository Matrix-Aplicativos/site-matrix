export function formatCnpjCpf(value: string | null | undefined): string {
  // Return empty string for null/undefined/empty input
  if (!value) return "";

  // Remove todos os caracteres não numéricos
  const numericValue = value.replace(/\D/g, "");

  if (numericValue.length <= 11) {
    // Formatar como CPF: XXX.XXX.XXX-XX
    return numericValue
      .padStart(11, "0")
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  } else {
    // Formatar como CNPJ: XX.XXX.XXX/XXXX-XX
    return numericValue
      .padStart(14, "0")
      .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
}
