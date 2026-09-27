# Roadmap — Dashboard Financeiro

Next.js (App Router) · TypeScript strict · Material UI + styled-components · 100% de cobertura

> **Status (26/09/2026): todas as fases entregues.** Mudanças em relação ao plano original:
>
> - **Ant Design → Material UI.** O registry de SSR do antd usa `Math.random()` e é incompatível com Cache Components; o MUI tem integração oficial com o App Router e permitiu usar `'use cache'` + Partial Prerendering.
> - Filtro de data com inputs nativos `type="date"` (o inputs de data do MUI é pago); `middleware.ts` virou `proxy.ts` no Next 16.
> - As decisões finais estão documentadas como ADRs no README.

---

## 0. O que o dataset revela (e por que isso importa)

Analisado o `transactions.json` antes de planejar:

| Fato                                                                                               | Consequência de arquitetura                                                                                                                                              |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **50.000 registros, 11,7 MB**                                                                      | Nunca enviar o JSON ao browser. Agregação no **servidor** (Server Components + cache do Next). O cliente recebe apenas KPIs, séries dos gráficos e uma página da tabela. |
| `amount` em string de centavos (`100` a `9099`)                                                    | Trabalhar **sempre em centavos inteiros** (`number` inteiro); formatar só na borda com `Intl.NumberFormat('pt-BR', { currency: 'BRL' })`. Evita erro de ponto flutuante. |
| `currency` é sempre `brl`                                                                          | Validar com Zod (`z.literal('brl')`) — se mudar, falha explícita em vez de soma errada.                                                                                  |
| Datas de **nov/2021 a nov/2023** (25 meses, ~2.000/mês)                                            | Filtro de data padrão = período completo do dataset; granularidade mensal nos gráficos.                                                                                  |
| 103 contas, 10 indústrias, 26 estados; **cada conta pertence a exatamente 1 indústria e 1 estado** | Permite **filtros em cascata** (“dinâmicos”): selecionar indústria/estado restringe as contas disponíveis e vice-versa.                                                  |
| **Não existe campo de status**                                                                     | "Transações pendentes" exige uma **regra de negócio documentada** (ver ADR-001).                                                                                         |
| Depósitos ≈ R$ 1.152.334 · Saques ≈ R$ 1.151.397                                                   | Saldo total pequeno (~R$ 937) — bom para testar formatação de valores próximos de zero / negativos por filtro.                                                           |

### ADR-001 — Definição de "pendente" (decisão a confirmar)

O dataset não tem status. Proposta: **data de referência ("hoje") = última data do dataset (30/11/2023)**; transações dos **últimos N dias (padrão 7)** antes dessa data são consideradas _pendentes de compensação_ e ficam fora do saldo total. A regra fica isolada numa função pura (`isPending(tx, referenceDate, windowDays)`), 100% testada e documentada no README. Mostrar a regra no tooltip do card — avaliador vê que foi uma decisão consciente, não um esquecimento.

---

## 1. Identidade visual (extraída do site da BIX)

| Token         | Valor                                                                | Uso                                                    |
| ------------- | -------------------------------------------------------------------- | ------------------------------------------------------ |
| `primary`     | `#0068A8`                                                            | Botões, links, série "receitas", item ativo da sidebar |
| `text`        | `#334155`                                                            | Texto corrente (contraste 10,35 — AA/AAA)              |
| `heading`     | `#0F1E3D` (azul-marinho dos títulos)                                 | Títulos, sidebar escura                                |
| `bgLayout`    | `#F8FAFC`                                                            | Fundo da página                                        |
| `bgContainer` | `#FFFFFF`                                                            | Cards                                                  |
| `accent`      | ciano/turquesa do logo e da ilustração (`#2DD4BF`)                   | Destaques, série "saldo" no gráfico de linha           |
| `danger`      | vermelho suave                                                       | Despesas / saldo negativo                              |
| Fonte         | Roboto (via `next/font/google`)                                      |                                                        |
| Raio          | 8px (inputs) / 16px (cards, como a imagem do hero) / pill nos botões |                                                        |

**Fonte única de verdade:** um objeto `theme.ts` que alimenta **ao mesmo tempo** o tema do MUI (`token` + `components`) e o `ThemeProvider` do styled-components, tipado via `DefaultTheme` (`styled.d.ts`). Nenhuma cor hardcoded em componente — lint rule/revisão garante.

---

## 2. Stack e decisões técnicas

| Área      | Escolha                                                                                                                                            | Justificativa                                                |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Framework | **Next.js 15 (App Router)** + React 19                                                                                                             | Server Components para agregar 50k linhas no servidor        |
| Linguagem | TypeScript `strict` + `noUncheckedIndexedAccess`                                                                                                   |                                                              |
| UI        | **Material UI** + `@mui/material-nextjs`                                                                                                           | SSR sem flash de estilos                                     |
| Estilo    | **styled-components** + registry com `useServerInsertedHTML`                                                                                       | Exigência do teste; SSR correto                              |
| Gráficos  | **Recharts**                                                                                                                                       | SVG → testável em jsdom (G2/canvas não é), composável e leve |
| Validação | **Zod**                                                                                                                                            | Dataset, search params, formulário de login                  |
| Auth      | Cookie **HttpOnly + assinado (JWT com `jose`)**                                                                                                    | Sessão sem banco; verificável no `middleware` (Edge)         |
| Datas     | `Intl` nativo, sempre em UTC                                                                                                                       |                                                              |
| Testes    | **Jest + React Testing Library + user-event** (`next/jest`)                                                                                        | Suporte oficial do Next; `coverageThreshold` 100%            |
| E2E       | **Playwright** (fluxo login → filtro → logout)                                                                                                     | Complementa, não conta na cobertura                          |
| Qualidade | ESLint (next, typescript-eslint strict, jsx-a11y, testing-library, import order), Prettier, Husky + lint-staged, commitlint (Conventional Commits) |                                                              |
| CI/CD     | GitHub Actions (lint → typecheck → test:coverage → build → e2e) + **Vercel**                                                                       |                                                              |

---

## 3. Arquitetura

```
src/
├─ app/
│  ├─ (auth)/login/page.tsx            # Server Component + form client
│  ├─ (dashboard)/dashboard/
│  │  ├─ layout.tsx                     # Sidebar exclusiva (Home / Logout)
│  │  ├─ page.tsx                       # lê searchParams → chama services
│  │  ├─ loading.tsx                    # skeletons
│  │  └─ error.tsx
│  ├─ layout.tsx                        # providers MUI + styled-components, fonte
│  └─ page.tsx                          # redireciona conforme sessão
├─ features/
│  ├─ auth/        (actions.ts, session.ts, LoginForm, schemas)
│  ├─ filters/     (schema Zod, parse/serialize URL, FilterBar, useFilters)
│  ├─ summary/     (SummaryCards)
│  ├─ charts/      (StackedBarChart, BalanceLineChart, adapters)
│  └─ transactions/(TransactionsTable)
├─ domain/                              # 100% puro, sem React
│  ├─ transaction.ts   (tipos + normalize: string→centavos, epoch→Date)
│  ├─ filters.ts       (applyFilters)
│  ├─ aggregations.ts  (summary, byMonth, byIndustry, runningBalance)
│  ├─ pending.ts       (ADR-001)
│  └─ money.ts         (formatBRL)
├─ server/
│  └─ transactions.repository.ts        # carrega JSON (import 'server-only') + cache
├─ styles/  (theme.ts, GlobalStyle, styled.d.ts)
├─ middleware.ts                        # protege /dashboard, redireciona logado em /login
└─ data/transactions.json               # arquivo original, INTOCADO (checksum no teste)
```

**Princípios que o avaliador vai notar**

- **Domínio puro e separado da UI** → regras testáveis sem render, reuso server/client.
- **Repository + `import 'server-only'`** → impossível o JSON vazar para o bundle do cliente.
- **Cache do Next**: normalização do dataset uma vez por processo; agregações cacheadas por chave de filtro (`unstable_cache` / `'use cache'` conforme versão), `revalidate` configurável.
- **Server Components por padrão**, `'use client'` só onde há interação (filtros, gráficos, sidebar).
- Teste que garante que o `transactions.json` **não foi alterado** (hash SHA-256) — responde literalmente ao pedido do enunciado.

---

## 4. Estado: sessão e filtros sem banco

**Sessão**

1. Login via **Server Action**: valida com Zod, confere credenciais demo (env `DEMO_USER`/`DEMO_PASSWORD`, documentadas no README).
2. Gera JWT assinado (`SESSION_SECRET`) → cookie `HttpOnly`, `Secure`, `SameSite=Lax`, expiração 8h.
3. `middleware.ts` verifica o JWT: sem sessão em `/dashboard` → `/login?from=...`; com sessão em `/login` → `/dashboard`.
4. Logout = Server Action que apaga o cookie.

**Filtros (globais e dinâmicos)**

- **URL como fonte de verdade** (`?from=&to=&accounts=&industries=&states=`): compartilhável, funciona com back/forward, e o Server Component re-renderiza tudo (cards, gráficos, tabela) a partir dela.
- **Persistência**: ao aplicar, salva também em cookie; ao abrir `/dashboard` sem query, o middleware restaura os últimos filtros. Sobrevive a reload e a fechar o navegador — sem banco.
- Search params parseados com Zod (valores inválidos são descartados, nunca quebram a página).
- Cascata: opções de conta calculadas a partir de indústria/estado selecionados (e vice-versa).
- `useTransition` na troca de filtro → feedback de loading sem travar a UI; debounce não necessário pois o apply é explícito em mobile e imediato em desktop.

---

## 5. Conteúdo da dashboard

1. **Cards (4)**: Receitas, Despesas, Pendentes (qtd + valor), Saldo total — cor semântica, ícone, tooltip com a regra.
2. **Barras empilhadas**: por mês, **despesas (ou receitas) empilhadas por indústria** — mostra a composição, que é o que um gráfico empilhado faz bem. Toggle Receitas/Despesas.
3. **Linhas**: por mês, **receitas × despesas + saldo acumulado** (eixo secundário).
4. **Tabela de histórico**: MUI `Table` com ordenação, paginação **server-side** (nunca 50k linhas no DOM), badge de pendente.
5. **Sidebar exclusiva do layout da dashboard**: Home e Logout; sidebar fixa no desktop, `Drawer` no mobile.
6. Estados: skeleton (`loading.tsx`), vazio (filtros sem resultado com botão "limpar filtros"), erro (`error.tsx` com retry).

---

## 6. Estratégia de testes (100% real, não maquiado)

| Camada      | O quê                                                                                                                                      | Ferramenta      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| Domínio     | normalize, applyFilters, agregações, pending, formatBRL — incluindo bordas (lista vazia, saldo negativo, limites de data inclusivos, fuso) | Jest puro       |
| Server      | session (assinar/verificar/expirar), actions de login/logout, repository, middleware                                                       | Jest (node env) |
| Componentes | render, interação com user-event, acessibilidade por role/label                                                                            | RTL (jsdom)     |
| Gráficos    | adapters de dados testados puros; componente com `ResizeObserver` mockado                                                                  | RTL             |
| Integridade | hash do `transactions.json`                                                                                                                | Jest            |
| E2E         | login → aplicar filtro → reload mantém filtro → logout                                                                                     | Playwright      |

- `coverageThreshold: { global: { branches: 100, functions: 100, lines: 100, statements: 100 } }` — CI falha abaixo disso.
- Exclusões **explícitas e justificadas** no README (arquivos de config, `*.d.ts`, `layout.tsx` raiz que só compõe providers se não for testável) — nada de `/* istanbul ignore */` espalhado.
- Fixtures pequenas e determinísticas (factory `makeTransaction()`), nunca o dataset real nos testes unitários.
- Data "atual" injetada (não `Date.now()` direto) → testes determinísticos.

---

## 7. Roadmap por fases

Cada fase = uma ou mais PRs pequenas com Conventional Commits. O histórico do git também é avaliado.

### Fase 0 — Fundação (½ dia)

- [x] `create-next-app` (TS, App Router, `src/`), Node LTS fixado em `.nvmrc` + `engines`
- [x] ESLint/Prettier/Husky/lint-staged/commitlint
- [x] Jest + RTL configurados com threshold 100% desde o primeiro commit
- [x] GitHub Actions (lint, typecheck, test, build) + projeto na Vercel com preview por PR
- [x] `transactions.json` copiado para `src/data/` sem alteração + teste de hash

### Fase 1 — Domínio (½ dia)

- [x] Tipos + schema Zod + `normalize`
- [x] `money.ts`, `filters.ts`, `aggregations.ts`, `pending.ts` (ADR-001)
- [x] Repository `server-only` com cache
- [x] 100% de cobertura do domínio (TDD aqui é natural)

### Fase 2 — Design system (½ dia)

- [x] `theme.ts` com tokens BIX → tema do MUI + styled `ThemeProvider`
- [x] Registries SSR (MUI + styled-components), `GlobalStyle`, fonte Roboto
- [x] Componentes base estilizados (Card, PageHeader, Logo)

### Fase 3 — Autenticação (½ dia)

- [x] Página de login (formulário MUI + validação Zod, estados de erro/loading, a11y)
- [x] Server Actions login/logout, JWT em cookie, `middleware.ts`
- [x] Testes de todos os ramos (credencial inválida, token expirado/adulterado, redirect `from`)

### Fase 4 — Layout da dashboard (½ dia)

- [x] Sidebar exclusiva (Home, Logout), colapsável/Drawer responsivo
- [x] Header com usuário e botão de menu no mobile
- [x] `loading.tsx`, `error.tsx`, estado vazio

### Fase 5 — Filtros (1 dia)

- [x] Schema de search params + parse/serialize
- [x] FilterBar: inputs de data, Selects múltiplos com busca (contas, indústrias, estados), cascata
- [x] Persistência em cookie + restauração no middleware; botão "limpar"
- [x] Chips de filtros ativos

### Fase 6 — Cards, gráficos e tabela (1 dia)

- [x] SummaryCards
- [x] StackedBarChart (indústria × mês) e BalanceLineChart
- [x] TransactionsTable com paginação/ordenação server-side
- [x] Tudo reagindo aos filtros via searchParams

### Fase 7 — Polimento (½ dia)

- [x] Responsividade (320px → 1920px), foco visível, navegação por teclado, `aria-*` nos gráficos (resumo textual)
- [x] Lighthouse ≥ 90 em todas as categorias; medir bundle (`@next/bundle-analyzer`)
- [x] Playwright E2E no CI
- [x] Micro-interações: transições de card, hover nos gráficos

### Fase 8 — Entrega (½ dia)

- [x] README: stack, como rodar, credenciais demo, variáveis `.env.example`, scripts, decisões (ADRs), regra de pendentes, estrutura de pastas, print/GIF, link Vercel, badge do CI e da cobertura
- [x] Deploy final na Vercel e revisão do checklist abaixo

**Estimativa total: ~5 dias úteis.**

---

## 8. Checklist de requisitos do enunciado

| Requisito                                                                        | Onde                                 |
| -------------------------------------------------------------------------------- | ------------------------------------ |
| Login + Dashboard protegida                                                      | Fase 3 (middleware + JWT)            |
| Filtros globais e dinâmicos, tudo atualiza                                       | Fase 5–6 (URL → Server Component)    |
| Cards: receitas, despesas, pendentes, saldo                                      | Fase 6 + ADR-001                     |
| Barras empilhadas + linhas                                                       | Fase 6                               |
| Filtro por datas, contas, indústrias, estados                                    | Fase 5                               |
| Sidebar exclusiva com Logout e Home                                              | Fase 4                               |
| Persistir sessão e filtros sem banco                                             | Cookies (sessão JWT + filtros) + URL |
| Responsivo e interativo                                                          | Fase 4 e 7                           |
| Next.js + TypeScript                                                             | Fase 0                               |
| styled-components                                                                | Fase 2                               |
| README com instalação e observações                                              | Fase 8                               |
| Usar o dataset sem alterar                                                       | Fase 0 (teste de hash)               |
| _Opcional_: Vercel, lib de componentes/gráficos, testes unitários, cache do Next | Todos atendidos                      |

---

## 9. Diferenciais de senioridade (resumo para o README)

1. Agregação no servidor + `server-only`: o browser nunca baixa 11,7 MB.
2. Dinheiro em centavos inteiros; formatação só na borda.
3. Decisões registradas como ADRs (pendentes, auth, estado na URL, Recharts).
4. Tema único alimentando MUI e styled-components, com as cores da BIX.
5. 100% de cobertura garantida no CI, com E2E à parte.
6. Integridade do dataset verificada por teste.
7. Histórico de commits limpo, CI verde, preview por PR.
