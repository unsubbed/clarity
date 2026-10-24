const $ = (s) => document.querySelector(s);
const wrap = $('.p-wrap'), editor = $('.p-card'), back = $('.p-back'), box = $('.p-text');
const settingsTarget = $('#app-settings [name=target]');

const SAMPLE = `Welcome. Paste your own writing here, or type over this text.

The marks show what to fix. A sentence with a strong green tint is tangled, and you should split it up, because a sentence that strings together an extraordinarily large number of long, complicated words and clauses tends to exhaust readers before they ever reach the full stop.

A sentence with a pale green tint and a dotted underline is heavy, though not hopeless, since it asks your reader to hold several separate ideas at once.

Short sentences are easy. Wavy underlines mark soft spots: -ly words like quickly, passive voice like "the report was written by the team", and hedges like perhaps. A sand tint with a double underline offers a plainer word, so when you want to utilize a fancy one, check the tip.`;

const ROW_OF = { veryhard: 'veryhard', hard: 'hard', adverb: 'soft', passive: 'soft', qualifier: 'soft', simpler: 'simpler' };
let s = { text: '', mode: 'review', hidden: [], target: 9, more: false, edited: false };
let result = null, timer;

const plural = (n, one, many) => (n === 1 ? one : many);
const countLine = {
  veryhard: (c) => c.veryhard ? `${c.veryhard} ${plural(c.veryhard, 'tangled sentence', 'tangled sentences')}` : 'Nothing tangled.',
  hard: (c) => c.hard ? `${c.hard} ${plural(c.hard, 'heavy sentence', 'heavy sentences')}` : 'Nothing heavy.',
  soft: (c) => { const w = c.adverb + c.passive + c.qualifier; return w ? `${w} ${plural(w, 'soft spot', 'soft spots')}` : 'No soft spots.'; },
  simpler: (c) => c.simpler ? `${c.simpler} ${plural(c.simpler, 'plainer swap', 'plainer swaps')}` : 'No swaps needed.',
};

// Backdrop mirrors the text; sentence marks wrap the word marks inside them.
function paint(text, marks) {
  const frag = document.createDocumentFragment();
  let pos = 0, open = null;
  const put = (to, parent) => { if (to > pos) parent.append(text.slice(pos, to)); pos = Math.max(pos, to); };
  for (const m of marks) {
    if (open && m.start >= open.end) { put(open.end, open.el); open = null; }
    const parent = open ? open.el : frag;
    put(m.start, parent);
    const el = Object.assign(document.createElement('mark'), { className: 'k-' + m.kind });
    parent.append(el);
    if (m.kind === 'veryhard' || m.kind === 'hard') open = { el, end: m.end };
    else put(m.end, el);
  }
  if (open) put(open.end, open.el);
  put(text.length, frag);
  frag.append('​'); // keeps the height when the text ends with a newline
  back.replaceChildren(frag);
}

function analyze() {
  const text = box.value;
  result = Plainly.analyze(text, s.target);
  const { stats: st, counts: c, sentences } = result;
  paint(text, result.marks);
  // Grow with the text so the backdrop and textarea wrap identically (no inner scrollbar).
  box.style.height = 'auto';
  box.style.height = box.scrollHeight + 'px';
  const g = result.grade;
  $('.p-level-n').textContent = g == null ? 'Reading level —' : `Reading level ${g}`;
  $('.p-chip').textContent = g == null ? 'Empty' : g <= s.target ? 'Clear' : g <= s.target + 2 ? 'Fair' : 'Dense';
  $('.p-words').textContent = `${st.words} ${plural(st.words, 'word', 'words')}`;
  const secs = st.readingSeconds, rt = `${Math.floor(secs / 60)}m ${secs % 60}s`;
  $('.p-stats').replaceChildren(...[['Letters', st.letters], ['Characters', st.characters], ['Words', st.words],
    ['Sentences', st.sentences], ['Paragraphs', st.paragraphs], ['Reading time', rt]]
    .map(([k, v]) => { const d = document.createElement('div'); d.innerHTML = '<dt></dt><dd></dd>'; d.firstChild.textContent = k; d.lastChild.textContent = v; return d; }));
  for (const row of Object.keys(countLine)) $(`[data-row=${row}] .p-count`).textContent = countLine[row](c, sentences.length);
  $('#p-soft-text').textContent = `-ly words ${c.adverb} · passive ${c.passive} · hedges ${c.qualifier}`;
  cursor();
}

function cursor() {
  const p = box.selectionStart;
  const hit = (result?.marks || []).filter((m) => !s.hidden.includes(ROW_OF[m.kind]) && m.start <= p && p < m.end)
    .sort((a, b) => a.end - a.start - (b.end - b.start))[0];
  $('.p-tip').textContent = hit ? hit.tip : 'Click into a marked word to see a tip.';
}

// Applies state to the page. Hide/focus modes are CSS classes, so no re-analysis needed.
function apply() {
  if (box.value !== s.text) box.value = s.text;
  settingsTarget.value = s.target;
  editor.classList.toggle('is-focus', s.mode === 'focus');
  wrap.classList.toggle('is-focus', s.mode === 'focus');
  $('.p-focus').setAttribute('aria-pressed', s.mode === 'focus');
  for (const r of ['veryhard', 'hard', 'soft', 'simpler']) {
    const off = s.hidden.includes(r);
    editor.classList.toggle('hide-' + r, off);
    $(`[data-row=${r}] .p-eye`).setAttribute('aria-pressed', !off);
  }
  $('#p-stats').hidden = !s.more;
  $('.p-more-btn').setAttribute('aria-expanded', s.more);
  analyze();
}

addEventListener('resize', () => result && analyze());
box.addEventListener('input', () => {
  s.text = box.value;
  s.edited = true;
  kit.store();
  clearTimeout(timer);
  timer = setTimeout(analyze, 150);
});
for (const ev of ['keyup', 'click']) box.addEventListener(ev, cursor);
document.addEventListener('selectionchange', () => document.activeElement === box && cursor());

const toggleFocus = () => { s.mode = s.mode === 'focus' ? 'review' : 'focus'; kit.store(); apply(); };
$('.p-focus').onclick = toggleFocus;
document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === '.') { e.preventDefault(); toggleFocus(); } });
document.querySelectorAll('.p-eye').forEach((b) => (b.onclick = () => {
  const r = b.closest('[data-row]').dataset.row;
  s.hidden = s.hidden.includes(r) ? s.hidden.filter((x) => x !== r) : [...s.hidden, r];
  kit.store(); apply();
}));
$('.p-more-btn').onclick = () => { s.more = !s.more; kit.store(); apply(); };
$('.p-details').onclick = (e) => {
  const d = $('#p-soft-text'); d.hidden = !d.hidden;
  e.currentTarget.setAttribute('aria-expanded', !d.hidden);
};
settingsTarget.onchange = () => { s.target = +settingsTarget.value; kit.store(); apply(); };

// Created last: load() runs inside this call and needs everything above.
const kit = Unsubbed.app({
  id: 'plainly',
  name: 'Plainly',
  accept: '.txt,.md,.json',
  load(saved) { s = { ...s, ...saved }; apply(); },
  state: () => s,
  exportFile() {
    const first = s.text.split('\n').find((l) => l.trim()) || '';
    const name = first.replace(/[^\p{L}\p{N} -]/gu, '').trim().slice(0, 40).trim();
    return { name: (name || 'plainly') + '.txt', data: s.text, type: 'text/plain' };
  },
  async importFile(file) {
    const text = await file.text();
    if (file.name.toLowerCase().endsWith('.json')) s = { ...s, ...JSON.parse(text) };
    else s = { ...s, text, edited: true };
    apply();
  },
});

// First visit (no saved state) or never edited: show the sample.
if (!s.edited) s.text = SAMPLE;
apply();
