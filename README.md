# Dashboard Financeiro

Dashboard para análise de saldos, receitas, despesas, transações pendentes e histórico de transações, construído com **Next.js 16 (App Router)**, **TypeScript**, **Material UI** e **styled-components**.

![Dashboard no desktop](docs/screenshots/desktop-dashboard.png)

| Login                                        | Mobile                                                        |
| -------------------------------------------- | ------------------------------------------------------------- |
| ![Login](docs/screenshots/desktop-login.png) | ![Dashboard no mobile](docs/screenshots/mobile-dashboard.png) |

## Acesso de demonstração

| E-mail             | Senha      |
| ------------------ | ---------- |
| `admin@bix.com.br` | `bix@2024` |

## Como rodar

Requisitos: **Node.js 20.9+** (o projeto fixa Node 24 em `.nvmrc`) e npm.

```bash
npm install
cp .env.example .env.local   # opcional em desenvolvimento, obrigatório em produção
npm run dev                  # http://localhost:3000
```

Build de produção:

```bash
npm run build
npm start
```

> Em produção, `SESSION_SECRET` (mínimo de 32 caracteres) é obrigatório. Em desenvolvimento há um valor padrão para o projeto rodar sem configuração.

### Scripts

| Script                            | O que faz                                                        |
| --------------------------------- | ---------------------------------------------------------------- |
| `npm run dev`                     | Servidor de desenvolvimento                                      |
| `npm run build` / `npm start`     | Build e servidor de produção                                     |
| `npm run lint`                    | ESLint (Next, TypeScript, ordem de imports)                      |
| `npm run typecheck`               | `tsc --noEmit` em modo estrito                                   |
| `npm run format` / `format:check` | Prettier                                                         |
| `npm test`                        | Testes unitários e de componentes (Jest + Testing Library)       |
| `npm run test:coverage`           | Testes com cobertura; **falha abaixo de 100%**                   |
| `npm run test:e2e`                | E2E com Playwright (desktop + mobile) contra o build de produção |

Na primeira execução do E2E, instale o navegador: `npx playwright install chromium`.

### Variáveis de ambiente

| Variável             | Padrão                                 | Descrição                         |
| -------------------- | -------------------------------------- | --------------------------------- |
| `SESSION_SECRET`     | valor de dev (apenas fora de produção) | Segredo HMAC do cookie de sessão  |
| `DEMO_USER_NAME`     | `Usuário BIX`                          | Nome exibido na dashboard         |
| `DEMO_USER_EMAIL`    | `admin@bix.com.br`                     | E-mail do usuário de demonstração |
| `DEMO_USER_PASSWORD` | `bix@2024`                             | Senha do usuário de demonstração  |

## Funcionalidades

- **Login** e **dashboard protegida**: o proxy (`src/proxy.ts`) bloqueia rotas sem sessão e a página valida a sessão de novo antes de ler os dados.
- **Filtros globais e dinâmicos** por período, contas, indústrias e estados. Todo o conteúdo (cards, gráficos e tabela) é recalculado a partir deles.
- **Filtros em cascata**: selecionar uma indústria ou um estado restringe as contas disponíveis, e vice-versa.
- **Cards** de receitas, despesas, transações pendentes e saldo total.
- **Gráfico de barras empilhadas** com a composição mensal por indústria, alternando entre despesas e receitas.
- **Gráfico de linhas** com receitas, despesas e saldo acumulado por mês.
- **Histórico de transações** com paginação e ordenação no servidor.
- **Sidebar exclusiva** da dashboard com Home e Logout. No mobile, vira um drawer.
- **Sessão e filtros persistidos sem banco de dados**.
- **Responsivo** de 320px a telas largas, com skeletons de carregamento, estados vazios e página de erro com "tentar novamente".

## Arquitetura

```
data/transactions.json        # dataset original, intocado (verificado por hash em teste)
src/
├─ app/                       # rotas: /login, /dashboard (layout, page, loading, error)
├─ proxy.ts                   # autenticação + persistência/restauração de filtros
├─ domain/                    # regras de negócio puras (sem React, sem Next)
│  ├─ transaction.ts          # schema Zod do dataset + normalização
│  ├─ filters.ts              # parse/serialize de URL e aplicação de filtros
│  ├─ filter-options.ts       # opções em cascata
│  ├─ aggregations.ts         # resumo, série mensal, composição por indústria
│  ├─ pending.ts              # regra de pendentes (ADR-001)
│  ├─ table.ts                # paginação e ordenação
│  └─ money.ts / dates.ts     # formatação em pt-BR, sempre em UTC
├─ server/                    # somente servidor (`server-only`)
│  ├─ transactions-repository.ts  # lê e valida o JSON uma vez por processo
│  ├─ dashboard-service.ts        # agregação com `'use cache'`
│  └─ env.ts                      # variáveis de ambiente validadas com Zod
├─ features/
│  ├─ auth/                   # sessão JWT, Server Actions, formulário de login
│  └─ dashboard/              # shell, filtros, cards, gráficos, tabela
└─ styles/                    # tema único, providers, registry de SSR
```

**Fluxo de uma requisição:** URL (`/dashboard?states=TX&from=…`) → `proxy.ts` (valida a sessão e salva os filtros) → `page.tsx` (Server Component: faz o parse dos search params com Zod) → `getDashboardOverview` + `getTransactionsPage` (em paralelo, cada um com seu cache) → `DashboardView` (Client Component). Uma interação altera a URL com `router.push` dentro de uma `transition`, e o servidor recalcula tudo.

## Decisões técnicas (ADRs)

### ADR-001: Regra de "transações pendentes"

O dataset não tem campo de status. Adotamos como "hoje" a **data da transação mais recente do dataset (30/11/2023)**. Transações dos **7 dias anteriores** a essa data são consideradas **pendentes de compensação**:

- aparecem no card "Transações pendentes" (quantidade e volume);
- **não** entram em receitas, despesas nem saldo;
- são marcadas como "Pendente" na tabela.

A regra fica numa função pura (`src/domain/pending.ts`) e aparece em um tooltip no card.

### ADR-002: Agregação no servidor com cache do Next.js

O `transactions.json` tem **50 mil registros (11,7 MB)** e nunca é enviado ao navegador. O repositório lê e valida o arquivo com Zod uma única vez por processo. O cliente recebe apenas alguns KB de dados agregados e uma página da tabela.

O cache usa `'use cache'` (Cache Components), com `cacheLife('hours')` e `cacheTag('transactions')`. Os argumentos de uma função com `'use cache'` formam a chave do cache, por isso ele fica **dividido em duas funções**, buscadas em paralelo:

| Função                                      | Chave do cache               | Conteúdo                            |
| ------------------------------------------- | ---------------------------- | ----------------------------------- |
| `getDashboardOverview(filters)`             | filtros                      | cards, gráficos, opções dos selects |
| `getTransactionsPage(filters, tableParams)` | filtros + página + ordenação | 10 linhas da tabela                 |

Assim, **trocar de página ou reordenar a tabela não recalcula cards e gráficos**: essa parte vem direto do cache.

**Por que paginação e não rolagem infinita:** a tabela mostra sempre ~10 linhas, com memória constante no navegador. A posição fica na URL (`?page=37`), então dá para compartilhar o link, o voltar do navegador funciona e a página sobrevive ao F5, que é o que um histórico financeiro, usado para conferência, precisa. A rolagem infinita acumula linhas na tela, exigiria virtualizar a lista e perderia a posição ao recarregar. Com um banco de dados real, a paginação por número de página daria lugar à paginação por cursor (keyset), que não degrada em páginas distantes.

Com Cache Components, `/dashboard` usa **Partial Prerendering**: o shell (sidebar e skeleton) é estático e os dados chegam por streaming.

### ADR-003: A URL como fonte de verdade e persistência dos filtros sem banco

- Os filtros e a paginação vivem na **URL**. Isso permite compartilhar links, usar voltar/avançar do navegador e renderizar no servidor sem estado duplicado no cliente.
- Search params são **não confiáveis**: o schema Zod descarta valores inválidos e inverte intervalos de data trocados.
- O `proxy.ts` grava o último estado válido (já saneado) em um cookie `HttpOnly`. Ao abrir `/dashboard` sem query, o estado é restaurado. O período é sempre explícito na URL, então "sem query" significa apenas "restaurar".

### ADR-004: Sessão sem banco de dados

A sessão é um **JWT HS256 (`jose`) em cookie `HttpOnly`, `SameSite=Lax` e `Secure` em produção**, com validade de 8 horas.

- Credenciais comparadas com `timingSafeEqual`.
- Mensagem de erro genérica, sem revelar se o e-mail existe.
- Proteção contra open redirect no `?from=`.
- O login é uma **Server Action**, e o mesmo schema Zod valida o formulário no cliente e no servidor.

### ADR-005: Material UI + styled-components

- **Material UI** fornece componentes acessíveis e maduros. Ele usa seu motor padrão (Emotion) com a integração oficial para o App Router (`@mui/material-nextjs`). O motor alternativo de styled-components do MUI tem problemas conhecidos de SSR.
- **styled-components**, exigido pelo desafio, faz toda a estilização da aplicação: layout, grids responsivos, cards e overrides visuais dos componentes MUI (`styled(Card)`).
- Os dois leem os **mesmos tokens** de `src/styles/theme.ts`, com as cores da identidade visual da BIX (`#0068A8`, `#0F1E3D`, `#334155` e fonte Roboto). Nenhuma cor fica hardcoded nos componentes.

### ADR-006: Recharts para os gráficos

Recharts gera SVG composável e leve. Os formatadores de eixo e tooltip são funções puras testadas isoladamente. Cada gráfico tem descrição textual acessível (`role="figure"`) e estado vazio.

## Qualidade e testes

- **TypeScript estrito**, com `noUncheckedIndexedAccess`.
- **ESLint + Prettier**, com Husky + lint-staged no pre-commit e commitlint (Conventional Commits).
- **Jest + Testing Library**: 132 testes com **100% de cobertura** de statements, branches, funções e linhas, garantida por `coverageThreshold`.
  - Domínio: funções puras e casos de borda (fuso, limites inclusivos, listas vazias, saldo negativo).
  - Servidor: sessão (expirada, adulterada, payload inválido), Server Actions, proxy, cache e validação de env.
  - Componentes: renderizados com os providers reais; interações com `user-event` e consultas por papel ARIA.
  - Integridade: um teste confere o **SHA-256 do `transactions.json`**, garantindo que o arquivo não foi alterado.
- **Playwright** (desktop + mobile) contra o build de produção: redirecionamento com retorno à origem, erro de login, filtros persistindo após recarregar e logout.
- **GitHub Actions**: format → lint → typecheck → cobertura → E2E.

## Deploy (Vercel)

1. Importe o repositório na Vercel. O framework é detectado automaticamente.
2. Configure `SESSION_SECRET` (e, se quiser, as variáveis `DEMO_USER_*`).
3. O dataset é incluído no bundle serverless via `outputFileTracingIncludes` em `next.config.ts`.
