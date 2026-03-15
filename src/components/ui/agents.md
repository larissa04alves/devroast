# Padrões de Criação de Componentes UI

Documento de referência para agentes e desenvolvedores criarem novos componentes em `src/components/ui/`.

---

## Stack

- **tailwind-variants** (`tv`) — variantes e merge de classes
- **`cn`** (`src/lib/cn.ts`) — helper `twMerge` para merge fora do `tv()` (componentes sem variantes, classes condicionais)
- **Tailwind CSS v4** — estilização com tokens via `@theme` no `globals.css`
- **TypeScript** — tipagem estrita
- **@base-ui/react** — primitivos headless para componentes com comportamento (Switch, Select, Dialog, etc.)
- **shiki** — syntax highlight no servidor (SSR/SSG), tema `vesper`
- **NÃO usar `twMerge` diretamente** — dentro do `tv()`, usar a prop `class: className` para merge automático; fora do `tv()`, usar o helper `cn` de `@/lib/cn`

---

## Quando usar cada abordagem

### Componente puramente visual (sem estado/comportamento)
→ Implementar direto com Tailwind + `tv()`. Exemplos: `Badge`, `DiffLine`, `LeaderboardRow`.

### Componente com comportamento interativo (toggle, select, dialog, tooltip...)
→ **Usar primitivo do `@base-ui/react`** como base. Estilizar com Tailwind via `data-[state]` attributes.
→ Adicionar `"use client"` no arquivo.
→ Exemplo: `Toggle` usa `Switch.Root` + `Switch.Thumb` do Base UI.

```tsx
"use client";
import { Switch } from "@base-ui/react/switch";

// Estilizar via data attributes que o Base UI injeta:
// data-[checked] → estado ativo
// data-[disabled] → desabilitado
// data-[focus-visible] → foco por teclado
<Switch.Root className="... data-[checked]:bg-accent-green">
  <Switch.Thumb className="... data-[checked]:translate-x-4" />
</Switch.Root>
```

### Componente com syntax highlight de código
→ **Usar `shiki` com `codeToHtml`** — Server Component (sem `"use client"`).
→ Função `async`, retorna JSX com `dangerouslySetInnerHTML`.
→ Tema padrão: `vesper`.

```tsx
// Server Component — NÃO adicionar "use client"
import { codeToHtml } from "shiki";
import type { BundledLanguage } from "shiki";

async function CodeBlock({ children, lang }: { children: string; lang: BundledLanguage }) {
  const html = await codeToHtml(children, { lang, theme: "vesper" });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

### Regra crítica: Server vs Client
- **Server Components** não podem importar Client Components diretamente na árvore — mas podem recebê-los como `children` ou importar arquivos com `"use client"` (Next.js faz o boundary automaticamente).
- Se uma página precisa de ambos (ex: toggle interativo + code block SSR), **extrair o Client Component para um arquivo separado** (convenção: prefixo `_` para indicar que é um subcomponente da rota, ex: `_toggle-demo.tsx`).

---

## Design tokens disponíveis (globals.css)

Usar sempre os tokens do design system, não valores hardcoded:

| Token | Valor | Uso |
|---|---|---|
| `bg-bg-page` | `#0A0A0A` | Fundo da página |
| `bg-bg-surface` | `#0F0F0F` | Superfícies |
| `bg-bg-input` | `#111111` | Inputs, editores de código |
| `bg-bg-elevated` | `#1A1A1A` | Cards, popovers |
| `text-text-primary` | `#FAFAFA` | Texto principal |
| `text-text-secondary` | `#6B7280` | Texto secundário |
| `text-text-tertiary` | `#4B5563` | Texto terciário, metadata |
| `text-text-muted` | `#525252` | Texto muito apagado |
| `text-text-link-hover` | `#A3A3A3` | Hover de links |
| `border-border-primary` | `#2A2A2A` | Bordas padrão |
| `border-border-hover` | `#3A3A3A` | Bordas em hover |
| `border-border-focus` | `#10B981` | Foco, destaque |
| `bg-accent-green` | `#10B981` | Ação principal |
| `bg-accent-green-hover` | `#0EA571` | Hover da ação principal |
| `bg-accent-amber` | `#F59E0B` | Aviso, score médio |
| `bg-accent-red` | `#EF4444` | Erro, destrutivo |
| `bg-accent-red-hover` | `#DC2626` | Hover de destrutivo |
| `bg-accent-cyan` | `#06B6D4` | Info |
| `bg-diff-removed` | `#1A0A0A` | Background de linha removida |
| `bg-diff-added` | `#0A1A0F` | Background de linha adicionada |
| `font-mono` | `JetBrains Mono` | Toda fonte monospaced |
| `font-sans` | sistema (`ui-sans-serif`) | Texto corrido |

No Tailwind v4, os tokens do `@theme` com prefixo `--color-*` geram classes utilitárias automaticamente. Ex: `--color-accent-green` → `bg-accent-green`, `text-accent-green`, `border-accent-green`.

### Cores dinâmicas em JS (SVG stroke, style={{ color }})

Quando a cor precisa ser calculada em JS (ex: `scoreColor(score)`) e aplicada via `style={{ color }}` ou como atributo SVG (`stroke`), **usar `var(--color-*)` em vez de valores hex hardcoded**:

```tsx
// CORRETO
function scoreColor(score: number): string {
  if (score < 4) return "var(--color-accent-red)";
  if (score < 7) return "var(--color-accent-amber)";
  return "var(--color-accent-green)";
}

// ERRADO
function scoreColor(score: number): string {
  if (score < 4) return "#EF4444";
  if (score < 7) return "#F59E0B";
  return "#10B981";
}
```

O mesmo vale para o `toggle.tsx` quando o Base UI não propaga `data-[checked]` para elementos fora do Root:

```tsx
// label do Toggle — Base UI não propaga data-checked aqui
style={{ color: checked ? "var(--color-accent-green)" : "var(--color-text-secondary)" }}
```

### Regra de tipografia

- **`font-mono`** → todo texto de código, labels de UI, botões, elementos terminais
- **`font-sans`** → texto corrido, descrições, parágrafos
- **Nunca usar classes de fonte hardcoded** como `font-['JetBrains_Mono']` — usar sempre `font-mono` e `font-sans`

---

## Estrutura obrigatória de um componente

```tsx
import { tv, type VariantProps } from "tailwind-variants";
import type { <ElementHTMLAttributes> } from "react";

// 1. Definir variantes com tv()
const componentName = tv({
  base: [...],       // classes base que sempre se aplicam
  variants: { ... }, // variações visuais
  defaultVariants: { ... },
});

// 2. Tipar as variantes
type ComponentNameVariants = VariantProps<typeof componentName>;

// 3. Interface exportada — estende o elemento HTML nativo + variantes
//    Se o elemento HTML tiver props que colidem, usar Omit<>
export interface ComponentNameProps
  extends ElementHTMLAttributes<HTMLElement>,
    ComponentNameVariants {
  className?: string;
}

// 4. Named export — NUNCA default export
export function ComponentName({
  variant,
  size,
  className,
  children,
  ...props
}: ComponentNameProps) {
  return (
    <element
      className={componentName({ variant, size, class: className })}
      {...props}
    >
      {children}
    </element>
  );
}
```

---

## Regras

### Exports
- **Sempre named exports** — `export function Button` e `export interface ButtonProps`
- **Nunca `export default`**

### tailwind-variants
- Usar `tv()` para definir todas as variantes
- Passar `class: className` dentro do objeto do `tv()` — **não usar `twMerge` separadamente**
- Arrays de strings são permitidos nas variantes para melhor legibilidade

```tsx
// CORRETO
className={button({ variant, size, class: className })}

// ERRADO
className={twMerge(button({ variant, size }), className)}
```

### TypeScript
- A interface deve **sempre estender** as props nativas do elemento HTML:
  - `ButtonHTMLAttributes<HTMLButtonElement>`
  - `InputHTMLAttributes<HTMLInputElement>`
  - `HTMLAttributes<HTMLDivElement>`
- Se houver colisão de nomes de props, usar `Omit<>`:
  ```ts
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "prefix">
  ```
- Exportar sempre a interface para permitir extensão por outros componentes

### Props nativas
- Sempre fazer spread de `...props` no elemento para não bloquear atributos nativos
- Remover do spread apenas as props que já são passadas explicitamente

### Padrão visual
- Todos os textos dos botões seguem o padrão de terminal do design: `$ label`
- O prefixo `$` é padrão nas variantes `primary`, `secondary` e `link`
- Desativar com `prefix={false}` quando necessário

### Estrutura de arquivos
```
src/components/ui/
├── agents.md        # este arquivo
├── button.tsx
└── ...
```
- Um arquivo por componente
- Nome do arquivo em **kebab-case**: `icon-button.tsx`, `score-badge.tsx`
- Nome do componente em **PascalCase**: `IconButton`, `ScoreBadge`

---

## Exemplo completo — Button

```tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const button = tv({
  base: [
    "inline-flex items-center justify-center gap-2",
    "font-mono font-medium leading-none",
    "transition-colors duration-150 cursor-pointer",
    "disabled:pointer-events-none disabled:opacity-40",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page",
  ],
  variants: {
    variant: {
      primary:     ["bg-accent-green text-bg-page font-medium", "hover:bg-accent-green-hover", "focus-visible:ring-accent-green"],
      secondary:   ["bg-transparent text-text-primary font-normal border border-border-primary", "hover:bg-bg-elevated hover:border-border-hover", "focus-visible:ring-border-primary"],
      link:        ["bg-transparent text-text-secondary font-normal border border-border-primary", "hover:text-text-link-hover hover:border-border-hover", "focus-visible:ring-border-primary"],
      ghost:       ["bg-transparent text-text-primary font-normal", "hover:bg-bg-elevated", "focus-visible:ring-border-primary"],
      destructive: ["bg-accent-red text-text-primary font-medium", "hover:bg-accent-red-hover", "focus-visible:ring-accent-red"],
    },
    size: {
      sm:      "py-[6px] px-3 text-[12px]",
      compact: "py-2 px-4 text-[12px]",
      md:      "py-[10px] px-6 text-[13px]",
      lg:      "py-3.5 px-8 text-[15px]",
    },
    rounded: {
      none:    "rounded-none",
      default: "rounded-md",
      full:    "rounded-full",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    rounded: "none",
  },
});

type ButtonVariants = VariantProps<typeof button>;

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "prefix">,
    ButtonVariants {
  prefix?: string | false;
  suffix?: string;
  className?: string;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size,
  rounded,
  prefix,
  suffix,
  className,
  children,
  ...props
}: ButtonProps) {
  const defaultPrefix =
    prefix === false
      ? null
      : prefix ?? (variant === "primary" || variant === "secondary" || variant === "link")
        ? "$"
        : null;

  return (
    <button className={button({ variant, size, rounded, class: className })} {...props}>
      {defaultPrefix && <span aria-hidden="true">{defaultPrefix}</span>}
      {children}
      {suffix && <span aria-hidden="true">{suffix}</span>}
    </button>
  );
}
```

---

## Checklist antes de criar um componente

- [ ] Tokens do design system usados — **sem hex hardcoded** (use classes Tailwind ou `var(--color-*)` para casos dinâmicos em JS)
- [ ] `tv()` com `base`, `variants` e `defaultVariants`
- [ ] Interface exportada que estende o elemento HTML nativo (com `Omit<>` se necessário)
- [ ] `class: className` dentro do `tv()` — sem `twMerge`
- [ ] Spread de `...props` no elemento raiz
- [ ] Named export (`export function`, `export interface`)
- [ ] Arquivo em kebab-case, componente em PascalCase
- [ ] Adicionado à página `/components` para visualização
