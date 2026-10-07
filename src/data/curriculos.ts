import type { Curriculo, Ementa } from "../types";
import c37204 from "./curriculo-37204.json";
import e37204 from "./ementas-37204.json";

/** Para adicionar um currículo: crie o JSON (e opcionalmente as ementas) nesta pasta e registre aqui. */
export const curriculos: Curriculo[] = [
  { ...(c37204 as Curriculo), ementas: e37204 as Record<string, Ementa> },
];
