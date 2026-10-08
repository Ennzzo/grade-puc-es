import type { Curriculo, Progresso } from "./types";

const chaveStorage = (id: string) => `grade-puc-es:${id}`;
const CHAVE_CURRICULO = "grade-puc-es:curriculo";

export const vazio = (): Progresso => ({ status: {}, complementares: 0 });

/** O progresso fica só no navegador: links compartilhados sempre abrem a grade zerada. */
export function carregar(cur: Curriculo): Progresso {
  try {
    const salvo = localStorage.getItem(chaveStorage(cur.id));
    if (salvo) return { ...vazio(), ...JSON.parse(salvo) };
  } catch {
    // localStorage indisponível ou corrompido: começa do zero
  }
  return vazio();
}

export function salvar(cur: Curriculo, p: Progresso): void {
  try {
    localStorage.setItem(chaveStorage(cur.id), JSON.stringify(p));
    localStorage.setItem(CHAVE_CURRICULO, cur.id);
  } catch {
    // sem localStorage o progresso vale só até fechar a aba
  }
}

export function ultimoCurriculo(): string | null {
  try {
    return localStorage.getItem(CHAVE_CURRICULO);
  } catch {
    return null;
  }
}

/** Links antigos traziam o progresso no `#`; ele é ignorado e removido do endereço. */
export function limparHashAntigo(): void {
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
}

export function linkDoSite(): string {
  return `${location.origin}${location.pathname}`;
}
