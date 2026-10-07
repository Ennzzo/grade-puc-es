import "./style.css";
import { curriculos } from "./data/curriculos";
import { carregar, idNaUrl, linkCompartilhavel, salvar, vazio } from "./progress";
import type { Curriculo, Disciplina, Ementa, Progresso, Status } from "./types";

const NOME_STATUS: Record<Status, string> = { 0: "Pendente", 1: "Cursando", 2: "Cursada" };
/** Ordem do clique: pendente → cursada → cursando → pendente. */
const PROXIMO: Record<Status, Status> = { 0: 2, 2: 1, 1: 0 };

function renderEmenta(e: Ementa | undefined): string {
  if (!e) return "";
  const fonte = {
    oficial: `Ementa oficial PUC Minas · ${e.origem}`,
    equivalente: `Ementa oficial da disciplina equivalente ${e.origem}. O conteúdo pode variar no currículo novo.`,
    descricao: "Descrição não oficial, baseada no nome e na área da disciplina. A PUC ainda não publicou a ementa deste currículo.",
  }[e.fonte];
  return `
    <section class="ementa">
      <h4>O que a disciplina aborda</h4>
      <p>${e.texto}</p>
      <p class="fonte fonte-${e.fonte}">${fonte}</p>
    </section>`;
}

const ICONE_CADEADO = `<svg class="cadeado" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/>
  <path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;

let cur: Curriculo = curriculos.find((c) => c.id === idNaUrl()) ?? curriculos[0];
let prog: Progresso = carregar(cur);
let busca = "";

// Índices derivados do currículo atual
let porCodigo = new Map<string, Disciplina & { periodo: number }>();
let dependentes = new Map<string, string[]>();

function indexar() {
  porCodigo = new Map();
  dependentes = new Map();
  for (const p of cur.periodos) {
    for (const d of p.disciplinas) porCodigo.set(d.codigo, { ...d, periodo: p.numero });
  }
  for (const d of porCodigo.values()) {
    for (const r of d.requisitos ?? []) {
      dependentes.set(r.codigo, [...(dependentes.get(r.codigo) ?? []), d.codigo]);
    }
  }
}

const status = (codigo: string): Status => prog.status[codigo] ?? 0;

function setStatus(codigo: string, s: Status) {
  if (s === 0) delete prog.status[codigo];
  else prog.status[codigo] = s;
}

/** Pré-requisito exige a disciplina cursada; co-requisito aceita cursando ou cursada. */
function requisitoAtendido(tipo: "pre" | "co", codigo: string): boolean {
  return tipo === "pre" ? status(codigo) === 2 : status(codigo) >= 1;
}

function pendencias(d: Disciplina) {
  return (d.requisitos ?? []).filter((r) => !requisitoAtendido(r.tipo, r.codigo));
}

const normalizar = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// ---------- Renderização ----------

function renderCard(d: Disciplina): string {
  const s = status(d.codigo);
  const falta = pendencias(d);
  const aviso = s > 0 && falta.length > 0;
  const bloqueada = s === 0 && falta.some((r) => r.tipo === "pre");
  const casaBusca = !busca || normalizar(`${d.nome} ${d.codigo}`).includes(busca);
  const classes = [
    "card",
    `s${s}`,
    aviso ? "aviso" : "",
    bloqueada ? "bloqueada" : "",
    casaBusca ? "" : "apagado",
  ].join(" ");
  const tags = (d.requisitos ?? []).length
    ? `<span class="tag" title="Tem requisitos">req</span>`
    : "";
  return `
    <div class="${classes}" data-codigo="${d.codigo}" role="button" tabindex="0"
         aria-label="${d.nome}: ${NOME_STATUS[s]}">
      <button class="info" data-info="${d.codigo}" aria-label="Detalhes de ${d.nome}">i</button>
      ${aviso ? `<span class="alerta" title="Requisito não cumprido">!</span>` : ""}
      ${bloqueada ? `<span class="bloqueio" title="Pré-requisito pendente">${ICONE_CADEADO}</span>` : ""}
      <div class="nome">${d.nome}</div>
      <div class="rodape">${tags}<span>${d.ch} horas</span></div>
    </div>`;
}

function renderGrade() {
  $("#grade").innerHTML = cur.periodos
    .map((p) => {
      const total = p.disciplinas.reduce((a, d) => a + d.ch, 0);
      const feitas = p.disciplinas.filter((d) => status(d.codigo) === 2);
      const chFeita = feitas.reduce((a, d) => a + d.ch, 0);
      const completo = feitas.length === p.disciplinas.length;
      return `
        <section class="periodo">
          <header>
            <h2>${p.numero}º Período</h2>
            <p>${chFeita} / ${total} horas</p>
            <button class="marcar" data-periodo="${p.numero}">
              ${completo ? "Desmarcar período" : "Marcar período"}
            </button>
          </header>
          ${p.disciplinas.map(renderCard).join("")}
        </section>`;
    })
    .join("");
}

function renderResumo() {
  const todas = [...porCodigo.values()];
  const total = todas.reduce((a, d) => a + d.ch, 0);
  const soma = (s: Status) => todas.filter((d) => status(d.codigo) === s);
  const cursadas = soma(2);
  const cursando = soma(1);
  const chCursada = cursadas.reduce((a, d) => a + d.ch, 0);
  const chCursando = cursando.reduce((a, d) => a + d.ch, 0);
  const pct = (n: number) => (total ? (n / total) * 100 : 0);

  $("#barra-cursada").style.width = `${pct(chCursada)}%`;
  $("#barra-cursando").style.width = `${pct(chCursando)}%`;
  $("#resumo-texto").innerHTML = `
    <strong>${pct(chCursada).toFixed(1)}%</strong> concluído ·
    ${chCursada} de ${total} h em disciplinas ·
    ${cursadas.length} de ${todas.length} disciplinas cursadas
    ${cursando.length ? ` · ${cursando.length} cursando (${chCursando} h)` : ""}`;

  const comp = $<HTMLInputElement>("#complementares");
  if (document.activeElement !== comp) comp.value = String(prog.complementares);
  $("#complementares-min").textContent = `/ ${cur.atividadesComplementaresMin} h`;
  $("#complementares-ok").hidden = prog.complementares < cur.atividadesComplementaresMin;
}

function renderCabecalho() {
  const sel = $<HTMLSelectElement>("#curriculo");
  sel.innerHTML = curriculos
    .map((c) => `<option value="${c.id}" ${c.id === cur.id ? "selected" : ""}>${c.curso} · ${c.id}</option>`)
    .join("");
  sel.disabled = curriculos.length < 2;
  document.title = `Grade ${cur.curso} · ${cur.id}`;
}

function render() {
  renderGrade();
  renderResumo();
}

function alterar(fn: () => void) {
  fn();
  salvar(cur, prog);
  render();
}

// ---------- Destaque de requisitos ao passar o mouse ----------

function destacar(codigo: string | null) {
  document.querySelectorAll(".card.req-pre, .card.req-co, .card.dependente, .card.foco").forEach((el) =>
    el.classList.remove("req-pre", "req-co", "dependente", "foco"),
  );
  if (!codigo) return;
  const card = (c: string) => document.querySelector(`.card[data-codigo="${c}"]`);
  card(codigo)?.classList.add("foco");
  for (const r of porCodigo.get(codigo)?.requisitos ?? []) card(r.codigo)?.classList.add(`req-${r.tipo}`);
  for (const c of dependentes.get(codigo) ?? []) card(c)?.classList.add("dependente");
}

// ---------- Diálogo de detalhes ----------

function abrirDetalhes(codigo: string) {
  const d = porCodigo.get(codigo);
  if (!d) return;
  const linha = (c: string, extra = "") => {
    const x = porCodigo.get(c)!;
    return `<li><span class="ponto s${status(c)}"></span>${x.nome} <small>(${x.periodo}º · ${NOME_STATUS[status(c)]})</small>${extra}</li>`;
  };
  const reqs = (d.requisitos ?? [])
    .map((r) =>
      linha(
        r.codigo,
        ` <span class="tipo ${requisitoAtendido(r.tipo, r.codigo) ? "ok" : "falta"}">${r.tipo === "pre" ? "PRÉ" : "CO"}</span>`,
      ),
    )
    .join("");
  const deps = (dependentes.get(codigo) ?? []).map((c) => linha(c)).join("");
  const s = status(codigo);

  $("#detalhes-conteudo").innerHTML = `
    <h3>${d.nome}</h3>
    <p class="meta">Código ${d.codigo} · ${d.periodo}º período · ${d.ch} horas</p>
    ${renderEmenta(cur.ementas?.[codigo])}
    <div class="opcoes" role="group" aria-label="Situação">
      ${([0, 1, 2] as Status[])
        .map((x) => `<button data-set="${x}" class="s${x} ${x === s ? "ativo" : ""}">${NOME_STATUS[x]}</button>`)
        .join("")}
    </div>
    <h4>Requisitos</h4>
    ${reqs ? `<ul>${reqs}</ul>` : `<p class="vazio">Nenhum requisito.</p>`}
    <h4>É requisito de</h4>
    ${deps ? `<ul>${deps}</ul>` : `<p class="vazio">Nenhuma disciplina.</p>`}`;
  const dlg = $<HTMLDialogElement>("#detalhes");
  dlg.dataset.codigo = codigo;
  if (!dlg.open) dlg.showModal();
}

// ---------- Eventos ----------

function trocarCurriculo(id: string) {
  cur = curriculos.find((c) => c.id === id) ?? curriculos[0];
  prog = carregar(cur);
  indexar();
  renderCabecalho();
  salvar(cur, prog);
  render();
}

function avisar(msg: string) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("visivel");
  setTimeout(() => t.classList.remove("visivel"), 2200);
}

/**
 * Arrastar a grade para os lados segurando o botão do mouse. No toque o
 * navegador já rola sozinho, então só tratamos o mouse.
 */
function ligarArraste(grade: HTMLElement) {
  const LIMIAR = 5; // px antes de considerar arraste, para não engolir cliques
  let pressionado = false;
  let arrastando = false;
  let ignorarClique = false;
  let inicioX = 0;
  let scrollInicial = 0;

  grade.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    pressionado = true;
    arrastando = false;
    ignorarClique = false;
    inicioX = e.clientX;
    scrollInicial = grade.scrollLeft;
  });

  window.addEventListener("pointermove", (e) => {
    if (!pressionado) return;
    const dx = e.clientX - inicioX;
    if (!arrastando && Math.abs(dx) > LIMIAR) {
      arrastando = true;
      grade.classList.add("arrastando");
    }
    if (arrastando) grade.scrollLeft = scrollInicial - dx;
  });

  window.addEventListener("pointerup", () => {
    if (!pressionado) return;
    pressionado = false;
    if (arrastando) {
      grade.classList.remove("arrastando");
      ignorarClique = true; // o clique gerado ao soltar não deve alterar o card
    }
  });

  grade.addEventListener(
    "click",
    (e) => {
      if (!ignorarClique) return;
      ignorarClique = false;
      e.stopPropagation();
      e.preventDefault();
    },
    { capture: true },
  );
}

function ligarEventos() {
  const grade = $("#grade");
  ligarArraste(grade);

  grade.addEventListener("click", (e) => {
    const alvo = e.target as HTMLElement;
    const info = alvo.closest<HTMLElement>("[data-info]");
    if (info) return abrirDetalhes(info.dataset.info!);

    const marcar = alvo.closest<HTMLElement>("[data-periodo]");
    if (marcar) {
      const p = cur.periodos.find((x) => x.numero === Number(marcar.dataset.periodo))!;
      const completo = p.disciplinas.every((d) => status(d.codigo) === 2);
      return alterar(() => p.disciplinas.forEach((d) => setStatus(d.codigo, completo ? 0 : 2)));
    }

    const card = alvo.closest<HTMLElement>(".card");
    if (card) {
      const codigo = card.dataset.codigo!;
      alterar(() => setStatus(codigo, PROXIMO[status(codigo)]));
      destacar(codigo);
    }
  });

  grade.addEventListener("keydown", (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>(".card");
    if (card && (e.key === "Enter" || e.key === " ") && e.target === card) {
      e.preventDefault();
      const codigo = card.dataset.codigo!;
      alterar(() => setStatus(codigo, PROXIMO[status(codigo)]));
      (document.querySelector(`.card[data-codigo="${codigo}"]`) as HTMLElement | null)?.focus();
    }
  });

  grade.addEventListener("mouseover", (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>(".card");
    destacar(card?.dataset.codigo ?? null);
  });
  grade.addEventListener("mouseleave", () => destacar(null));

  const dlg = $<HTMLDialogElement>("#detalhes");
  dlg.addEventListener("click", (e) => {
    const alvo = e.target as HTMLElement;
    if (alvo === dlg || alvo.closest("[data-fechar]")) return dlg.close();
    const set = alvo.closest<HTMLElement>("[data-set]");
    if (set) {
      const codigo = dlg.dataset.codigo!;
      alterar(() => setStatus(codigo, Number(set.dataset.set) as Status));
      abrirDetalhes(codigo);
    }
  });

  $<HTMLInputElement>("#busca").addEventListener("input", (e) => {
    busca = normalizar((e.target as HTMLInputElement).value.trim());
    renderGrade();
  });

  $<HTMLInputElement>("#complementares").addEventListener("input", (e) => {
    const v = Math.max(0, Math.floor(Number((e.target as HTMLInputElement).value) || 0));
    alterar(() => (prog.complementares = v));
  });

  $<HTMLSelectElement>("#curriculo").addEventListener("change", (e) =>
    trocarCurriculo((e.target as HTMLSelectElement).value),
  );

  $("#copiar-link").addEventListener("click", async () => {
    const link = linkCompartilhavel(cur, prog);
    try {
      await navigator.clipboard.writeText(link);
      avisar("Link copiado. Abra em outro dispositivo para ver o mesmo progresso.");
    } catch {
      prompt("Copie o link:", link);
    }
  });

  $("#exportar").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ curriculo: cur.id, ...prog }, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `progresso-${cur.id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  const arquivo = $<HTMLInputElement>("#arquivo");
  $("#importar").addEventListener("click", () => arquivo.click());
  arquivo.addEventListener("change", async () => {
    const f = arquivo.files?.[0];
    arquivo.value = "";
    if (!f) return;
    try {
      const dados = JSON.parse(await f.text());
      if (dados.curriculo && dados.curriculo !== cur.id) trocarCurriculo(dados.curriculo);
      alterar(() => (prog = { ...vazio(), status: dados.status ?? {}, complementares: dados.complementares ?? 0 }));
      avisar("Progresso importado.");
    } catch {
      avisar("Arquivo inválido.");
    }
  });

  $("#limpar").addEventListener("click", () => {
    if (confirm("Apagar todo o progresso deste currículo?")) alterar(() => (prog = vazio()));
  });
}

indexar();
renderCabecalho();
ligarEventos();
salvar(cur, prog);
render();
