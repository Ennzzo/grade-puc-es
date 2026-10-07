import type { Curriculo, Progresso, Status } from "./types";

const chaveStorage = (id: string) => `grade-puc-es:${id}`;

export const vazio = (): Progresso => ({ status: {}, complementares: 0 });

function codigos(cur: Curriculo): string[] {
  return cur.periodos.flatMap((p) => p.disciplinas.map((d) => d.codigo));
}

function toBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

/**
 * Codifica o progresso em `<id>.<bits>.<complementares>`, com 2 bits por
 * disciplina na ordem do JSON do currículo.
 */
export function codificar(cur: Curriculo, p: Progresso): string {
  const lista = codigos(cur);
  const bytes = new Uint8Array(Math.ceil(lista.length / 4));
  lista.forEach((codigo, i) => {
    bytes[i >> 2] |= (p.status[codigo] ?? 0) << ((i & 3) * 2);
  });
  return `${cur.id}.${toBase64Url(bytes)}.${p.complementares}`;
}

export function decodificar(cur: Curriculo, texto: string): Progresso | null {
  const [id, bits, comp] = texto.split(".");
  if (id !== cur.id || bits === undefined) return null;
  try {
    const bytes = fromBase64Url(bits);
    const status: Record<string, Status> = {};
    codigos(cur).forEach((codigo, i) => {
      const s = ((bytes[i >> 2] ?? 0) >> ((i & 3) * 2)) & 3;
      if (s === 1 || s === 2) status[codigo] = s;
    });
    return { status, complementares: Math.max(0, Number(comp) || 0) };
  } catch {
    return null;
  }
}

export function idNaUrl(): string | null {
  const hash = location.hash.slice(1);
  return hash ? hash.split(".")[0] : null;
}

/** A URL tem prioridade sobre o localStorage, para que links compartilhados abram o estado do link. */
export function carregar(cur: Curriculo): Progresso {
  const daUrl = decodificar(cur, location.hash.slice(1));
  if (daUrl) return daUrl;
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
  } catch {
    // sem localStorage, o estado continua disponível pela URL
  }
  history.replaceState(null, "", `#${codificar(cur, p)}`);
}

export function linkCompartilhavel(cur: Curriculo, p: Progresso): string {
  return `${location.origin}${location.pathname}#${codificar(cur, p)}`;
}
