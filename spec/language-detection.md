# Spec: Language Detection + Manual Selection

## Context

The code editor (`CodeEditor`) currently receives `lang` as a hardcoded prop
(`lang="javascript"` in `_code-input-area.tsx`). There is no automatic detection
and no way for the user to change the language manually.

The goal is to:
1. Automatically detect the language from the pasted code
2. Allow the user to override it manually via a dropdown in the action bar
3. Reflect the active language in the Shiki highlight

---

## Current State

```
_code-input-area.tsx
  └─ CodeEditor lang="javascript"  // hardcoded, never changes
```

**Problem in `CodeEditor`:** the first `useEffect` that creates the highlighter
runs only once (`deps: []`) and loads only the initial lang. Changing `lang` via
prop does not reload the highlighter, so `codeToHtml` will fail silently for any
language not preloaded. This needs a fix regardless of which detection option is
chosen.

---

## Options

### Option A — linguist-js (current proposal)

**How it works:**  
`linguist-js` is a JS port of GitHub Linguist. It analyses files by extension,
shebang, modeline, and content heuristics. For pasted code (no filename), you
pass a fake filename without extension (`codepaste`) and rely on shebang/modeline
detection only. For code without those markers, it returns `null` and a
heuristic fallback (keyword matching) is needed.

**Install:** already added to `dependencies` (`linguist-js@2.9.2`).

**API for in-browser use:**
```ts
import linguist from 'linguist-js'

const { files } = await linguist(['codepaste'], {
  fileContent: [code],
  quick: false,  // enables shebang + modeline detection
  offline: true, // uses bundled data, no network fetch
})
const detected = files.results['codepaste'] // e.g. "Python" | null
```

**Pros:**
- Same data as GitHub — familiar and accurate when it detects
- Already installed
- Offline mode works with bundled language data

**Cons:**
- Requires a filename with extension to detect most languages reliably;
  without extension, only shebang/modeline works
- For typical pasted code (no shebang, no modeline), it returns `null`
  and you need a separate heuristic fallback anyway
- Package size: 249 kB unpacked + 8 transitive deps (designed for CLI/Node use)
- Not designed for browser/edge — uses `cross-fetch`, `node-cache`, file system
  APIs; needs testing in Next.js client bundle
- Returns language names like `"JavaScript"` (Linguist canonical), not Shiki
  IDs like `"javascript"` — requires a manual mapping table

**Verdict:** good if the user always provides a shebang. For general code paste
(the primary use case of DevRoast), it falls back to `null` too often and adds
considerable bundle overhead.

---

### Option B — highlight.js autodetect

**How it works:**  
`highlight.js` has a built-in `highlightAuto` function that scores every
registered language and returns the best match along with a confidence
relevance score.

```ts
import hljs from 'highlight.js/lib/core'
// register only the langs you want to support
import javascript from 'highlight.js/lib/languages/javascript'
hljs.registerLanguage('javascript', javascript)

const result = hljs.highlightAuto(code)
result.language  // 'javascript'
result.relevance // numeric confidence score
```

**Pros:**
- Designed for content-based detection (no filename needed)
- Works entirely offline, no file system APIs
- Tree-shakeable: import only the ~20 most common languages (~40 kB for a
  focused subset)
- Reliable for the top 10-15 languages; used in production by many editors

**Cons:**
- Adds a second highlighting library alongside Shiki; only used for detection,
  not for rendering
- Relevance score can be low for short snippets (< 10 lines)
- Returns hljs language IDs (mostly match Shiki IDs, but a small mapping is
  still needed for edge cases like `csharp` vs `cs`)

**Verdict:** solid for content-only detection. The dual-library concern is real
but the imported subset stays small. No need for a fallback heuristic.

---

### Option C — @vscode/vscode-languagedetection (recommended)

**How it works:**  
Microsoft's official language detection model extracted from VS Code. Uses a
neural network (ONNX runtime via `@vscode/wasm`) trained on GitHub data to
classify code snippets by content alone.

```ts
import { ModelOperations } from '@vscode/vscode-languagedetection'

const ops = new ModelOperations()
const result = await ops.runModel(code)
// result: [{ languageId: 'javascript', confidence: 0.97 }, ...]
```

**Pros:**
- Highest accuracy for pasted code without filename or shebang — exactly the
  DevRoast use case
- Returns VS Code language IDs which map 1:1 to Shiki IDs for all common
  languages
- No filename needed, pure content-based
- Confidence score allows setting a minimum threshold (e.g. skip if < 0.5)
- Ships a WASM bundle that runs in the browser with no server call

**Cons:**
- Larger initial payload: WASM model ~3 MB (loaded once, cached)
- First detection call takes ~100–200 ms (WASM init); subsequent calls are fast
- Requires dynamic import / lazy loading to avoid blocking initial render

**Verdict:** best accuracy for the exact use case (pasted code, no context).
The 3 MB WASM cost is acceptable with lazy loading. This is what VS Code itself
uses.

---

### Option D — franc

**How it works:**  
Statistical n-gram model. Designed primarily for natural language detection but
has a `franc-all` variant with programming language support.

**Pros:**
- Tiny bundle (~8 kB)
- Works offline, no deps

**Cons:**
- Poor accuracy for programming languages — it was built for human languages
- Does not return Shiki-compatible IDs
- Not suitable as a primary detector; only useful as a last-resort fallback

**Verdict:** not recommended for this use case.

---

## Comparison Table

| Option                          | Accuracy (no filename) | Bundle size | Requires filename | Returns Shiki IDs | Network |
|---------------------------------|------------------------|-------------|-------------------|-------------------|---------|
| A — linguist-js                 | Low (shebang only)     | ~250 kB     | Strongly yes      | No (needs map)    | Optional (offline mode) |
| B — highlight.js autodetect     | Medium–High            | ~40 kB      | No                | Mostly yes        | No |
| C — @vscode/vscode-languagedetection | High              | ~3 MB WASM  | No                | Yes               | No |
| D — franc                       | Low                    | ~8 kB       | No                | No                | No |

---

## Recommended Approach

**Option C** for detection + **Option B** as lightweight fallback for short snippets
where WASM hasn't loaded yet.

Flow:
```
user pastes code
  └─ debounce 500ms
       ├─ if WASM loaded → @vscode/vscode-languagedetection (confidence >= 0.5)
       └─ else → hljs.highlightAuto (relevance > 5) as interim result
            └─ when WASM ready → re-run and update if confidence is higher
```

Manual override: dropdown in action bar. Once the user selects manually, auto-
detection is suspended until the textarea is cleared.

---

## Files to Change (any option)

| File | Change |
|------|--------|
| `src/lib/use-language-detection.ts` | New hook |
| `src/components/ui/language-select.tsx` | New dropdown component |
| `src/components/ui/code-editor.tsx` | Fix init `useEffect` to load new langs dynamically via `highlighter.loadLanguage()` |
| `src/app/_code-input-area.tsx` | Wire up hook + dropdown + lang state |

---

## `CodeEditor` Fix (required regardless of option)

The current init effect ignores `lang` changes:

```ts
// current — broken if lang changes
useEffect(() => {
  createHighlighter({ themes: ['vesper'], langs: [lang] }).then(...)
}, []) // biome-ignore: inicialização única
```

Fix: use `highlighter.loadLanguage(lang)` in the update effect when the lang
is not yet loaded:

```ts
useEffect(() => {
  const hl = highlighterRef.current
  if (!hl) return
  const loaded = hl.getLoadedLanguages()
  if (!loaded.includes(lang)) {
    hl.loadLanguage(lang).then(() => {
      setHighlighted(hl.codeToHtml(value, { lang, theme: 'vesper' }))
    })
  } else {
    setHighlighted(hl.codeToHtml(value, { lang, theme: 'vesper' }))
  }
}, [value, lang])
```
