# Plainly — SPEC

**Plainly is a free alternative to Hemingway Editor.** It points out tangled sentences and soft or fussy words, right in the browser. No account, no AI, no network.

This spec describes *behavior only*. It was written from public help pages and from watching the public website (see CLEANROOM.md). Builders work from this file alone.

## 0. KEEP vs CHANGE (anti-copy rules)
| KEEP — functional, same as users expect | CHANGE — expressive, our own |
|---|---|
| Paste or type text, see problem spots highlighted live | Our own highlight colors from the Unsubbed palette **plus a distinct underline pattern per kind** (never yellow / red / blue / purple fills) |
| A readability grade for the whole text | Shown in a **bottom status bar** under the writing, not in a side panel |
| A distraction-free mode that hides highlights | Called **Focus**, switched from a pill in the **status bar**, not tabs above a panel |
| Counts per kind with show/hide toggles | **Review panel on the LEFT** (desktop), **bottom sheet-style strip below the text** on mobile |
| Extra stats (letters, sentences, reading time…) | Shown as an expandable row in the status bar ("All counts") |
| Tips for each highlight | A **"Tip" card** in the review panel, driven by the cursor, not a popup |
| Adjustable target level | Free, in the Settings dialog, three named levels |
| Open / save text files | Kit header buttons |
| Our own words everywhere | Kinds are named **Tangled**, **Heavy**, **Soft spots**, **Plainer word**; verdicts **Clear / Fair / Dense** |
| — | Fonts: serif writing area (system serif stack), kit sans UI. No web fonts |
| — | Extras they lack: fully offline & private, colorblind-safe patterns, free target levels, Ctrl/Cmd+. toggles Focus |

## 1. Screen layout
- Kit header (Open, Save, Settings, Support) and kit footer, unchanged.
- **Desktop (≥ 900px):** three regions.
  - **Left:** the **Review panel** (about 260px), a rounded card with the four highlight rows and the Tip card.
  - **Right / center:** the **writing card** — one large plain-text box, reading width about 68 characters, serif font, generous line height.
  - **Bottom of the writing card:** the **status bar**: reading level + verdict, word count, "All counts" toggle, and the Focus pill.
- **Mobile (< 900px):** writing card first, status bar under it, Review panel below that. No horizontal scroll at 375px.

## 2. Modes
- **Review** (default): highlights and the Review panel visible.
- **Focus:** all highlights hidden; Review panel hidden; status bar shows only the word count and the Focus pill (pressed). Desktop writing card widens and centers.
- The pill is a `<button aria-pressed>` labelled "Focus". **Ctrl+. / Cmd+.** also toggles it. Remembered.

## 3. Writing area
- Plain text. Paragraphs are separated by line breaks.
- Typing, pasting and undo behave like a normal text box (browser default undo).
- Highlights are drawn *behind* the text (tints and underlines), so the text stays editable and the caret never jumps.
- Analysis re-runs as you type, at most every ~150 ms.
- **First visit:** the box starts with an original sample text (written by us) that explains the marks and contains one example of each kind. Once the user edits, their text is kept instead.
- Text is saved on the device automatically (kit storage).

## 4. Highlights (Review mode)
Each kind has a tint *and* an underline pattern, so it reads without color. Tokens live in app.css (light and dark).

| Kind (UI name) | Internal kind | Marks | Look | Rule |
|---|---|---|---|---|
| **Tangled** sentence | `veryhard` | Whole sentence | strong pine-green tint + solid 2px underline | Sentence grade ≥ target + 6 *and* ≥ 14 words |
| **Heavy** sentence | `hard` | Whole sentence | pale sage tint + dotted underline | Sentence grade ≥ target + 2 *and* ≥ 14 words, not tangled |
| **Soft spot** (adverb) | `adverb` | One word | no fill, terracotta wavy underline | Ends in "-ly", ≥ 4 letters, not on the not-an-adverb list (only, family, reply, early, supply, holy, belly, ugly, July, Italy, apply, rely, fly, ally, bully, jelly, silly, lonely, lovely, friendly, daily, weekly, monthly, yearly, assembly, butterfly, Emily, Sally, Kelly, Molly, Billy) |
| **Soft spot** (passive) | `passive` | Phrase | same as adverb | A form of "to be" (is, are, was, were, be, been, being, am) followed within one optional word by a past participle ("-ed" word, or the irregular list: given, taken, written, seen, done, made, known, shown, built, sent, held, told, found, kept, left, paid, thought, brought, bought, caught, taught, chosen, driven, eaten, broken, spoken, stolen, forgotten, hidden, begun, drawn, grown, thrown, worn, torn, sold, put, set, cut, hit, read, run, won, lost, led, fed, met, heard, said, understood) |
| **Soft spot** (hedge) | `qualifier` | Phrase | same as adverb | "I think", "I believe", "I feel", "I guess", "perhaps", "maybe", "somewhat", "kind of", "sort of", "a bit", "fairly", "quite", "rather", "really", "very", "just", "basically", "actually", "probably", "seems to", "it seems", "in my opinion" |
| **Plainer word** | `simpler` | Word or phrase | warm sand tint + double underline in ink-muted | Our own plain-English list (≈ 60 entries) with a swap each |

Matching is case-insensitive and on whole words only. Word marks draw on top of sentence marks.

## 5. Readability
- Score uses the public **Automated Readability Index** formula:
  `grade = 4.71 × (letters ÷ words) + 0.5 × (words ÷ sentences) − 21.43`, rounded, clamped to 1–18.
- Same formula per sentence for the Tangled / Heavy rules.
- Sentences split on `.`, `!`, `?` followed by space/end, and on line breaks. Mr. Mrs. Dr. e.g. i.e. etc. vs. do not end a sentence.
- Status bar shows **"Reading level 8"** and a verdict chip: **Clear** (≤ target), **Fair** (≤ target + 2), **Dense** (above). No text: "Reading level —" and chip "Empty".
- **Target** in Settings → "Who are you writing for?": Everyone (6), General readers (9, default), Specialists (12).

## 6. Review panel (left), top to bottom
1. Heading "Review".
2. Four rows, each: a small swatch showing the kind's tint + pattern, a count line, and a show/hide button (`aria-pressed`, accessible name "Show <kind name> marks"). Row copy (ours):
   - Tangled: "N tangled sentences" / "1 tangled sentence" / zero: "Nothing tangled."
   - Heavy: "N heavy sentences" / "1 heavy sentence" / zero: "Nothing heavy."
   - Soft spots: "N soft spots" / "1 soft spot" / zero: "No soft spots." — with a **Breakdown** button revealing "-ly words N · passive N · hedges N".
   - Plainer words: "N plainer swaps" / "1 plainer swap" / zero: "No swaps needed."
   Toggle states are remembered.
3. **Tip card** (`role="status"`): when the caret is inside a mark, show the mark's tip. Otherwise: "Click into a marked word to see a tip."

Tips (exact copy, produced by analyze.js):
- Tangled: "Tangled: break this into two or three sentences."
- Heavy: "Heavy: trim a clause or split it in two."
- Adverb: "-ly word: could a sharper verb do this job?"
- Passive: "Passive: name who acts, then the action."
- Hedge: "Hedge: drop it and say it straight."
- Plainer word: "Plainer: '<swap>' does the same job as '<matched text>'."

## 6b. Status bar (bottom of writing card)
Left to right: "Reading level N" + verdict chip · "N words" · **All counts** button (expands a row: letters, characters, words, sentences, paragraphs, read time "Xm Ys" at 238 wpm) · Focus pill (right-aligned).

## 7. Files
- **Open** accepts `.txt`, `.md`, `.json` (our own saved state). Text files replace the writing area content.
- **Save** downloads a `.txt` named from the first line (up to 40 letters, digits, spaces or dashes); empty → `plainly.txt`.

## 8. Not in scope (v1)
Grammar/spelling checking, AI rewrites, rich formatting, Word/HTML import-export, accounts, sharing, document reports, multiple documents.

## 9. Acceptance checks
- A 40-word single sentence of long words → Tangled.
- "The ball was thrown by the boy." → passive soft spot.
- "We will utilize it." → plainer word on "utilize", tip mentions "use".
- Focus hides every mark; Review restores them. Ctrl+. toggles.
- Each show/hide button hides only its kind and survives reload.
- Reload keeps text, mode, toggles and target.
- No network requests at all (CSP unchanged). Works offline after load.
- 375px phone: no horizontal scroll.
- Marks are distinguishable in grayscale (patterns differ).
