// Server Component — NÃO adicionar "use client"
// Usa Shiki para syntax highlight no servidor (SSR/SSG)

import type { HTMLAttributes } from "react";
import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import { cn } from "@/lib/cn";

// ── Root ──────────────────────────────────────────────────────────────────────

export interface CodeBlockRootProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

function Root({ className, children, ...props }: CodeBlockRootProps) {
  return (
    <div
      className={cn("flex flex-col overflow-hidden border border-border-primary", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────

export interface CodeBlockHeaderProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

function Header({ className, children, ...props }: CodeBlockHeaderProps) {
  return (
    <div
      className={cn(
        "flex h-10 shrink-0 items-center gap-3 border-b border-border-primary bg-bg-input px-4",
        className
      )}
      {...props}
    >
      <span className="size-[10px] rounded-full bg-accent-red" aria-hidden="true" />
      <span className="size-[10px] rounded-full bg-accent-amber" aria-hidden="true" />
      <span className="size-[10px] rounded-full bg-accent-green" aria-hidden="true" />
      {/* spacer + slot para filename ou outros filhos */}
      <div className="flex flex-1 items-center justify-end">{children}</div>
    </div>
  );
}

// ── Code (async — Server Component) ──────────────────────────────────────────

export interface CodeBlockCodeProps {
  /** Código a ser highlightado */
  children: string;
  /** Linguagem para syntax highlight */
  lang: BundledLanguage;
  className?: string;
}

async function Code({ children, lang, className }: CodeBlockCodeProps) {
  const html = await codeToHtml(children, { lang, theme: "vesper" });

  return (
    <div
      className={cn(
        "[&>pre]:m-0 [&>pre]:overflow-x-auto [&>pre]:p-4",
        "[&>pre]:font-mono [&>pre]:text-[13px] [&>pre]:leading-relaxed",
        className
      )}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML gerado pelo Shiki é seguro (sem input de usuário aqui)
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ── Namespace export ──────────────────────────────────────────────────────────

export const CodeBlock = { Root, Header, Code };
