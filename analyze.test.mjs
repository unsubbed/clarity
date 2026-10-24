import assert from 'node:assert/strict';
await import('./analyze.js');
const { analyze } = globalThis.Clarity;
const txt = (t, m) => t.slice(m.start, m.end);
const of = (r, kind) => r.marks.filter(m => m.kind === kind);

for (const t of ['', '   \n\n ']) {
  const r = analyze(t, 9);
  assert.equal(r.grade, null);
  assert.equal(r.marks.length, 0);
  assert.ok(Object.values(r.counts).every(c => c === 0));
}

let t = 'The ball was thrown by the boy.', r = analyze(t, 9);
assert.equal(of(r, 'passive').length, 1);
assert.equal(txt(t, of(r, 'passive')[0]), 'was thrown');

t = 'We will utilize it.'; r = analyze(t, 9);
assert.equal(of(r, 'simpler').length, 1);
assert.equal(txt(t, of(r, 'simpler')[0]), 'utilize');
assert.ok(of(r, 'simpler')[0].tip.includes("'use'"));

t = 'In order to win, we ran.'; r = analyze(t, 9);
assert.equal(txt(t, of(r, 'simpler')[0]), 'In order to');

t = 'She ran quickly. Only my family came.'; r = analyze(t, 9);
assert.equal(of(r, 'adverb').length, 1);
assert.equal(txt(t, of(r, 'adverb')[0]), 'quickly');

t = 'I think this is fine.'; r = analyze(t, 9);
assert.equal(txt(t, of(r, 'qualifier')[0]), 'I think');

t = Array(10).fill('comprehensive international organizational responsibilities').join(' ') + '.';
r = analyze(t, 9);
assert.equal(r.sentences[0].level, 'veryhard');
assert.equal(r.counts.veryhard, 1);

assert.equal(analyze('Dr. Smith came home. He sat.', 9).stats.sentences, 2);

t = 'One.\r\n\r\nTwo.'; r = analyze(t, 9);
assert.equal(r.stats.paragraphs, 2);
assert.deepEqual(r.sentences.map(s => t.slice(s.start, s.end).trim()), ['One.', 'Two.']);

assert.equal(analyze('The cat sat on the mat.', 9).grade,
  Math.min(18, Math.max(1, Math.round(4.71 * (17 / 6) + 0.5 * 6 - 21.43))));

t = 'The committee considered the proposal carefully before announcing its decision to everybody today.';
const hard = k => { const c = analyze(t, k).counts; return c.hard + c.veryhard; };
assert.ok(hard(6) >= hard(9));

t = 'Dr. Smith was told we will utilize it. Really, in order to win, she ran quickly!\nNo end here';
r = analyze(t, 6);
assert.ok(r.marks.length > 0 && r.marks.every(m => 0 <= m.start && m.start < m.end && m.end <= t.length));
assert.ok(r.marks.every((m, i) => !i || r.marks[i - 1].start <= m.start));
assert.ok(!JSON.stringify(r).includes('NaN'));

r = analyze('Naïvely done.', 9);
assert.ok(of(r, 'adverb').every(m => 'Naïvely done.'.slice(m.start, m.end) === 'Naïvely'));

t = 'The committee considered the proposal carefully before announcing its decision to everybody today in the city.';
r = analyze(t, 9);
assert.equal(r.sentences[0].level, 'hard');
assert.equal(r.counts.hard, 1);
assert.equal(r.counts.veryhard, 0);

assert.equal(analyze('Stop! Why? Go.', 9).stats.sentences, 3);

// Code-review fixes: no passive for determiners or -ed non-verbs; quotes and ellipses end sentences; marks stay on one line.
assert.equal(analyze('It was a hit.', 9).counts.passive, 0);
assert.equal(analyze('This is indeed true.', 9).counts.passive, 0);
assert.equal(analyze('It is not done.', 9).counts.passive, 1);
assert.equal(analyze('He said "Stop." Then he left.', 9).stats.sentences, 2);
assert.equal(analyze('Wait… what?', 9).stats.sentences, 2);
for (const m of analyze('We met prior\nto lunch. It was\nmade.', 9).marks) assert.ok(!/\n/.test('We met prior\nto lunch. It was\nmade.'.slice(m.start, m.end)));

console.log('ok');
