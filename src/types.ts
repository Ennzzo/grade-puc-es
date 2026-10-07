export type TipoRequisito = "pre" | "co";

export interface Requisito {
  tipo: TipoRequisito;
  codigo: string;
}

export interface Disciplina {
  codigo: string;
  nome: string;
  ch: number;
  requisitos?: Requisito[];
}

export interface Periodo {
  numero: number;
  disciplinas: Disciplina[];
}

export type FonteEmenta = "oficial" | "equivalente" | "descricao";

export interface Ementa {
  fonte: FonteEmenta;
  texto: string;
  /** Disciplina e currículo de onde a ementa oficial foi tirada. */
  origem?: string;
}

export interface Curriculo {
  id: string;
  curso: string;
  campus: string;
  turno: string;
  inicio: string;
  cargaHorariaCurso: number;
  atividadesComplementaresMin: number;
  periodos: Periodo[];
  ementas?: Record<string, Ementa>;
}

/** 0 = pendente, 1 = cursando, 2 = cursada */
export type Status = 0 | 1 | 2;

export interface Progresso {
  status: Record<string, Status>;
  complementares: number;
}
