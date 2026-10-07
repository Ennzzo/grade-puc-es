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
- Busca por nome ou código
- Tema claro e escuro, de acordo com o sistema

## Onde o progresso fica salvo

Não há backend nem login:

- **No navegador** (localStorage), salvo automaticamente.
- **Na URL**: o progresso é codificado no `#` do endereço. Use **Copiar link** para abrir o mesmo estado em outro dispositivo ou para mostrar a alguém.
- **Exportar e Importar** geram e leem um arquivo JSON de backup.

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
