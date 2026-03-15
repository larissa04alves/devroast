import type { SVGAttributes } from "react";
import { cn } from "@/lib/cn";

/** Converte score (0–10) para CSS variable de cor:
 *  0–3.9 → vermelho, 4–6.9 → amber, 7–10 → verde */
function scoreColor(score: number): string {
  if (score < 4) return "var(--color-accent-red)";
  if (score < 7) return "var(--color-accent-amber)";
  return "var(--color-accent-green)";
}

export interface ScoreRingProps extends Omit<SVGAttributes<SVGSVGElement>, "children"> {
  /** Score de 0 a 10 */
  score: number;
  /** Tamanho do componente em px (default: 180) */
  size?: number;
  className?: string;
}

export function ScoreRing({ score, size = 180, className, ...props }: ScoreRingProps) {
  const clampedScore = Math.min(10, Math.max(0, score));
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Fração do arco preenchido (0–1)
  const fraction = clampedScore / 10;
  const dashArray = `${fraction * circumference} ${circumference}`;

  const color = scoreColor(clampedScore);

  // O arco começa no topo: rotate -90deg via transform
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        aria-label={`score: ${score}/10`}
        {...props}
      >
        {/* outer ring — trilho */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="var(--color-border-primary)"
          strokeWidth={strokeWidth}
        />
        {/* arc preenchido — começa no topo */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeDasharray={dashArray}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>

      {/* score no centro */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span
          className="font-mono font-bold leading-none text-text-primary"
          style={{ fontSize: size * 0.267 }} // ~48px para size=180
        >
          {clampedScore % 1 === 0 ? clampedScore.toFixed(1) : clampedScore}
        </span>
        <span
          className="font-mono leading-none text-text-tertiary"
          style={{ fontSize: size * 0.089 }} // ~16px para size=180
        >
          /10
        </span>
      </div>
    </div>
  );
}
