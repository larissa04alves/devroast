import { asc, avg, count, eq, sql } from "drizzle-orm";
import { db } from "./index";
import {
  type languageEnum,
  roastIssues,
  roasts,
  type severityEnum,
  type verdictEnum,
} from "./schema";

export async function getLeaderboard(limit = 10) {
  return db
    .select({
      id: roasts.id,
      score: roasts.score,
      verdict: roasts.verdict,
      language: roasts.language,
      lineCount: roasts.lineCount,
      codePreview: sql<string>`LEFT(${roasts.code}, 80)`,
    })
    .from(roasts)
    .orderBy(asc(roasts.score))
    .limit(limit);
}

export async function getRoastById(id: string) {
  const rows = await db
    .select({
      roastId: roasts.id,
      createdAt: roasts.createdAt,
      code: roasts.code,
      language: roasts.language,
      lineCount: roasts.lineCount,
      score: roasts.score,
      verdict: roasts.verdict,
      roastQuote: roasts.roastQuote,
      suggestedDiff: roasts.suggestedDiff,
      issueId: roastIssues.id,
      severity: roastIssues.severity,
      title: roastIssues.title,
      description: roastIssues.description,
      lineStart: roastIssues.lineStart,
      lineEnd: roastIssues.lineEnd,
      sortOrder: roastIssues.sortOrder,
    })
    .from(roasts)
    .leftJoin(roastIssues, eq(roastIssues.roastId, roasts.id))
    .where(eq(roasts.id, id))
    .orderBy(asc(roastIssues.sortOrder));

  if (rows.length === 0) return null;

  const {
    roastId,
    createdAt,
    code,
    language,
    lineCount,
    score,
    verdict,
    roastQuote,
    suggestedDiff,
  } = rows[0];
  const issues = rows
    .filter((r) => r.issueId !== null)
    .map(({ issueId, severity, title, description, lineStart, lineEnd, sortOrder }) => ({
      // biome-ignore lint/style/noNonNullAssertion: rows are pre-filtered to non-null issueId
      id: issueId!,
      // biome-ignore lint/style/noNonNullAssertion: rows are pre-filtered to non-null issueId
      severity: severity!,
      // biome-ignore lint/style/noNonNullAssertion: rows are pre-filtered to non-null issueId
      title: title!,
      // biome-ignore lint/style/noNonNullAssertion: rows are pre-filtered to non-null issueId
      description: description!,
      lineStart,
      lineEnd,
      // biome-ignore lint/style/noNonNullAssertion: rows are pre-filtered to non-null issueId
      sortOrder: sortOrder!,
    }));

  return {
    id: roastId,
    createdAt,
    code,
    language,
    lineCount,
    score,
    verdict,
    roastQuote,
    suggestedDiff,
    issues,
  };
}

export async function createRoast(data: {
  code: string;
  language: (typeof languageEnum.enumValues)[number];
  lineCount: number;
  score: string;
  verdict: (typeof verdictEnum.enumValues)[number];
  roastQuote: string;
  suggestedDiff?: string;
  issues: Array<{
    severity: (typeof severityEnum.enumValues)[number];
    title: string;
    description: string;
    lineStart?: number;
    lineEnd?: number;
    sortOrder: number;
  }>;
}) {
  return db.transaction(async (tx) => {
    const [roast] = await tx
      .insert(roasts)
      .values({
        code: data.code,
        language: data.language,
        lineCount: data.lineCount,
        score: data.score,
        verdict: data.verdict,
        roastQuote: data.roastQuote,
        suggestedDiff: data.suggestedDiff ?? null,
      })
      .returning({ id: roasts.id });

    if (data.issues.length > 0) {
      await tx
        .insert(roastIssues)
        .values(data.issues.map((issue) => ({ ...issue, roastId: roast.id })));
    }

    return roast.id;
  });
}

export async function getStats() {
  const [row] = await db
    .select({
      total: count(),
      avgScore: avg(roasts.score),
    })
    .from(roasts);

  return {
    total: Number(row.total),
    avgScore: row.avgScore ? Number(row.avgScore).toFixed(1) : null,
  };
}
