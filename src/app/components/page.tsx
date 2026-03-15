import { AnalysisCard } from "@/components/ui/analysis-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { LeaderboardRow } from "@/components/ui/leaderboard-row";
import { ScoreRing } from "@/components/ui/score-ring";
import { ToggleDemo } from "./_toggle-demo";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-text-tertiary">
        <span className="text-accent-green">{"// "}</span>
        {title}
      </h2>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-mono text-base font-bold text-text-primary">
        <span className="text-accent-green">{"// "}</span>
        {label}
      </span>
      <div className="h-px flex-1 bg-border-primary" />
    </div>
  );
}

const SAMPLE_CODE = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}`;

const SAMPLE_CODE_TS = `async function fetchRoast(code: string): Promise<Roast> {
  const response = await fetch("/api/roast", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  if (!response.ok) throw new Error("roast failed");
  return response.json();
}`;

export default async function ComponentsPage() {
  return (
    <main className="min-h-screen bg-bg-page px-20 py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-16">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="font-mono text-2xl font-bold text-text-primary">
            <span className="text-accent-green">{"// "}</span>
            component_library
          </h1>
          <p className="font-sans text-sm text-text-secondary">
            showcase de todos os componentes e variantes disponíveis
          </p>
        </div>

        {/* ── Button ───────────────────────────────────────── */}
        <div className="flex flex-col gap-8">
          <Divider label="buttons" />
          <Section title="variant">
            <Button variant="primary">roast_my_code</Button>
            <Button variant="secondary">share_roast</Button>
            <Button variant="link" suffix=">>">
              view_all
            </Button>
            <Button variant="ghost">ghost</Button>
            <Button variant="destructive">delete</Button>
          </Section>
          <Section title="size">
            <Button size="sm" variant="link" suffix=">>">
              view_all
            </Button>
            <Button size="compact" variant="secondary">
              share_roast
            </Button>
            <Button size="md">roast_my_code</Button>
            <Button size="lg">roast_my_code</Button>
          </Section>
          <Section title="rounded + prefix=false">
            <Button rounded="full">rounded full</Button>
            <Button rounded="default">rounded default</Button>
            <Button prefix={false} variant="secondary">
              no prefix
            </Button>
          </Section>
        </div>

        {/* ── Badge ────────────────────────────────────────── */}
        <div className="flex flex-col gap-8">
          <Divider label="badge_status" />
          <Section title="variant">
            <Badge.Root variant="critical">
              <Badge.Label>critical</Badge.Label>
            </Badge.Root>
            <Badge.Root variant="warning">
              <Badge.Label>warning</Badge.Label>
            </Badge.Root>
            <Badge.Root variant="good">
              <Badge.Label>good</Badge.Label>
            </Badge.Root>
            <Badge.Root variant="verdict">
              <Badge.Label>needs_serious_help</Badge.Label>
            </Badge.Root>
          </Section>
        </div>

        {/* ── Toggle ───────────────────────────────────────── */}
        <div className="flex flex-col gap-8">
          <Divider label="toggle" />
          <Section title="on / off / disabled">
            <ToggleDemo />
          </Section>
        </div>

        {/* ── Analysis Card ────────────────────────────────── */}
        <div className="flex flex-col gap-8">
          <Divider label="cards" />
          <Section title="severity">
            <AnalysisCard.Root className="max-w-sm">
              <AnalysisCard.Badge variant="critical" />
              <AnalysisCard.Title>using var instead of const/let</AnalysisCard.Title>
              <AnalysisCard.Description>
                the var keyword is function-scoped rather than block-scoped, which can lead to
                unexpected behavior and bugs. modern javascript uses const for immutable bindings
                and let for mutable ones.
              </AnalysisCard.Description>
            </AnalysisCard.Root>
            <AnalysisCard.Root className="max-w-sm">
              <AnalysisCard.Badge variant="warning" />
              <AnalysisCard.Title>missing error handling</AnalysisCard.Title>
              <AnalysisCard.Description>
                async functions without try/catch can cause unhandled promise rejections. always
                handle errors explicitly.
              </AnalysisCard.Description>
            </AnalysisCard.Root>
            <AnalysisCard.Root className="max-w-sm">
              <AnalysisCard.Badge variant="good" />
              <AnalysisCard.Title>consistent naming convention</AnalysisCard.Title>
              <AnalysisCard.Description>
                variable names follow camelCase consistently throughout the file.
              </AnalysisCard.Description>
            </AnalysisCard.Root>
          </Section>
        </div>

        {/* ── Code Block ───────────────────────────────────── */}
        <div className="flex flex-col gap-8">
          <Divider label="code_block" />
          <Section title="javascript">
            <CodeBlock.Root className="w-[560px]">
              <CodeBlock.Header>
                <span className="font-mono text-[12px] text-text-tertiary">calculate.js</span>
              </CodeBlock.Header>
              <CodeBlock.Code lang="javascript">{SAMPLE_CODE}</CodeBlock.Code>
            </CodeBlock.Root>
          </Section>
          <Section title="typescript">
            <CodeBlock.Root className="w-[560px]">
              <CodeBlock.Header>
                <span className="font-mono text-[12px] text-text-tertiary">roast.ts</span>
              </CodeBlock.Header>
              <CodeBlock.Code lang="typescript">{SAMPLE_CODE_TS}</CodeBlock.Code>
            </CodeBlock.Root>
          </Section>
        </div>

        {/* ── Diff Line ────────────────────────────────────── */}
        <div className="flex flex-col gap-8">
          <Divider label="diff_line" />
          <Section title="removed / added / context">
            <div className="w-[560px]">
              <DiffLine variant="removed" code="var total = 0;" />
              <DiffLine variant="added" code="const total = 0;" />
              <DiffLine variant="context" code="for (let i = 0; i < items.length; i++) {" />
            </div>
          </Section>
        </div>

        {/* ── Leaderboard Row ──────────────────────────────── */}
        <div className="flex flex-col gap-8">
          <Divider label="table_row" />
          <Section title="scores">
            <div className="w-full border border-border-primary">
              <LeaderboardRow.Root>
                <LeaderboardRow.Rank>#1</LeaderboardRow.Rank>
                <LeaderboardRow.Score value={2.1} />
                <LeaderboardRow.Preview>
                  function calculateTotal(items) {"{ var total = 0; ..."}
                </LeaderboardRow.Preview>
                <LeaderboardRow.Language>javascript</LeaderboardRow.Language>
              </LeaderboardRow.Root>
              <LeaderboardRow.Root>
                <LeaderboardRow.Rank>#2</LeaderboardRow.Rank>
                <LeaderboardRow.Score value={4.8} />
                <LeaderboardRow.Preview>
                  async function fetchData(url) {"{ const res = await fetch..."}
                </LeaderboardRow.Preview>
                <LeaderboardRow.Language>typescript</LeaderboardRow.Language>
              </LeaderboardRow.Root>
              <LeaderboardRow.Root>
                <LeaderboardRow.Rank>#3</LeaderboardRow.Rank>
                <LeaderboardRow.Score value={7.3} />
                <LeaderboardRow.Preview>
                  {"const reducer = (state, action) => { switch(action.type)..."}
                </LeaderboardRow.Preview>
                <LeaderboardRow.Language>javascript</LeaderboardRow.Language>
              </LeaderboardRow.Root>
            </div>
          </Section>
        </div>

        {/* ── Score Ring ───────────────────────────────────── */}
        <div className="flex flex-col gap-8">
          <Divider label="score_ring" />
          <Section title="faixas de score">
            <ScoreRing score={2.1} />
            <ScoreRing score={4.8} />
            <ScoreRing score={7.3} />
          </Section>
          <Section title="tamanhos">
            <ScoreRing score={3.5} size={120} />
            <ScoreRing score={3.5} size={180} />
            <ScoreRing score={3.5} size={240} />
          </Section>
        </div>
      </div>
    </main>
  );
}
