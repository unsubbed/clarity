// Clarity analysis engine: classic script, no dependencies. Sets globalThis.Clarity.
(() => {
  const ABBR = new Set(['mr.', 'mrs.', 'dr.', 'e.g.', 'i.e.', 'etc.', 'vs.']);
  const NOT_ADVERB = 'only family reply early supply holy belly ugly july italy apply rely fly ally bully jelly silly lonely lovely friendly daily weekly monthly yearly assembly butterfly emily sally kelly molly billy'.split(' ');
  const IRREGULAR = 'given taken written seen done made known shown built sent held told found kept left paid thought brought bought caught taught chosen driven eaten broken spoken stolen forgotten hidden begun drawn grown thrown worn torn sold put set cut hit read run won lost led fed met heard said understood'.split(' ');
  const QUALIFIERS = ['I think', 'I believe', 'I feel', 'I guess', 'perhaps', 'maybe', 'somewhat', 'kind of', 'sort of', 'a bit', 'fairly', 'quite', 'rather', 'really', 'very', 'just', 'basically', 'actually', 'probably', 'seems to', 'it seems', 'in my opinion'];
  // Our own plain-English swaps.
  const SIMPLER = {
    utilize: 'use', commence: 'start', purchase: 'buy', approximately: 'about', assist: 'help',
    demonstrate: 'show', numerous: 'many', 'in order to': 'to', 'at this point in time': 'now',
    'due to the fact that': 'because', 'prior to': 'before', subsequently: 'later', sufficient: 'enough',
    facilitate: 'help', endeavor: 'try', terminate: 'end', obtain: 'get', require: 'need',
    additional: 'more', individuals: 'people', 'a number of': 'some', 'in the event that': 'if',
    'with regard to': 'about', 'in spite of the fact that': 'although', 'for the purpose of': 'for',
    'at the present time': 'now', 'is able to': 'can', 'has the ability to': 'can', 'in addition': 'also',
    'a large number of': 'many', 'in close proximity to': 'near', 'on a daily basis': 'daily',
    'take into consideration': 'consider', accomplish: 'do', acquire: 'get', ascertain: 'find out',
    attempt: 'try', beneficial: 'helpful', component: 'part', concerning: 'about', consequently: 'so',
    currently: 'now', determine: 'decide', eliminate: 'remove', employ: 'use', establish: 'set up',
    furthermore: 'also', implement: 'carry out', indicate: 'show', initiate: 'begin',
    modification: 'change', nevertheless: 'still', objective: 'goal', participate: 'join',
    possess: 'have', previously: 'before', regarding: 'about', remainder: 'rest', residence: 'home',
    retain: 'keep', therefore: 'so', transmit: 'send', ultimately: 'finally', verify: 'check',
  };
  const TIPS = {
    veryhard: 'Tangled: break this into two or three sentences.',
    hard: 'Heavy: trim a clause or split it in two.',
    adverb: '-ly word: could a sharper verb do this job?',
    passive: 'Passive: name who acts, then the action.',
    qualifier: 'Hedge: drop it and say it straight.',
  };
  // Unicode-aware word edges; \b is ASCII-only.
  const B = '(?<![\\p{L}\\p{N}])', E = '(?![\\p{L}\\p{N}])';
  const S = '[^\\S\\r\\n]+'; // spaces within one line, so a mark never crosses a line break
  const phrases = list => list.map(p => p.replace(/ /g, S)).join('|');
  const NOT_PARTICIPLE = 'indeed hundred sacred naked wicked kindred rugged ragged wretched beloved speed greed breed bleed exceed proceed succeed embed shred'.split(' ');
  const DETERMINERS = 'a an the my your his her its our their this that'.split(' ');
  // Longer alternatives first so the longest phrase wins.
  const byLen = list => [...list].sort((a, b) => b.length - a.length);
  const RE = {
    simpler: new RegExp(`${B}(?:${phrases(byLen(Object.keys(SIMPLER)))})${E}`, 'giu'),
    qualifier: new RegExp(`${B}(?:${phrases(byLen(QUALIFIERS))})${E}`, 'giu'),
    // "was a hit" is not passive: the optional middle word may not be a determiner.
    passive: new RegExp(`${B}(?:is|are|was|were|being|been|be|am)${S}(?:(?!(?:${DETERMINERS.join('|')})${E})\\p{L}+${S})?(?:(?!(?:${NOT_PARTICIPLE.join('|')})${E})\\p{L}{3,}ed|${IRREGULAR.join('|')})${E}`, 'giu'),
    adverb: new RegExp(`${B}\\p{L}{2,}ly${E}`, 'giu'),
  };
  const clamp = n => Math.min(18, Math.max(1, Math.round(n)));
  const ari = (letters, words, sentences) => clamp(4.71 * (letters / words) + 0.5 * (words / sentences) - 21.43);
  const count = (s, re) => (s.match(re) || []).length;
  const wordsOf = s => count(s, /[\p{L}\p{N}'’-]*[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
  const lettersOf = s => count(s, /[\p{L}\p{N}]/gu);

  function analyze(text, target) {
    const sentences = [];
    let paragraphs = 0;
    for (const line of text.matchAll(/[^\r\n]+/g)) {
      const l = line[0];
      const add = (a, b) => {
        const m = l.slice(a, b).match(/\S(?:[\s\S]*\S)?/);
        if (!m) return;
        const s = m[0], w = wordsOf(s);
        if (!w) return;
        const letters = lettersOf(s), start = line.index + a + m.index;
        sentences.push({ start, end: start + s.length, grade: ari(letters, w, 1), words: w, letters });
      };
      let from = 0;
      // A closing quote or bracket may follow the end mark: He said "Stop." Then…
      for (const t of l.matchAll(/[.!?…]+["'”’)\]]*(?=\s|$)/g)) {
        const end = t.index + t[0].length;
        const tok = l.slice(0, end).match(/\S+$/)[0].replace(/^\W+/, '').toLowerCase();
        if (ABBR.has(tok)) continue;
        add(from, end);
        from = end;
      }
      add(from, l.length);
      if (/\S/.test(l)) paragraphs++;
    }

    const words = sentences.reduce((n, s) => n + s.words, 0);
    const letters = sentences.reduce((n, s) => n + s.letters, 0);
    const marks = [];
    const out = sentences.map(({ start, end, grade, words: w }) => {
      const level = w >= 14 && grade >= target + 6 ? 'veryhard' : w >= 14 && grade >= target + 2 ? 'hard' : null;
      if (level) marks.push({ start, end, kind: level, tip: TIPS[level] });
      return { start, end, grade, level };
    });

    // Word marks: longest match wins, no overlaps. Equal length keeps push order (qualifier beats adverb).
    const cands = [];
    for (const kind of ['simpler', 'passive', 'qualifier', 'adverb']) {
      for (const m of text.matchAll(RE[kind])) {
        const w = m[0];
        if (kind === 'adverb' && NOT_ADVERB.includes(w.toLowerCase())) continue;
        const tip = kind === 'simpler'
          ? `Plainer: '${SIMPLER[w.toLowerCase().replace(/\s+/g, ' ')]}' does the same job as '${w}'.`
          : TIPS[kind];
        cands.push({ start: m.index, end: m.index + w.length, kind, tip });
      }
    }
    const taken = [];
    for (const c of cands.sort((a, b) => (b.end - b.start) - (a.end - a.start))) {
      if (taken.some(t => c.start < t.end && t.start < c.end)) continue;
      taken.push(c);
      marks.push(c);
    }
    const isSentence = m => m.kind === 'veryhard' || m.kind === 'hard';
    marks.sort((a, b) => a.start - b.start || isSentence(b) - isSentence(a));

    const counts = { veryhard: 0, hard: 0, adverb: 0, passive: 0, qualifier: 0, simpler: 0 };
    for (const m of marks) counts[m.kind]++;
    return {
      grade: words ? ari(letters, words, sentences.length) : null,
      stats: { letters, characters: text.length, words, sentences: sentences.length, paragraphs, readingSeconds: Math.round(words / 238 * 60) },
      sentences: out,
      marks,
      counts,
    };
  }

  globalThis.Clarity = { ...globalThis.Clarity, analyze };
})();
