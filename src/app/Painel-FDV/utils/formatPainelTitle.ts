export function formatPainelTitle(
  titulo: string,
  nomeFantasia?: string | null
): string {
  const empresa = nomeFantasia?.toUpperCase()?.trim();
  return empresa ? `${titulo} - ${empresa}` : titulo;
}
