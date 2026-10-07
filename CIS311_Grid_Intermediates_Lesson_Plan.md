# CIS 311: Grid Intermediates
**Lecture / lab plan** · 75 minutes of material (fits one 50-min session plus a 25-min follow-up lab, or two sessions) · AI Stage 0 · Prereq: students can write `display: grid`, `grid-template-columns`, and `gap`.

**Companion files:** `grocery-grid.html`, `styles.css`, and `script.js` (the complete product-grid demo; every technique below is numbered in the comments, with the index at the top of `styles.css`).

## Learning objectives
Students can:
1. Explain `fr`, `minmax()`, `min()`, and `auto-fit` / `auto-fill`, and write a self-sizing grid with no media queries.
2. Choose between `auto-fit` and `auto-fill` and predict what happens with few items.
3. Place items with `grid-column: 1 / -1`, `span`, and `grid-template-areas`.
4. Fix misaligned card internals with subgrid.
5. Combine Grid with container queries, a small vanilla-JS filter, and `:has()` in a realistic product listing.

---

## Part 1: Warm-up (5 min): the problem with 3 equal columns
Show this and shrink the window:

```css
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
```

Three columns on a phone is unreadable. The CIS 211 fix was a media query at some breakpoint. Pose the question: *what if the grid could decide its own column count?*

## Part 2: Intrinsic sizing: `minmax()`, `min()`, `auto-fit` (20 min)

### 2a. `fr` and `minmax()`
- `1fr` is a share of *leftover* space (after gaps and fixed tracks), not a percentage.
- `minmax(220px, 1fr)` means "never narrower than 220px, grow to share leftover space."
- Gotcha worth showing: `1fr` is really `minmax(auto, 1fr)`, so long unbreakable content can blow out a column. Fix: `minmax(0, 1fr)`. (The demo page uses this on its main column.)

### 2b. The line to memorize
```css
.products {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
}
```
Build it live, one token at a time, resizing after each step:

| Step | Code | What students see |
|---|---|---|
| 1 | `repeat(3, 1fr)` | Rigid. Squishes. |
| 2 | `repeat(auto-fill, minmax(220px, 1fr))` | Columns appear and vanish as the window resizes. No media query. |
| 3 | wrap the 220px in `min(100%, 220px)` | Fixes horizontal overflow on screens narrower than 220px. |

### 2c. `auto-fit` vs `auto-fill` (the 3-minute demo)
Put only **2 items** in the grid on a wide window:
- `auto-fill` keeps empty tracks, so the 2 items stay card-sized and leave blank space on the right.
- `auto-fit` collapses empty tracks, so the 2 items stretch to fill the row.

Rule of thumb for a product listing: **`auto-fill`** if you want consistent card width regardless of how many results a filter returns; **`auto-fit`** for a small set of feature tiles that should fill the row. Have students predict before you reveal.

**Check for understanding (cold-call):** What happens at 1000px wide with `minmax(220px, 1fr)` and a 1rem gap? (Four columns: 4×220 + 3×16 = 928 ≤ 1000; five would need 1180.)

## Part 3: Placement tools (15 min)

### 3a. Spanning and full-width bands
```css
.promo   { grid-column: 1 / -1; }      /* -1 = the last explicit line */
.feature { grid-column: span 2; }      /* take two tracks */
```
Caveat to say out loud: `1 / -1` spans only *explicit* tracks. With `auto-fill` the columns are created by the repeat, so it works; with purely implicit columns it won't.

### 3b. Named areas for page scaffolds
```css
.page {
  display: grid;
  grid-template-columns: minmax(12rem, 15rem) minmax(0, 1fr);
  grid-template-areas:
    "header  header"
    "filters main"
    "footer  footer";
}
@media (max-width: 700px) {
  .page {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto 1fr auto;
    grid-template-areas: "header" "filters" "main" "footer";
  }
}
```
The demo's full rule also sets `grid-template-rows: auto 1fr auto` so `main` takes the spare height. Trap: the stacked layout has four areas, so it needs four rows. Delete the `grid-template-rows` line from the media query in devtools on a tall, narrow window and the `1fr` lands on the filter row instead, opening a gap above the products.

Point: the CSS *looks like* the layout, and the mobile reflow is a re-draw of the diagram, not a pile of overrides. This is one of the few places where a media query is still the right tool.

### 3c. Alignment reminders
`align-items` / `justify-items` act on items inside cells; `align-content` / `justify-content` act on the grid *inside its container*. In the demo, `align-content: start` stops the product rows from stretching when the page is taller than the content.

## Part 4: Subgrid (15 min)

### The problem
Three cards with different title lengths: the prices and buttons land at different heights. Flexbox hacks (`margin-top: auto`) fix only the button and only inside one card.

### The fix
```css
.products { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr)); }

.card {
  display: grid;
  grid-row: span 4;                 /* occupy 4 rows of the parent grid */
  grid-template-rows: subgrid;      /* ...and adopt those row tracks */
}
```
Each card has four children (image, info, price, button), one per adopted row. Because rows are *shared* across a row of cards, the tallest title sets the height for every card in that row, so images, prices, and buttons all line up.

**Teaching points**
- Subgrid does not create tracks; it *borrows* the parent's. That is the whole idea.
- The child must span the tracks it wants to inherit (`grid-row: span 4`).
- Works on columns too (`grid-template-columns: subgrid`), and gaps are inherited unless overridden.
- Baseline support across current browsers; no fallback needed for this course.
- A subgrid cannot also be a query container (`container-type`); see Part 5.
- Spacing trap: parent `row-gap` now applies *between* a card's internal sections. The demo sets `row-gap: 0` and uses `margin-block-end` on cards to separate rows of cards.

## Part 5: Combining modern features (10 min)

**Container query on the filter box** (the aisle list adapts to the width of its own box, not the viewport):
```css
.filters { container-type: inline-size; }
@container (min-width: 16rem) {
  .filters fieldset { display: flex; flex-wrap: wrap; gap: .25rem; }
}
```
As a sidebar the box is at most 15rem wide, so the aisles stack as a list. When the scaffold drops it above the products it becomes full width, passes 16rem, and the list turns into a row of chips. The rule never mentions the viewport or the 700px breakpoint: change the breakpoint, or move the filter box somewhere else, and it still does the right thing. That is the argument for a container query over a media query.

Limit to point out: a container cannot be styled by its own query. Switching `.filters` from `position: sticky` to `static` in the stacked layout is a style on the container itself, so it stays in the `max-width: 700px` media query.

**Container query inside the card** (the card's contents adapt to the card's width):
```css
.info, .price-row { container-type: inline-size; }
@container (min-width: 226px) { .unit-short { display: none; } .unit-long { display: inline; } }
```
Resize slowly and watch "/lb" and "per pound" swap back and forth as the column count changes: a wider window does not always mean a wider card.

Trap worth demonstrating: the obvious place for `container-type` is `.card`, but a query container cannot also be a subgrid. Add `container-type: inline-size` to `.card` in devtools and the subgrid silently switches off: the cards stay equal in height, but each one sizes its own four rows again, so prices and buttons drift out of line. The containers are therefore the card's sections, whose content width is the card's width minus 34px of border and padding (226px here is a 260px card).

**Aisle filter in vanilla JS** (`script.js` builds the radio list from the cards, then the checked radio decides which cards display):
```js
const categories = new Set([...cards].map(card => card.dataset.category));
// ...one radio per category, plus "All items", is appended to the fieldset...

function applyFilter() {
  const aisle = filters.elements.aisle.value;
  for (const card of cards) {
    card.hidden = aisle !== ALL && card.dataset.category !== aisle;
  }
}
```
```css
.card[hidden] { display: none; }   /* .card's display: grid would otherwise override hidden */
```
**Teaching points**
- The HTML holds the data. `data-category="Dairy &amp; eggs"` is both the filter value and the label text, so the aisle list cannot drift out of step with the products.
- The script only flips the `hidden` attribute. It never touches layout; the grid does the re-flow.
- `hidden` trap: the attribute is just a browser-default `display: none`, so any author `display` rule beats it. Delete the `.card[hidden]` rule in devtools and the filter appears to stop working.

Discussion prompt: filtered cards vanish and the grid re-flows with no layout code in the script. Why does `auto-fill` make this feel natural? (Placement is automatic; the grid has no idea anything was removed.) What would this need for real use? (A real filter should also update the URL and announce results to screen readers; this is a demo, and Week 8's JS unit is where students make it production-shaped.)

**`:has()` for state styling** (not in the demo files; type it into devtools live, because the lab uses it):
```css
.card:has(.badge) { border-color: var(--warn); }
```
The card styles itself based on what it contains: every "Low stock" card gets a warning border, with no extra class and no script.

---

## Part 6: Worked example: the grocery product grid (live walkthrough, 10 min)
Open `grocery-grid.html` in the browser with `styles.css` and `script.js` in the editor. Walk the numbered comments in order:

1. **Page scaffold** (named areas, sidebar drops above the grid on small screens, row template redefined to match)
2. **`auto-fill` + `min(100%, 220px)` product grid**
3. **Subgrid cards:** point at the "Hass Avocados, Large" and "Sourdough Boule" cards, whose long blurbs would normally push neighbors out of alignment
4. **Full-width promo band** with `grid-column: 1 / -1`
5. **Container queries:** the filter box (list as a sidebar, chips when wide) and the card unit labels ("/lb" vs "per pound")
6. **Aisle filter** (`script.js`): radios generated from `data-category`, cards toggled with `hidden`
7. **Tokens, `light-dark()`, `aspect-ratio`, `tabular-nums`**

Have students open devtools (Firefox's Grid overlay is clearest) and toggle the subgrid overlay on one card.

**Live experiments to run**
- Drag the window from 1400px to 320px and count columns at each step.
- Filter to "Bakery" (2 items): see `auto-fill` keep the card width. Then change `auto-fill` to `auto-fit` in devtools and watch the 2 cards stretch.
- Delete `grid-template-rows: subgrid` in devtools to see the misalignment return.
- Edit one card's `data-category` to a new name in the HTML and reload: a new aisle appears in the filter.
- Toggle OS dark mode.

---

## Lab (25 min): "Corner Market" extension
Starting from the three demo files, students (in pairs) make **three** changes. None of them requires editing `script.js`.

1. **Featured item:** make the first product span two columns (`grid-column: span 2`) at wide sizes without breaking the subgrid (it still needs `grid-row: span 4`). Handle the case where only one column exists (hint: `min()`/`@container` or a width-conditional rule).
2. **Add a sixth aisle** ("Frozen") with three products. The filter option should appear on its own; add a comment in the HTML explaining why no change to the form or the script was needed.
3. **Sold-out state:** a card with `:has(.sold-out)` dims and swaps its button for disabled text, with no JavaScript and no new class on the card.

**Stretch:** Rebuild the filter chip row (the `@container` rule on `.filters`) using only grid (no flex).

**Rubric (10 pts):** grid sizing stays intrinsic, no new media queries beyond the scaffold (3) · subgrid alignment preserved (3) · `:has()` and the automatic filter option each justified in a comment (2) · accessibility basics: focus states, contrast in both themes (2).

## Common misconceptions
- "`auto-fit` and `auto-fill` are the same." (They differ only when there are fewer items than fit.)
- "Subgrid means nested grids." (Nested grids make their own tracks; subgrid reuses the parent's.)
- "Grid replaces Flexbox." (Inside each card, a flex row for price and unit is still the right tool.)
- "`1 / -1` always means full width." (Only across explicit tracks.)
- "I need a breakpoint for every column count." (Not for this pattern.)
- "The `hidden` attribute always hides an element." (Any author `display` rule overrides it, which is why the demo has `.card[hidden]`.)

## Quick quiz (5 min, optional)
1. Write the one-line column definition for a card grid with 200px minimum cards that never overflows a phone. 
2. Two products remain after filtering on a wide screen. Which keyword keeps them card-sized: `auto-fit` or `auto-fill`? 
3. Why does the card need `grid-row: span 4`? 
4. What does `minmax(0, 1fr)` protect against? 
5. Name one place in the demo where a container query is better than a media query, and say why.

## Resources
- Grid by Example (Rachel Andrew), including the subgrid section
- MDN: CSS grid layout, subgrid, container queries
- web.dev *Learn CSS*: Grid
- Kevin Powell's Grid videos (good pre-class viewing)
- Firefox DevTools Grid and subgrid inspector
