/**
 * Resolve um caminho da pasta `public/` respeitando a base configurada no Vite
 * ('/' na Vercel ou em domínio próprio, '/nome-do-repositorio/' no GitHub Pages).
 */
export function assetUrl(path: string): string {
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  return `${base}${path.replace(/^\.?\/+/, '')}`;
}
