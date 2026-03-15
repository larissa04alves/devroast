import { LeaderboardRow } from "@/components/ui/leaderboard-row";
import { CodeInputArea } from "./_code-input-area";

const leaderboardEntries = [
  { rank: 1, score: 1.2, codePreview: 'eval(prompt("enter code"))', language: "javascript" },
  { rank: 2, score: 1.8, codePreview: "if (x == true) { return true; }", language: "typescript" },
  { rank: 3, score: 2.1, codePreview: "SELECT * FROM users WHERE 1=1", language: "sql" },
];

export default function Home() {
  return (
    <main className="flex flex-col items-center py-16 gap-12">
      {/* ── Hero ── */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[36px] font-bold text-accent-green" aria-hidden="true">
            $
          </span>
          <h1 className="font-mono text-[36px] font-bold text-text-primary">
            paste your code. get roasted.
          </h1>
        </div>
        <p className="font-mono text-[14px] text-text-tertiary">
          {"// drop your code below and receive brutal, sarcastic feedback"}
        </p>
      </div>

      {/* ── Code editor + actions bar ── */}
      <CodeInputArea />

      {/* ── Footer hint ── */}
      <p className="font-mono text-[13px] text-text-tertiary">
        2,847 codes roasted · avg score: 4.2/10
      </p>

      {/* ── Leaderboard preview ── */}
      <section className="w-[960px] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="font-mono text-[16px] font-bold text-text-primary">
              {"// shame_leaderboard"}
            </h2>
            <p className="font-mono text-[12px] text-text-tertiary">
              {"// the worst code, immortalized forever"}
            </p>
          </div>
          <a
            href="/leaderboard"
            className="font-mono text-[13px] text-accent-green enabled:hover:text-accent-green-hover transition-colors duration-150"
          >
            {"$ view_all >>"}
          </a>
        </div>

        {/* Table */}
        <div className="border border-border-primary">
          {/* Table header */}
          <div className="grid grid-cols-[48px_64px_1fr_120px] border-b border-border-primary bg-bg-surface px-5 py-2">
            <span className="font-mono text-[11px] text-text-tertiary">rank</span>
            <span className="font-mono text-[11px] text-text-tertiary">score</span>
            <span className="font-mono text-[11px] text-text-tertiary">code_preview</span>
            <span className="font-mono text-[11px] text-text-tertiary text-right">language</span>
          </div>

          {/* Rows */}
          {leaderboardEntries.map((entry) => (
            <LeaderboardRow.Root key={entry.rank} className="last:border-b-0">
              <LeaderboardRow.Rank>#{entry.rank}</LeaderboardRow.Rank>
              <LeaderboardRow.Score value={entry.score} />
              <LeaderboardRow.Preview>{entry.codePreview}</LeaderboardRow.Preview>
              <LeaderboardRow.Language>{entry.language}</LeaderboardRow.Language>
            </LeaderboardRow.Root>
          ))}
        </div>
      </section>
    </main>
  );
}
