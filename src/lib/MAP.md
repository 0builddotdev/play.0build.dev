# 0build tooling: module map

Two tools, one shared layer. Every file is small enough to paste on its own.
Runtime symbols come from `shared/framework.ts` only (never `../runtime/*` directly).

```
converter.ts / rewriter.ts      thin facades, keep old import paths working
shared/
  framework.ts   gateway to runtime/functions + registry (single seam)
  color.ts       color sets, `red-500` <-> `var(--color-red-500)`
  display.ts     display-* vocabulary, DISPLAY_MAP, parse/format helpers
  encode.ts      encodeProperty(): runtime encoder with fixed value/important
  util.ts        has(): own-property check
converter/       Tailwind -> 0build
  index.ts       public API
  html.ts        class="" / className="" scanning, reports
  token.ts       convertToken: split variants, convert core, format
  modifiers.ts   dark / breakpoint / pseudo parsing
  core.ts        tries each utility family in a fixed order (order is load-bearing)
  gradient.ts    bg-linear / radial / conic / from-via-to position
  color.ts       bg-red-500/50 and COLOR_PREFIX_MAP
  arbitrary.ts   w-[..], text-[#fff]/50
  numeric.ts     p-4, z-10, border-2, duration-300, rotate-45, opacity-50%
  opacity.ts     normalizeOpacityToPercent
  result.ts      CoreResult types + ok()/fail()
rewriter/        proper <-> shorthand <-> x-ui
  index.ts       public API (rewriteAll)
  rewrite.ts     document walk, closing-tag stack
  analyze.ts     per-tag: classify tokens (static | pair | display)
  build.ts       emit one tag in the target spelling
  pairs.ts       shorthand/proper/x-ui <-> canonical Pair
  html.ts        readOpenTag, attr(), VOID / RAW_TEXT
  style.ts       parseStyle
  text.ts        Blade-aware tokenize, hasWs, php, lastTopLevelSlash
  types.ts       all rewriter types
```

## What to feed an AI for which task

| Task                                      | Files                                                          |
| ----------------------------------------- | -------------------------------------------------------------- |
| Add/fix a Tailwind utility family         | `converter/core.ts` + that family file + `converter/result.ts` |
| New gradient syntax                       | `converter/gradient.ts` + `converter/result.ts`                |
| Add a variant (`group-hover:` etc.)       | `converter/modifiers.ts` + `converter/token.ts`                |
| Add/remove a `display` value              | `shared/display.ts` only                                       |
| Change what `<x-ui>` output looks like    | `rewriter/build.ts` + `rewriter/types.ts`                      |
| Change which attributes trigger a rewrite | `rewriter/analyze.ts` + `rewriter/types.ts`                    |
| Shorthand / proper conversion bug         | `rewriter/pairs.ts` + `shared/color.ts` + `shared/encode.ts`   |
| HTML scanning bug                         | `rewriter/html.ts` (+ `rewriter/rewrite.ts` for nesting)       |

## Conventions

- Add new runtime imports in `shared/framework.ts`, then import from there.
- Utility converters return `CoreResult | null`: `null` means "not mine, try the next family".
- `display-*` lives only in `shared/display.ts`; both tools read it.
- The two facades exist for backward compatibility. Delete their legacy re-exports once unused.
