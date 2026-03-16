import {
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const verdictEnum = pgEnum("verdict", [
  "good_enough",
  "could_be_worse",
  "needs_work",
  "yikes",
  "needs_serious_help",
]);

export const severityEnum = pgEnum("severity", ["good", "warning", "critical"]);

export const languageEnum = pgEnum("language", [
  "javascript",
  "typescript",
  "python",
  "rust",
  "go",
  "java",
  "c",
  "cpp",
  "csharp",
  "php",
  "ruby",
  "sql",
  "html",
  "xml",
  "css",
  "bash",
  "json",
  "yaml",
  "markdown",
  "swift",
  "kotlin",
  "scala",
  "r",
  "perl",
  "lua",
]);

export const roasts = pgTable(
  "roasts",
  {
    id: uuid().defaultRandom().primaryKey(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),

    code: text().notNull(),
    language: languageEnum().notNull(),
    lineCount: integer().notNull(),

    score: numeric({ precision: 3, scale: 1 }).notNull(),
    verdict: verdictEnum().notNull(),
    roastQuote: text().notNull(),

    suggestedDiff: text(),
  },
  (t) => [index("idx_roasts_score").on(t.score)]
);

export const roastIssues = pgTable(
  "roast_issues",
  {
    id: uuid().defaultRandom().primaryKey(),
    roastId: uuid()
      .notNull()
      .references(() => roasts.id, { onDelete: "cascade" }),

    severity: severityEnum().notNull(),
    title: varchar({ length: 120 }).notNull(),
    description: text().notNull(),

    lineStart: integer(),
    lineEnd: integer(),

    sortOrder: smallint().notNull().default(0),
  },
  (t) => [index("idx_roast_issues_roast_id").on(t.roastId)]
);
