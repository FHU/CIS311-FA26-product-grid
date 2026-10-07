# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Teaching materials for one CIS 311 (Freed-Hardeman University) lesson, "Grid Intermediates". Not a software project: there is no build, package manager, linter, test suite, or git repository. The folder holds two files that must stay in sync:

- `CIS311_Grid_Intermediates_Lesson_Plan.md`: the instructor's lecture/lab plan (75 minutes, Parts 1 to 6, a lab, rubric, misconceptions, quiz).
- `grocery-grid.html` with `styles.css` and `script.js`: the "Lion's Pride Market" product-grid demo the lecture walks through and the lab starts from.

Sibling lesson folders (`../form-styling`, `../layers`) follow the same lesson-plan-plus-demo pattern.

## Running the demo

Open `grocery-grid.html` directly in a browser, or serve it with the VS Code Live Server extension (`../.vscode/settings.json` pins it to port 5501). Verification is visual: resize from about 1400px down to 320px, click each aisle filter, and toggle OS dark mode.

## How the two files are coupled

The rules in `styles.css` are annotated with numbered comments `[1]` to `[7]`, indexed in the comment block at the top of `styles.css`. Part 6 of the lesson plan walks those same numbers in order, and the plan's code snippets in Parts 2 to 5 are copies of the demo's rules. When changing either file:

- Keep the numbering, the index comment at the top of `styles.css`, and the Part 6 list in agreement.
- If a demo rule that is quoted in the lesson plan changes (the `auto-fill` column line, the `.page` named areas, the `.card` subgrid rule, the `@container` thresholds of 16rem (filter box) and 226px (card sections), the `applyFilter` function and `.card[hidden]` rule), update the quoted snippet too.
- The plan refers to specific cards by name ("Hass Avocados, Large", "Sourdough Boule") as the long-blurb examples that demonstrate subgrid alignment, and to "Bakery" having exactly 2 items for the `auto-fit` vs `auto-fill` experiment. Do not rename, shorten, or recount these without updating the plan.

## Demo constraints (these are the lesson, not incidental style)

- One HTML file plus `styles.css` and `script.js` (both loaded from the `<head>`), no other assets (thumbnails are emoji). The only JavaScript is the aisle filter.
- The product grid sizes intrinsically. The only media queries are the `max-width: 700px` ones for the page scaffold and for un-sticking the filter box; the lab rubric penalizes adding more. Everything else that adapts uses container queries: `.filters` is a container whose fieldset becomes a chip row above 16rem (the sidebar never exceeds 15rem, so that means "stacked"), and the card sections are containers for the unit labels.
- `.page` sets `grid-template-rows` in both layouts (`auto 1fr auto`, and `auto auto 1fr auto` when stacked). The row count must match the number of areas or the `1fr` lands on the wrong row.
- Every `.card` has exactly four direct children in a fixed order (`.thumb`, `.info`, `.price-row`, `.add`), one per subgrid row, matched by `grid-row: span 4`. Adding or removing a child breaks alignment across the row unless the span changes with it.
- Never put `container-type` on `.card`: a query container cannot be a subgrid, so the browser silently drops `grid-template-rows: subgrid` and each card sizes its own rows (cards stay equal height, internals misalign). The query containers are `.info` and `.price-row`; their content width is the card width minus 34px, hence the 226px threshold (a 260px card). `.thumb` has no container ancestor, so it cannot be styled from these queries.
- `.products` and `.card` both set `row-gap: 0`; vertical spacing between rows of cards comes from `margin-block-end` on `.card` and `.promo`. A parent `row-gap` would also open gaps between a card's internal sections.
- The aisle filter is vanilla JS. `script.js` collects the distinct `data-category` values from the cards, builds an "All items" radio plus one radio per category inside the `.filters` fieldset (which is empty in the HTML apart from its legend), and on change sets the `hidden` attribute on every `.card` whose category differs. `styles.css` needs `.card[hidden] { display: none; }` because `.card`'s `display: grid` would otherwise override `hidden`.
- `data-category` holds the display label itself (for example `Dairy &amp; eggs`), not a slug: it is used verbatim as the radio's label and value, so spelling must match exactly across cards in the same aisle. Aisles appear in the order they first occur in the markup.
- Adding an aisle takes one edit: cards carrying the new `data-category`. The radio appears automatically.
- `:has()` is no longer used in the demo files. The plan introduces it in Part 5 as a rule typed live into devtools (`.card:has(.badge)`), because lab task 3 and the rubric depend on it.
- Colors are `oklch` tokens on `:root` defined with `light-dark()`; new colors should be added as tokens with both values rather than hard-coded.

## Course context

- Students arrive knowing only `display: grid`, `grid-template-columns`, and `gap`; the earlier course (CIS 211) taught breakpoint-based media queries, which this lesson contrasts against.
- The lesson is labelled "AI Stage 0".
- The demo deliberately omits production concerns (URL state, screen-reader announcements for filter results); the plan defers those to the Week 8 JavaScript unit.
- The lab ("Corner Market" extension) is student work starting from the demo. Do not build the lab solutions into `grocery-grid.html`.
