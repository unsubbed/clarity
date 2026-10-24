# Plainly — SPEC

**Plainly is a free alternative to Hemingway Editor.** It shows you which sentences are hard to read and which words weaken your writing, right in the browser. No account, no AI, no network.

This spec describes *behavior only*. It was written from public help pages and from watching the public website (see CLEANROOM.md). Builders work from this file alone.

## 1. Screen layout
- Kit header (Open, Save, Settings, Support) and kit footer, unchanged.
- **Main area, two columns on desktop (≥ 900px):**
  - Left: the writing area. One large plain-text box, comfortable reading width (about 70 characters), generous line height.
  - Right: the **panel** (about 300px wide).
- **Mobile (< 900px):** panel sits *above* the writing area as a compact strip (grade + word count + the five counts in a wrap row). Toggles still work.

## 2. Modes
A two-button switch at the top of the panel: **Write** and **Edit**. Default is Edit.
- **Edit:** highlights visible, full panel visible.
- **Write:** all highlights hidden; panel shows only the word count. Distraction-free.
- The chosen mode is remembered.

## 3. Writing area
- Plain text. Paragraphs are separated by line breaks.
- Typing, pasting and undo behave like a normal text box (browser default undo).
- Highlights are drawn *behind* the text (colored backgrounds), so the text stays editable and the caret never jumps.
- Analysis re-runs as you type, at most every ~150 ms.
- **First visit:** the box starts with an original sample text (written by us) that explains the colors and contains one example of each highlight. Once the user edits, their text is kept instead.
- Text is saved on the device automatically (kit storage).

## 4. Highlights (Edit mode)
Five kinds. Colors use our own palette tokens (defined in app.css, light and dark variants).

| Kind | What it marks | Rule |
|---|---|---|
| **Very hard sentence** | Whole sentence | Sentence grade ≥ target + 6 *and* sentence has ≥ 14 words |
| **Hard sentence** | Whole sentence | Sentence grade ≥ target + 2 *and* ≥ 14 words, but not very hard |
| **Adverb** | One word | Ends in "-ly", is ≥ 4 letters, and is not on the "not an adverb" list (only, family, reply, early, supply, holy, belly, ugly, July, Italy, apply, rely, fly, ally, bully, jelly, silly, lonely, lovely, friendly, daily, weekly, monthly, yearly, assembly, butterfly, Emily, Sally, Kelly, Molly, Billy) |
| **Passive voice** | Phrase | A form of "to be" (is, are, was, were, be, been, being, am, 's not counted) followed within one optional word by a past participle (word ending "-ed" or on the irregular participle list: given, taken, written, seen, done, made, known, shown, built, sent, held, told, found, kept, left, paid, thought, brought, bought, caught, taught, chosen, driven, eaten, broken, spoken, stolen, forgotten, hidden, begun, drawn, grown, thrown, worn, torn, sold, put, set, cut, hit, read, run, won, lost, led, fed, met, heard, said, understood) |
| **Qualifier** | Phrase | Phrase on the qualifier list: "I think", "I believe", "I feel", "I guess", "perhaps", "maybe", "somewhat", "kind of", "sort of", "a bit", "fairly", "quite", "rather", "really", "very", "just", "basically", "actually", "probably", "seems to", "it seems", "in my opinion" |
| **Simpler word** | Word or phrase | On our own plain-English list (≈ 60 entries), each with a suggestion. Examples: utilize→use, commence→start, purchase→buy, approximately→about, assist→help, demonstrate→show, numerous→many, in order to→to, at this point in time→now, due to the fact that→because, prior to→before, subsequently→later, sufficient→enough, facilitate→help, endeavor→try, terminate→end, obtain→get, require→need, additional→more, individuals→people |

Adverbs, passive voice and qualifiers are grouped as **weakeners** (one color). Matching is case-insensitive and on whole words only.

Overlap rule: word highlights draw on top of sentence highlights.

## 5. Readability
- Score uses the public **Automated Readability Index** formula:
  `grade = 4.71 × (letters ÷ words) + 0.5 × (words ÷ sentences) − 21.43`, rounded, clamped to 1–18.
- Same formula per sentence (sentences = 1) for the hard/very hard rules.
- Sentences split on `.`, `!`, `?` (and runs of them) followed by space/end, and on line breaks. Common abbreviations (Mr. Mrs. Dr. e.g. i.e. etc. vs.) do not end a sentence.
- Panel shows **"Grade N"** big, plus a one-word verdict: **Good** (≤ target), **OK** (≤ target + 2), **Hard** (above that). With no text: "Grade –" and "Start writing".
- **Target** (free, in Settings → "Target readability"): Accessible (grade 6), Standard (grade 9, default), Technical (grade 12). Changing it re-runs the analysis.

## 6. Panel (Edit mode), top to bottom
1. Write / Edit switch.
2. Grade + verdict.
3. "Words: N" and a **Show more stats / Show fewer stats** toggle revealing: letters, characters, words, sentences, paragraphs, reading time (words ÷ 238 per minute, shown as "Xm Ys").
4. Five rows, each: colored swatch, sentence like "2 of 13 sentences are very hard to read." / "3 weakeners." / "1 word has a simpler alternative.", and an **eye toggle button** (aria-pressed) that hides/shows that highlight kind. Zero counts get a short positive line ("No hard sentences. Nice."). Toggle states are remembered.
5. Weakeners row has a **Details** button that expands: adverbs N, passive N, qualifiers N.
6. **At the cursor** box: when the caret is inside a highlight, say what it is and what to do, e.g. *"Simpler word: try 'use' instead of 'utilize'."*, *"Passive voice: say who does the action."*, *"Adverb: a stronger verb may replace it."*, *"Qualifier: cut it to sound sure."*, *"Hard sentence: shorten or split it."* Otherwise: "Put your cursor on a highlight for a tip."

## 7. Files
- **Open** accepts `.txt`, `.md`, `.json` (our own saved state). Text files replace the writing area content.
- **Save** downloads the text as a `.txt` file named from the first line (up to 40 letters, digits, spaces or dashes); empty → `plainly.txt`.
- Settings gains **Target readability** select.

## 8. Not in scope (v1)
Grammar/spelling checking, AI rewrites, rich formatting (bold/headings), Word/HTML import-export, accounts, sharing, document feedback reports, multiple documents.

## 9. Acceptance checks
- Pasting a 40-word single sentence of long words → marked very hard.
- "The ball was thrown by the boy." → passive marked.
- "We will utilize it." → "utilize" marked, tip suggests "use".
- Write mode hides every highlight; Edit restores them.
- Each eye toggle hides only its kind and survives reload.
- Reload keeps text, mode, toggles and target.
- No network requests at all (CSP unchanged). Works offline after load.
- Works on a 375px-wide phone without horizontal scroll.
