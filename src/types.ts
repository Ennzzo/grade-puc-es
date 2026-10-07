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

export interface Curriculo {
  id: string;
  curso: string;
  campus: string;
  turno: string;
  inicio: string;
  cargaHorariaCurso: number;
  atividadesComplementaresMin: number;
  periodos: Periodo[];
}

/** 0 = pendente, 1 = cursando, 2 = cursada */
export type Status = 0 | 1 | 2;

export interface Progresso {
  status: Record<string, Status>;
  complementares: number;
}
