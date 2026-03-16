# Spec: Drizzle ORM + PostgreSQL

## Context

O DevRoast precisa persistir submissões de código e seus resultados de roast para:
1. Exibir o **Shame Leaderboard** (as piores notas, imortalizadas para sempre)
2. Mostrar **estatísticas globais** (total de códigos avaliados, média de score)
3. Servir a **página de resultado** de cada roast via URL compartilhável (`/roast/[id]`)
4. Gerar o **OG Image** dinâmico por roast (`/roast/[id]/og`)

Stack: **Drizzle ORM** + **PostgreSQL** (via Docker Compose) + **Bun**

---

## Screens mapeadas (fonte: devroast.pen)

| Screen | Dados necessários do banco |
|--------|---------------------------|
| Screen 1 — Code Input | `COUNT(*)`, `AVG(score)` de `roasts` |
| Screen 2 — Roast Results | `roasts` row completo + `roast_issues` via join |
| Screen 3 — Shame Leaderboard | `roasts` ordenados por `score ASC`, com rank, `LEFT(code, 80)`, `language`, `line_count` |
| Screen 4 — OG Image | `roasts.score`, `roasts.verdict`, `roasts.roastQuote`, `roasts.language`, `roasts.lineCount` |

---

## Convenção de nomes: `casing: 'snake_case'`

O Drizzle converte automaticamente as chaves JS (camelCase) para nomes de coluna snake_case no banco. Isso elimina a necessidade de passar a string do nome da coluna explicitamente.

```ts
// SEM casing — duplicação
score:       numeric('score', { precision: 3, scale: 1 }).notNull(),
roastQuote:  text('roast_quote').notNull(),

// COM casing: 'snake_case' — uma só vez
score:      numeric({ precision: 3, scale: 1 }).notNull(),
roastQuote: text().notNull(),   // → coluna "roast_quote" no banco
```

A config `casing` deve ser declarada em dois lugares:
1. `drizzle.config.ts` → `casing: 'snake_case'`
2. Instância do drizzle em `src/db/index.ts` → `drizzle(client, { casing: 'snake_case' })`

---

## Enums

Os valores de `languageEnum` devem ser os mesmos IDs usados em `src/lib/use-language-detection.ts` (chaves de `HLJS_TO_SHIKI`). O alias `shell → bash` do hook não vira valor distinto no enum — `shell` é bash.

```ts
// src/db/schema.ts

export const verdictEnum = pgEnum('verdict', [
  'good_enough',        // score 8–10
  'could_be_worse',     // score 6–7.9
  'needs_work',         // score 4–5.9
  'yikes',              // score 2–3.9
  'needs_serious_help', // score 0–1.9
])

export const severityEnum = pgEnum('severity', [
  'good',
  'warning',
  'critical',
])

export const languageEnum = pgEnum('language', [
  'javascript',
  'typescript',
  'python',
  'rust',
  'go',
  'java',
  'c',
  'cpp',
  'csharp',
  'php',
  'ruby',
  'sql',
  'html',
  'xml',
  'css',
  'bash',
  'json',
  'yaml',
  'markdown',
  'swift',
  'kotlin',
  'scala',
  'r',
  'perl',
  'lua',
])
```

> **Atenção:** ao adicionar linguagens em `use-language-detection.ts`, adicionar aqui também e gerar uma nova migration.

---

## Tabelas

### `roasts`

Tabela principal. Cada linha representa uma submissão de código e o resultado completo do roast.

```ts
export const roasts = pgTable('roasts', {
  id:           uuid().defaultRandom().primaryKey(),
  createdAt:    timestamp({ withTimezone: true }).defaultNow().notNull(),

  // código submetido
  code:         text().notNull(),
  language:     languageEnum().notNull(),
  lineCount:    integer().notNull(),

  // resultado do roast (gerado pela IA)
  score:        numeric({ precision: 3, scale: 1 }).notNull(), // 0.0 – 10.0
  verdict:      verdictEnum().notNull(),
  roastQuote:   text().notNull(),   // a frase sarcástica principal

  // diff sugerido pela IA (patch unificado — null se não aplicável)
  suggestedDiff: text(),
}, (t) => [
  index('idx_roasts_score').on(t.score),
])
```

**Índice:**
- `idx_roasts_score` em `score ASC` — necessário para o leaderboard (`ORDER BY score ASC`); sem ele, full scan a cada request

---

### `roast_issues`

Feedback item-a-item gerado pela IA. Cada `roasts` tem N issues.

Mapeado direto do componente **Issue Card** no Screen 2 (campos `severity`, `title`, `description`).

```ts
export const roastIssues = pgTable('roast_issues', {
  id:          uuid().defaultRandom().primaryKey(),
  roastId:     uuid().notNull().references(() => roasts.id, { onDelete: 'cascade' }),

  severity:    severityEnum().notNull(),              // critical | warning | good
  title:       varchar({ length: 120 }).notNull(),
  description: text().notNull(),

  // linha(s) do código original a que o issue se refere (opcional)
  lineStart:   integer(),
  lineEnd:     integer(),

  sortOrder:   smallint().notNull().default(0),       // controla a ordem no Issues Grid
}, (t) => [
  index('idx_roast_issues_roast_id').on(t.roastId),
])
```

**Índice:**
- `idx_roast_issues_roast_id` em `roastId` — necessário para o join `roast_issues.roast_id = roasts.id`

---

## Queries

Sem `relations` nativas do Drizzle. Todas as queries usam `db.select()` com joins explícitos.

### `getLeaderboard(limit)`

```ts
import { asc, sql } from 'drizzle-orm'

export async function getLeaderboard(limit = 10) {
  return db
    .select({
      id:       roasts.id,
      score:    roasts.score,
      verdict:  roasts.verdict,
      language: roasts.language,
      lineCount: roasts.lineCount,
      codePreview: sql<string>`LEFT(${roasts.code}, 80)`,
    })
    .from(roasts)
    .orderBy(asc(roasts.score))
    .limit(limit)
}
```

### `getRoastById(id)`

```ts
import { eq, asc } from 'drizzle-orm'

export async function getRoastById(id: string) {
  const rows = await db
    .select({
      // roast fields
      roastId:       roasts.id,
      createdAt:     roasts.createdAt,
      code:          roasts.code,
      language:      roasts.language,
      lineCount:     roasts.lineCount,
      score:         roasts.score,
      verdict:       roasts.verdict,
      roastQuote:    roasts.roastQuote,
      suggestedDiff: roasts.suggestedDiff,
      // issue fields
      issueId:       roastIssues.id,
      severity:      roastIssues.severity,
      title:         roastIssues.title,
      description:   roastIssues.description,
      lineStart:     roastIssues.lineStart,
      lineEnd:       roastIssues.lineEnd,
      sortOrder:     roastIssues.sortOrder,
    })
    .from(roasts)
    .leftJoin(roastIssues, eq(roastIssues.roastId, roasts.id))
    .where(eq(roasts.id, id))
    .orderBy(asc(roastIssues.sortOrder))

  if (rows.length === 0) return null

  // Agrupar: primeiro row tem os dados do roast; todos os rows têm as issues
  const { roastId, createdAt, code, language, lineCount, score, verdict, roastQuote, suggestedDiff } = rows[0]
  const issues = rows
    .filter((r) => r.issueId !== null)
    .map(({ issueId, severity, title, description, lineStart, lineEnd, sortOrder }) => ({
      id: issueId!, severity: severity!, title: title!, description: description!,
      lineStart, lineEnd, sortOrder: sortOrder!,
    }))

  return { id: roastId, createdAt, code, language, lineCount, score, verdict, roastQuote, suggestedDiff, issues }
}
```

### `createRoast(data)`

```ts
import { db } from './index'

export async function createRoast(data: {
  code: string
  language: typeof languageEnum.enumValues[number]
  lineCount: number
  score: string        // string para numeric — ex: '3.5'
  verdict: typeof verdictEnum.enumValues[number]
  roastQuote: string
  suggestedDiff?: string
  issues: Array<{
    severity: typeof severityEnum.enumValues[number]
    title: string
    description: string
    lineStart?: number
    lineEnd?: number
    sortOrder: number
  }>
}) {
  return db.transaction(async (tx) => {
    const [roast] = await tx
      .insert(roasts)
      .values({
        code:         data.code,
        language:     data.language,
        lineCount:    data.lineCount,
        score:        data.score,
        verdict:      data.verdict,
        roastQuote:   data.roastQuote,
        suggestedDiff: data.suggestedDiff ?? null,
      })
      .returning({ id: roasts.id })

    if (data.issues.length > 0) {
      await tx.insert(roastIssues).values(
        data.issues.map((issue) => ({ ...issue, roastId: roast.id }))
      )
    }

    return roast.id
  })
}
```

### `getStats()`

```ts
import { count, avg, sql } from 'drizzle-orm'

export async function getStats() {
  const [row] = await db
    .select({
      total:    count(),
      avgScore: avg(roasts.score),
    })
    .from(roasts)

  return {
    total:    Number(row.total),
    avgScore: row.avgScore ? Number(row.avgScore).toFixed(1) : null,
  }
}
```

---

## Docker Compose

```yaml
# docker-compose.yml (raiz do projeto)
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER:     devroast
      POSTGRES_PASSWORD: devroast
      POSTGRES_DB:       devroast
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Variáveis de ambiente

Criar `.env.local` (nunca commitar):

```bash
DATABASE_URL="postgresql://devroast:devroast@localhost:5432/devroast"
```

---

## Estrutura de arquivos

```
src/
└── db/
    ├── index.ts          # instância do drizzle + conexão
    ├── schema.ts         # enums + tabelas
    ├── queries.ts        # getLeaderboard, getRoastById, createRoast, getStats
    └── migrations/       # gerado pelo drizzle-kit
drizzle.config.ts         # config do drizzle-kit (com casing: 'snake_case')
docker-compose.yml        # sobe o PostgreSQL local
.env.local                # DATABASE_URL (não commitar)
```

---

## To-dos de implementação

### Setup

- [ ] Instalar dependências:
  ```bash
  bun add drizzle-orm postgres
  bun add -d drizzle-kit
  ```
- [ ] Criar `docker-compose.yml` na raiz
- [ ] Criar `.env.local` com `DATABASE_URL`
- [ ] Criar `drizzle.config.ts`:
  ```ts
  import { defineConfig } from 'drizzle-kit'

  export default defineConfig({
    schema:   './src/db/schema.ts',
    out:      './src/db/migrations',
    dialect:  'postgresql',
    casing:   'snake_case',
    dbCredentials: {
      url: process.env.DATABASE_URL!,
    },
  })
  ```
- [ ] Adicionar scripts no `package.json`:
  ```json
  "db:generate": "drizzle-kit generate",
  "db:migrate":  "drizzle-kit migrate",
  "db:studio":   "drizzle-kit studio",
  "db:push":     "drizzle-kit push"
  ```

### Schema

- [ ] Criar `src/db/schema.ts` com os enums `verdictEnum`, `severityEnum`, `languageEnum`
- [ ] Tabela `roasts` com índice em `score`
- [ ] Tabela `roast_issues` com FK e índice em `roastId`

### Conexão

- [ ] Criar `src/db/index.ts`:
  ```ts
  import { drizzle } from 'drizzle-orm/postgres-js'
  import postgres from 'postgres'
  import * as schema from './schema'

  const client = postgres(process.env.DATABASE_URL!)
  export const db = drizzle(client, { schema, casing: 'snake_case' })
  ```

### Migrations

- [ ] `docker compose up -d`
- [ ] `bun run db:generate`
- [ ] `bun run db:migrate`

### Queries

- [ ] Criar `src/db/queries.ts` com `getLeaderboard`, `getRoastById`, `createRoast`, `getStats`

### Server Actions / API Routes

- [ ] `POST /api/roast` — recebe `{ code, language }`, chama IA, chama `createRoast`, retorna `roast.id`
- [ ] `GET /roast/[id]` — Server Component que chama `getRoastById`
- [ ] `GET /roast/[id]/og` — OG Image com `score`, `verdict`, `roastQuote`
- [ ] `GET /leaderboard` — Server Component que chama `getLeaderboard`

---

## Notas de design

- **`score`** usa `numeric(3,1)` para evitar float imprecision. Sempre converter para `Number()` antes de exibir.
- **`verdict`** é derivado do score pela IA, salvo explicitamente para evitar aritmética nas queries de filtro/leaderboard.
- **`roastQuote`** é exibida no Screen 2 (Roast Summary) e no OG Image do Screen 4.
- **`suggestedDiff`** é `null` quando a IA não gera sugestão (ex: código muito curto ou irrecuperável).
- **`codePreview`** no leaderboard usa `LEFT(code, 80)` na query — sem coluna separada no banco.
- **`sortOrder`** em `roast_issues` permite que a IA retorne os issues já na ordem correta (`critical` primeiro no Issues Grid do Screen 2).
- **Não usar `db.query.*`** (require-driven API do Drizzle que depende de `relations`). Usar sempre `db.select().from().leftJoin()`.
