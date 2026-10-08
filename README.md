# Grade ES · PUC Minas

Grade curricular interativa de **Engenharia de Software da PUC Minas**, currículo **37204** (início em 2026, Campus Lourdes, noite), inspirada no [Grade Inteligente do ICEI](https://icei.pucminas.br/gradeinteligente/), que só tem o currículo anterior.

**Acesse:** https://ennzzo.github.io/grade-puc-es/

## Funcionalidades

- Grade por período, com carga horária de cada disciplina
- Clique no card para alternar: pendente → cursada → cursando
- "Marcar período" para marcar todas as disciplinas de um período de uma vez
- Pré e co-requisitos: ao passar o mouse, os requisitos ficam destacados (laranja = pré, roxo = co) e as disciplinas que dependem dela ficam com contorno tracejado
- Alerta (!) quando uma disciplina está marcada sem o requisito cumprido, e 🔒 nas pendentes com pré-requisito em aberto
- Progresso total em horas e disciplinas, e contador de atividades complementares
- Ementa de cada disciplina no ícone ⓘ, indicando a fonte (veja abaixo)
- Busca por nome ou código
- Tema claro e escuro, de acordo com o sistema

## Onde o progresso fica salvo

Não há backend nem login. O progresso fica **só no seu navegador** (localStorage), salvo automaticamente.

- **Copiar link** copia apenas o endereço do site. Quem abrir começa com a grade zerada e o progresso de cada pessoa fica no navegador dela.
- **Exportar e Importar** geram e leem um arquivo JSON. Use para fazer backup ou levar o progresso para outro navegador ou dispositivo.

## Ementas

As ementas ficam em `src/data/ementas-37204.json`. A PUC ainda não publicou as ementas do currículo 37204, então cada uma indica a fonte:

- **oficial** (26): ementa oficial de disciplina com o mesmo nome em outro currículo da PUC Minas, obtida da API do Grade Inteligente.
- **equivalente** (18): ementa oficial de uma disciplina equivalente com outro nome (ex.: Estruturas de Dados ← Algoritmos e Estruturas de Dados II).
- **descricao** (18): descrição não oficial, escrita a partir do nome e da área, para disciplinas novas sem equivalente (DevOps, SRE, Métodos Formais, Optativas etc.).

Quando a PUC publicar as ementas oficiais, basta substituir o texto e mudar a `fonte` para `oficial`.

## Desenvolvimento

```bash
npm install
npm run dev      # servidor local
npm run build    # checagem de tipos + build em dist/
```

O deploy é automático: cada push na `main` dispara o workflow `.github/workflows/deploy.yml`, que publica no GitHub Pages.

## Adicionar outro currículo

1. Crie `src/data/curriculo-<id>.json` seguindo o formato de `curriculo-37204.json`.
2. Registre o arquivo em `src/data/curriculos.ts`.

O seletor de currículo no topo é habilitado quando houver mais de um.

> Os dados vêm do relatório "Disciplinas e Requisitos do Currículo" do SGA (gerado em 06/07/2026). A soma das disciplinas dá 4522 h; a carga horária total do curso no relatório (4622 h) inclui outros componentes, como atividades complementares.
