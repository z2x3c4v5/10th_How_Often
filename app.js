/* =========================================================
 * 6학년 10단원 · How often do you ___? · 얼마나 자주 하는지 묻고 답하기 웹 앱
 * - 음성 출력: Web Speech API (SpeechSynthesis)
 * - 단어 클릭: 단어 발음 + 뜻 풍선(popup)
 * - 그림: Canva로 만든 활동 그림 images/활동id.png (없으면 이모지)
 * - ❓ 1. 질문 고르기(최대 5개, 📘 교과서 대화 포함) → ✍️ 2. 대답 만들기(수준·빈도, 📝 공책에 적기)
 *   → 🎤 3. 연습하기(🎙️ 연습하기 · 🎭 역할극 · 👫 짝 활동 카드)
 * ========================================================= */

/* ---------- 음성 합성 (TTS) ---------- */
const synth = window.speechSynthesis;
let enVoice = null;
let speakRate = 0.85;

function pickVoice() {
  const voices = synth.getVoices();
  enVoice =
    voices.find(v => /en[-_]US/i.test(v.lang)) ||
    voices.find(v => /^en/i.test(v.lang)) ||
    null;
  const status = document.querySelector(".toolbar #voice-status");
  if (status) {
    status.textContent = enVoice ? `음성: ${enVoice.name}` : "영어 음성을 찾는 중...";
  }
}
pickVoice();
if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = pickVoice;

function speak(text, rate, onStart, onEnd) {
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate || speakRate;
  u.pitch = 1.05;
  if (enVoice) u.voice = enVoice;
  if (onStart) u.onstart = onStart;
  if (onEnd) u.onend = onEnd;
  synth.speak(u);
}

/* ---------- 단어 뜻 풍선(popup) ---------- */
const popup = document.createElement("div");
popup.className = "word-popup hidden";
popup.innerHTML = `
  <div class="wp-word"></div>
  <div class="wp-meaning"></div>
  <button class="wp-listen">단어 다시 듣기</button>`;
document.body.appendChild(popup);

popup.querySelector(".wp-listen").addEventListener("click", e => {
  e.stopPropagation();
  if (popup.dataset.word) speak(popup.dataset.word, 0.8);
});

function wordKey(raw) { return raw.replace(/[.,!?]+$/, "").toLowerCase(); }

function showWordPopup(wordEl, rawWord) {
  const key = wordKey(rawWord);
  const plain = rawWord.replace(/[.,!?]+$/, "");
  const meaning = WORD_MEANINGS[key] || WORD_MEANINGS[plain] || "(뜻 정보 없음)";
  popup.dataset.word = plain;
  popup.querySelector(".wp-word").textContent = plain;
  popup.querySelector(".wp-meaning").textContent = meaning;

  popup.classList.remove("hidden");
  const r = wordEl.getBoundingClientRect();
  const pw = popup.offsetWidth;
  let left = r.left + r.width / 2 - pw / 2 + window.scrollX;
  left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
  popup.style.left = left + "px";
  popup.style.top = (r.bottom + 8 + window.scrollY) + "px";

  speak(plain, 0.8);
}

function hidePopup() { popup.classList.add("hidden"); }
document.addEventListener("click", e => {
  if (!popup.contains(e.target) && !e.target.classList.contains("word")) hidePopup();
});

/* ---------- 클릭 가능한 단어로 문장 만들기 ---------- */
function buildWords(sentence) {
  const frag = document.createDocumentFragment();
  sentence.split(/\s+/).forEach((w, i) => {
    if (i > 0) frag.appendChild(document.createTextNode(" "));
    const span = document.createElement("span");
    span.className = "word";
    span.textContent = w;
    span.addEventListener("click", e => {
      e.stopPropagation();
      showWordPopup(span, w);
    });
    frag.appendChild(span);
  });
  return frag;
}

/* ===========================================================
 * 🖼️ 그림 (Canva로 만든 그림: images/활동id.png, 없으면 이모지)
 * =========================================================== */
const imgSrc = item => item.photo || (item.id ? `images/${item.id}.png` : "");

function makeVisual(item, cls) {
  const box = document.createElement("div");
  box.className = "visual" + (cls ? " " + cls : "");
  const em = document.createElement("div");
  em.className = "emoji";
  em.textContent = item.emoji;
  box.appendChild(em);
  const src = imgSrc(item);
  if (!src) return box;
  const img = new Image();
  img.className = "photo";
  img.alt = item.q || "";
  img.decoding = "async";
  img.addEventListener("load", () => box.classList.add("has-photo"));
  img.addEventListener("error", () => img.remove());
  img.src = src;
  box.appendChild(img);
  return box;
}

const findAct = id => ACTIVITIES.find(a => a.id === id) || null;
const catLabel = key => (ACT_CATS.find(c => c.key === key) || {}).label || "";
const rand = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* 잠깐 떴다 사라지는 알림 */
let toastTimer = null;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 2600);
}

/* ===========================================================
 * 🔁 빈도 문장 만들기
 *  sel = { n, per, every, adv, extra, reason }
 * =========================================================== */
const questionEn = a => `How often do you ${a.q}?`;
const questionKo = a => `너는 얼마나 자주 ${a.koQ}?`;

function freqEn(sel) {
  if (sel.every) return EVERY[sel.every].en;
  if (sel.n && sel.per) return `${NUM_EN[sel.n]} ${PERIODS[sel.per].en}`;
  return "";
}
function freqKo(sel) {
  if (sel.every) return EVERY[sel.every].ko;
  if (sel.n && sel.per) return `${PERIODS[sel.per].ko} ${NUM_KO[sel.n]} 번`;
  return "";
}
const advOf = sel => sel.adv ? ADVERBS.find(x => x.key === sel.adv) : null;
const isNever = sel => sel.adv === "never";
const hasFreq = sel => !!(sel.every || (sel.n && sel.per));
const isComplete = sel => hasFreq(sel) || !!sel.adv;

/* 일주일 기준 횟수 (반응 고르기 · 그림에 사용) */
function perWeek(sel) {
  if (isNever(sel)) return 0;
  if (sel.every) return EVERY[sel.every].perWeek;
  if (sel.n && sel.per) return sel.n * PERIODS[sel.per].perWeek;
  const ad = advOf(sel);
  return ad ? ad.perWeek : 0;
}

/* 대답 첫 문장: I (usually) brush my teeth twice a day (after meals). */
function answerMain(a, sel) {
  const ad = advOf(sel);
  const parts = ["I"];
  if (ad) parts.push(ad.en);
  parts.push(a.a);
  if (!isNever(sel) && hasFreq(sel)) parts.push(freqEn(sel));
  const ex = sel.extra && EXTRAS.find(x => x.key === sel.extra);
  if (ex) parts.push(ex.en);
  return parts.join(" ") + ".";
}
function answerEn(a, sel) {
  const r = sel.reason && REASONS.find(x => x.key === sel.reason);
  return answerMain(a, sel) + (r ? " " + r.en : "");
}
/* 한국어: 나는 (보통) (식사 후에) 하루에 두 번 이를 닦아. */
function negKo(koA) {
  const words = koA.split(" ");
  let last = words.pop();
  if (last.length > 1 && last.endsWith("해")) { words.push(last.slice(0, -1)); last = "해"; }
  return [...words, "전혀 안", last].join(" ");
}
function answerKo(a, sel) {
  const ad = advOf(sel);
  const ex = sel.extra && EXTRAS.find(x => x.key === sel.extra);
  const r = sel.reason && REASONS.find(x => x.key === sel.reason);
  const parts = ["나는"];
  if (ad && !isNever(sel)) parts.push(ad.ko);
  if (ex) parts.push(ex.ko);
  if (!isNever(sel) && hasFreq(sel)) parts.push(freqKo(sel));
  parts.push(isNever(sel) ? negKo(a.koA) : a.koA);
  return parts.join(" ") + "." + (r ? " " + r.ko : "");
}

/* 친구의 반응 : Good for you! / You should ~ more (less) often. → I'll try. */
const NICE = [
  { en: "Sounds fun!", ko: "재미있겠다!" },
  { en: "That's great!", ko: "멋지다!" },
  { en: "Wow, cool!", ko: "와, 멋져!" },
];
function reaction(a, sel) {
  const pw = perWeek(sel), rule = a.rule || {};
  if (rule.good != null) {
    if (pw >= rule.good - 1e-9) return { en: "Good for you!", ko: "잘하고 있구나!", mood: "good" };
    return { en: `You should ${a.q} more often.`, ko: `너는 더 자주 ${a.koA}야 해.`, mood: "more", tryIt: true };
  }
  if (rule.less != null) {
    if (pw > rule.less + 1e-9) return { en: `You should ${a.q} less often.`, ko: "너는 그걸 조금 덜 해야 해.", mood: "less", tryIt: true };
    return { en: "Good for you!", ko: "잘하고 있구나!", mood: "good" };
  }
  if (pw === 0) return { en: "Really? You should try it!", ko: "정말? 한번 해 봐!", mood: "more", tryIt: true };
  return { ...NICE[ACTIVITIES.indexOf(a) % NICE.length], mood: "nice" };
}
const reactionKo = (a, re) => re.ko;
const TRY = { en: "I'll try.", ko: "노력해 볼게." };

/* 전체 대화(질문 + 대답 + 반응 + I'll try) */
function dialogLines(a, sel) {
  const re = reaction(a, sel);
  const lines = [
    { who: "A", en: questionEn(a), ko: questionKo(a) },
    { who: "B", en: answerEn(a, sel), ko: answerKo(a, sel) },
    { who: "A", en: re.en, ko: reactionKo(a, re) },
  ];
  if (re.tryIt) lines.push({ who: "B", en: TRY.en, ko: TRY.ko });
  return lines;
}

/* ===========================================================
 * 📅 빈도 그림 (하루 · 일주일 · 한 달 · 일 년 · 빈도부사 막대)
 * =========================================================== */
const WEEK_KO = ["월", "화", "수", "목", "금", "토", "일"];
function spread(n, cells) {
  const out = Array(cells).fill(0);
  for (let i = 0; i < n; i++) out[Math.floor(i * cells / n)]++;
  return out;
}
function freqVisual(sel, emoji, hideText) {
  const box = document.createElement("div");
  box.className = "fv";
  const title = document.createElement("div");
  title.className = "fv-title";
  const cells = document.createElement("div");
  box.append(title, cells);
  const hint = { day: "☀️ 하루", week: "🗓️ 일주일", month: "📆 한 달", year: "🎆 일 년" };
  const done = () => {
    if (hideText) {
      const ad = advOf(sel);
      title.textContent = sel.every || isNever(sel) ? "🗓️ 일주일" : sel.per ? hint[sel.per] : ad ? `📊 ${ad.pct}%` : "";
    }
    return box;
  };
  const mark = (c, k) => { c.classList.add("on"); c.querySelector(".fv-mark").textContent = k > 1 ? `${emoji}×${k}` : emoji; };
  const makeCells = (labels, cls) => {
    cells.className = "fv-cells " + cls;
    return labels.map(l => {
      const c = document.createElement("div");
      c.className = "fv-cell";
      c.innerHTML = `<span class="fv-lab">${l}</span><span class="fv-mark"></span>`;
      cells.appendChild(c);
      return c;
    });
  };

  if (isNever(sel)) {
    title.innerHTML = "🚫 <b>never</b> · 한 번도 안 해요 (0%)";
    makeCells(WEEK_KO, "week").forEach(c => c.classList.add("off"));
    return done();
  }
  if (sel.every) {
    const cs = makeCells(WEEK_KO, "week");
    if (sel.every === "everyday") { title.innerHTML = "📅 <b>every day</b> · 매일"; cs.forEach(c => mark(c, 1)); }
    else { title.innerHTML = "📅 <b>every weekend</b> · 주말마다"; mark(cs[5], 1); mark(cs[6], 1); }
    return done();
  }
  if (sel.n && sel.per) {
    const label = `<b>${freqEn(sel)}</b> · ${freqKo(sel)}`;
    if (sel.per === "day") {
      title.innerHTML = "☀️ 하루 · " + label;
      const slots = sel.n <= 3 ? ["🌅 아침", "🌞 점심", "🌙 저녁"].slice(0, Math.max(3, sel.n)) : Array.from({ length: sel.n }, (_, i) => `${i + 1}`);
      const cs = makeCells(slots.length >= sel.n ? slots : slots, "day");
      spread(sel.n, cs.length).forEach((k, i) => k && mark(cs[i], k));
    } else if (sel.per === "week") {
      title.innerHTML = "🗓️ 일주일 · " + label;
      const cs = makeCells(WEEK_KO, "week");
      spread(sel.n, 7).forEach((k, i) => k && mark(cs[i], k));
    } else if (sel.per === "month") {
      title.innerHTML = "📆 한 달 · " + label;
      const cs = makeCells(Array.from({ length: 28 }, (_, i) => `${i + 1}`), "month");
      spread(sel.n, 28).forEach((k, i) => k && mark(cs[i], k));
    } else {
      title.innerHTML = "🎆 일 년 · " + label;
      const cs = makeCells(Array.from({ length: 12 }, (_, i) => `${i + 1}월`), "year");
      spread(sel.n, 12).forEach((k, i) => k && mark(cs[i], k));
    }
    return done();
  }
  const ad = advOf(sel);
  if (ad) {
    title.innerHTML = `📊 <b>${ad.en}</b> · ${ad.ko} (${ad.pct}%)`;
    cells.className = "fv-bar";
    cells.innerHTML = `<div class="fv-bar-fill" style="width:${ad.pct}%"></div>`;
    return done();
  }
  title.textContent = "❔ 빈도를 골라요";
  makeCells(WEEK_KO, "week");
  return done();
}

/* ===========================================================
 * 🔢 수준별 예시 빈도 (묻고 답하기 카드 · 무작위 채우기)
 * =========================================================== */
function exampleSel(a, level) {
  const [n, per] = a.rec;
  const sel = { n, per };
  if (!LEVELS[level].adv) return sel;
  const pw = n * PERIODS[per].perWeek;
  sel.adv = pw >= 7 ? "always" : pw >= 3 ? "usually" : pw >= 1 ? "often" : "sometimes";
  if (ADV_EXTRA[a.id]) sel.extra = ADV_EXTRA[a.id];
  return sel;
}
const LEVEL_LABEL = { basic: "🌱 초급", mid: "🌿 중급" };
const actTag = a => (a.book ? "📘 " : a.life ? "🧒 " : "") + catLabel(a.cat);

/* ---------- 빈도 칩 (수준별) ---------- */
function chipRow(label, items, isOn, onClick, extraCls) {
  const row = document.createElement("div");
  row.className = "chip-row " + (extraCls || "");
  const lab = document.createElement("span");
  lab.className = "chip-label";
  lab.innerHTML = label;
  row.appendChild(lab);
  const wrap = document.createElement("div");
  wrap.className = "chip-wrap";
  items.forEach(it => {
    const b = document.createElement("button");
    b.className = "chip" + (isOn(it) ? " on" : "") + (it.disabled ? " disabled" : "");
    b.disabled = !!it.disabled;
    b.innerHTML = `<span class="chip-en">${it.en}</span>${it.ko ? `<span class="chip-ko">${it.ko}</span>` : ""}`;
    b.addEventListener("click", () => onClick(it));
    wrap.appendChild(b);
  });
  row.appendChild(wrap);
  return row;
}
/* sel 을 바꾸고 onChange() 를 불러요 */
function renderFreqChips(box, level, sel, onChange) {
  const L = LEVELS[level];
  box.innerHTML = "";
  const never = isNever(sel);
  if (L.adv) {
    box.appendChild(chipRow("📊 얼마나?<small>빈도부사</small>",
      ADVERBS.map(x => ({ key: x.key, en: x.en, ko: `${x.ko} ${x.pct}%` })),
      it => sel.adv === it.key,
      it => { sel.adv = sel.adv === it.key ? null : it.key; if (sel.adv === "never") { sel.n = sel.per = sel.every = null; } onChange(); },
      "row-adv"));
  }
  box.appendChild(chipRow("🔢 몇 번?",
    L.nums.map(n => ({ n, en: NUM_EN[n], ko: `${NUM_KO[n]} 번`, disabled: never })),
    it => sel.n === it.n,
    it => { sel.every = null; sel.n = sel.n === it.n ? null : it.n; onChange(); }));
  box.appendChild(chipRow("📅 언제마다?",
    L.periods.map(p => ({ p, en: PERIODS[p].en, ko: PERIODS[p].ko, disabled: never })),
    it => !sel.every && sel.per === it.p,
    it => { sel.every = null; sel.per = sel.per === it.p ? null : it.p; onChange(); }));
  if (L.every.length) {
    box.appendChild(chipRow("🔁 또는",
      L.every.map(k => ({ k, en: EVERY[k].en, ko: EVERY[k].ko, disabled: never })),
      it => sel.every === it.k,
      it => { sel.every = sel.every === it.k ? null : it.k; if (sel.every) { sel.n = null; sel.per = null; } onChange(); }));
  }
  if (L.adv) {
    box.appendChild(chipRow("➕ 언제·누구와?<small>덧붙이기</small>",
      EXTRAS.map(x => ({ key: x.key, en: x.en, ko: x.ko })),
      it => sel.extra === it.key,
      it => { sel.extra = sel.extra === it.key ? null : it.key; onChange(); }, "row-extra"));
  }
}
/* 수준을 낮추면 그 수준에 없는 빈도는 지워요 */
function fitSel(sel, level) {
  const L = LEVELS[level];
  if (sel.n && !L.nums.includes(sel.n)) sel.n = null;
  if (sel.per && !L.periods.includes(sel.per)) sel.per = null;
  if (sel.every && !L.every.includes(sel.every)) sel.every = null;
  if (!L.adv) { sel.adv = sel.extra = null; }
  sel.reason = null;
  return sel;
}

/* ---------- 몇 번 · 언제마다 중 하나만 골랐을 때 ---------- */
const BLANK = '<span class="blank">______</span>';
const filled = t => `<span class="blank filled">${t}</span>`;
function partialHtml(a, sel) {
  const ad = advOf(sel);
  const ex = sel.extra && EXTRAS.find(x => x.key === sel.extra);
  return `I ${ad ? filled(ad.en) + " " : ""}${a.a} ${sel.n ? filled(NUM_EN[sel.n]) : BLANK} ${sel.per ? filled(PERIODS[sel.per].en) : BLANK}${ex ? " " + filled(ex.en) : ""}.`;
}
function partialKo(a, sel) {
  const ad = advOf(sel), ex = sel.extra && EXTRAS.find(x => x.key === sel.extra);
  return `나는 ${ad ? ad.ko + " " : ""}${ex ? ex.ko + " " : ""}${sel.per ? PERIODS[sel.per].ko : "______"} ${sel.n ? NUM_KO[sel.n] + " 번" : "______"} ${a.koA}.`;
}

/* ---------- 말풍선 대화 ---------- */
function renderDialogue(box, a, sel, opts) {
  opts = opts || {};
  box.innerHTML = "";
  const done = a && isComplete(sel);
  const lines = !a ? [
    { who: "A", en: null, html: 'How often do you <span class="blank">________</span>?', ko: "너는 얼마나 자주 ________?" },
    { who: "B", en: null, html: 'I ________ <span class="blank">________</span>.', ko: "나는 ________ ________." },
  ] : done ? dialogLines(a, sel) : [
    { who: "A", en: questionEn(a), ko: questionKo(a) },
    { who: "B", en: null, html: partialHtml(a, sel), ko: partialKo(a, sel) },
  ];
  const rows = lines.map(ln => {
    const row = document.createElement("div");
    row.className = "br-line " + (ln.who === "A" ? "line-a" : "line-b") + (ln.en ? "" : " empty");
    const who = document.createElement("span");
    who.className = "br-who";
    who.textContent = ln.who === "A" ? (opts.whoA || "🙋 친구") : (opts.whoB || "🙆 나");
    const bub = document.createElement("div");
    bub.className = "br-bubble";
    const s = document.createElement("div");
    s.className = "br-sentence";
    if (ln.en) s.appendChild(buildWords(ln.en)); else s.innerHTML = ln.html;
    const k = document.createElement("div");
    k.className = "br-ko";
    k.textContent = ln.ko;
    bub.append(s, k);
    const sp = document.createElement("button");
    sp.className = "speak-btn small";
    sp.textContent = "🔊";
    sp.setAttribute("aria-label", "이 줄 듣기");
    sp.disabled = !ln.en;
    sp.addEventListener("click", () => ln.en && speak(ln.en));
    row.append(who, bub, sp);
    box.appendChild(row);
    return row;
  });
  return { rows, lines, done };
}
/* 대화를 한 줄씩 차례로 읽어 줘요 (말하는 줄이 빛나요) */
function playLines(rows, lines) {
  let i = 0;
  const next = () => {
    rows.forEach(r => r.classList.remove("speaking"));
    if (i >= lines.length) return;
    const row = rows[i];
    speak(lines[i].en, null, () => row && row.classList.add("speaking"), () => { i++; setTimeout(next, 250); });
  };
  next();
}

/* 카드 (그림 + 문장 + 🔊) */
function makeCard(item, opts) {
  opts = opts || {};
  const div = document.createElement("div");
  div.className = "card" + (opts.tone != null ? " tone-" + opts.tone : "");
  const sentences = item.lines || [{ en: item.en, ko: item.ko }];
  const all = sentences.map(l => l.en).join(" ");
  const speakAll = () => speak(all, null, () => div.classList.add("speaking"), () => div.classList.remove("speaking"));

  const top = document.createElement("div");
  top.className = "card-top";
  const tag = document.createElement("span");
  tag.className = "card-tag";
  tag.textContent = opts.tag || "";
  const listenAll = document.createElement("button");
  listenAll.className = "listen-all";
  listenAll.textContent = "듣기 ▶";
  listenAll.addEventListener("click", e => { e.stopPropagation(); speakAll(); });
  top.append(tag, listenAll);
  div.appendChild(top);
  if (item.id || item.emoji) {
    const v = makeVisual(item);
    v.addEventListener("click", speakAll);
    div.appendChild(v);
  }
  sentences.forEach((l, i) => {
    const box = document.createElement("div");
    box.className = "sentence-box" + (sentences.length > 1 ? (i % 2 ? " qa-a" : " qa-q") : "");
    const txt = document.createElement("div");
    txt.className = "sentence-text";
    const en = document.createElement("div");
    en.className = "en";
    if (l.label) { const lb = document.createElement("span"); lb.className = "qa-label"; lb.textContent = l.label; en.appendChild(lb); }
    en.appendChild(buildWords(l.en));
    const ko = document.createElement("div");
    ko.className = "ko";
    ko.textContent = l.ko;
    txt.append(en, ko);
    const sb = document.createElement("button");
    sb.className = "speak-btn";
    sb.setAttribute("aria-label", "문장 듣기");
    sb.textContent = "🔊";
    sb.addEventListener("click", e => { e.stopPropagation(); speak(l.en, null, () => div.classList.add("speaking"), () => div.classList.remove("speaking")); });
    box.append(txt, sb);
    div.appendChild(box);
  });
  if (opts.extra) div.appendChild(opts.extra);
  if (opts.note) {
    const n = document.createElement("div");
    n.className = "card-note";
    n.textContent = opts.note;
    div.appendChild(n);
  }
  return div;
}

/* ===========================================================
 * 내가 고른 질문과 대답 (저장)
 *  myQs = [{ id, level, sel }]  — 1. 질문 고르기에서 담고, 2. 대답 만들기에서 sel 을 채워요
 * =========================================================== */
const MAX_Q = 5;
let mode = "basic";       // 🌱 초급 · 🌿 중급 (맨 위 탭)
let qaStore = { basic: [], mid: [] };
try {
  const saved = JSON.parse(localStorage.getItem("howoften_qa2") || "null");
  if (saved) qaStore = saved;
  else qaStore.basic = JSON.parse(localStorage.getItem("howoften_qa") || "[]") || [];   // 예전 저장은 초급으로
  mode = localStorage.getItem("howoften_mode") === "mid" ? "mid" : "basic";
} catch (e) {}
["basic", "mid"].forEach(k => {
  qaStore[k] = (Array.isArray(qaStore[k]) ? qaStore[k] : []).filter(q => q && findAct(q.id)).slice(0, MAX_Q)
    .map(q => ({ id: q.id, sel: fitSel(q.sel || {}, k) }));
});
let myQs = qaStore[mode];
function persist() {
  try { localStorage.setItem("howoften_qa2", JSON.stringify(qaStore)); localStorage.setItem("howoften_mode", mode); } catch (e) {}
}
const qAct = q => findAct(q.id);
const qDone = q => isComplete(q.sel);
const doneCount = () => myQs.filter(qDone).length;
const isPicked = id => myQs.some(q => q.id === id);
function updateBadges() {
  document.getElementById("q-count").textContent = `${myQs.length}/${MAX_Q}`;
  document.getElementById("a-count").textContent = `${doneCount()}/${myQs.length}`;
}
function goTab(tab) { document.querySelector(`.tab-btn[data-tab="${tab}"]`).click(); }

/* ===========================================================
 * ❓ 1. 질문 고르기 : 활동 종류별 질문 카드 → ✅ 이 질문 고르기
 * =========================================================== */
let cardCat = "all";
const CARD_CATS = [{ key: "all", label: "전체" }, { key: "book", label: "📘 교과서 표현" }, { key: "life", label: "🧒 우리 생활 20" }, ...ACT_CATS];
function toggleQuestion(a) {
  const i = myQs.findIndex(q => q.id === a.id);
  if (i >= 0) {
    myQs.splice(i, 1);
    if (curQ >= myQs.length) curQ = Math.max(0, myQs.length - 1);
    toast(`${a.emoji} 질문을 뺐어요.`);
  } else {
    if (myQs.length >= MAX_Q) { toast(`질문은 ${MAX_Q}개까지 고를 수 있어요. 다른 질문을 빼고 골라 주세요.`); return; }
    myQs.push({ id: a.id, sel: {} });
    toast(`✅ ${questionEn(a)} → 고른 질문에 담았어요! (${myQs.length}/${MAX_Q})`);
    speak(questionEn(a));
  }
  persist();
  refreshAskCards();
  renderPicked();
  updateBadges();
}
function refreshAskCards() {
  document.querySelectorAll("#card-grid .card").forEach(c => {
    const on = isPicked(c.dataset.act);
    c.classList.toggle("picked", on);
    const b = c.querySelector(".pick-btn");
    b.classList.toggle("on", on);
    b.textContent = on ? `✓ 고른 질문 ${myQs.findIndex(q => q.id === c.dataset.act) + 1} (빼기)` : "✅ 이 질문 고르기";
  });
}
function renderAskCards() {
  const cats = document.getElementById("card-cats");
  cats.innerHTML = "";
  CARD_CATS.forEach(c => {
    const b = document.createElement("button");
    b.className = "cat-btn" + (cardCat === c.key ? " active" : "");
    b.textContent = c.label;
    b.addEventListener("click", () => { cardCat = c.key; synth.cancel(); hidePopup(); renderAskCards(); });
    cats.appendChild(b);
  });
  const grid = document.getElementById("card-grid");
  grid.innerHTML = "";
  const list = ACTIVITIES.filter(a => cardCat === "all" || (cardCat === "book" ? a.book : cardCat === "life" ? a.life : a.cat === cardCat));
  list.forEach((a, i) => {
    const btn = document.createElement("button");
    btn.className = "pick-btn";
    btn.addEventListener("click", () => toggleQuestion(a));
    const card = makeCard({ id: a.id, emoji: a.emoji, en: questionEn(a), ko: questionKo(a) },
      { tone: i % 6, tag: actTag(a), extra: btn });
    card.dataset.act = a.id;
    if (a.book) card.classList.add("textbook");
    grid.appendChild(card);
  });
  document.getElementById("card-count").textContent = `${list.length}개`;
  refreshAskCards();
}
/* 아래에 붙는 "고른 질문" 막대 */
function renderPicked() {
  const bar = document.getElementById("picked-bar");
  bar.innerHTML = "";
  const title = document.createElement("div");
  title.className = "pb-title";
  title.innerHTML = `📋 고른 질문 <b>${myQs.length}/${MAX_Q}</b>`;
  const list = document.createElement("div");
  list.className = "pb-list";
  if (!myQs.length) list.innerHTML = '<span class="pb-empty">위 카드에서 ✅ 이 질문 고르기를 눌러요</span>';
  myQs.forEach((q, i) => {
    const a = qAct(q);
    const chip = document.createElement("span");
    chip.className = "pb-chip";
    chip.innerHTML = `<b>${i + 1}</b> ${a.emoji} ${a.q}`;
    const x = document.createElement("button");
    x.className = "pb-x"; x.textContent = "✕"; x.title = "빼기";
    x.addEventListener("click", () => toggleQuestion(a));
    chip.appendChild(x);
    list.appendChild(chip);
  });
  const go = document.createElement("button");
  go.className = "btn primary pb-go";
  go.textContent = "✍️ 2. 대답 만들러 가기 ▶";
  go.disabled = !myQs.length;
  go.addEventListener("click", () => goTab("answer"));
  bar.append(title, list, go);
}

/* ===========================================================
 * 📘 교과서 대화 · 핵심 낱말
 * =========================================================== */
function renderBook() {
  const kw = document.getElementById("key-words");
  kw.innerHTML = "";
  TEXTBOOK_WORDS.forEach(w => {
    const b = document.createElement("button");
    b.className = "key-word";
    b.innerHTML = `<span class="kw-emoji">${w.emoji}</span><b>${w.en}</b><span>${w.ko}</span>`;
    b.addEventListener("click", () => speak(w.en, 0.8));
    kw.appendChild(b);
  });
  const box = document.getElementById("book-dialogs");
  box.innerHTML = "";
  TEXTBOOK_DIALOGS.forEach((d, di) => {
    const a = findAct(d.img);
    const card = document.createElement("div");
    card.className = "book-card tone-" + (di % 6);
    const body = document.createElement("div");
    body.className = "br-dialogue";
    const rows = d.lines.map(([who, en, ko]) => {
      const row = document.createElement("div");
      row.className = "br-line " + (who === "A" ? "line-a" : "line-b");
      const w = document.createElement("span");
      w.className = "br-who";
      w.textContent = who === "A" ? "🙋 A" : "🙆 B";
      const bub = document.createElement("div");
      bub.className = "br-bubble";
      const s = document.createElement("div");
      s.className = "br-sentence";
      s.appendChild(buildWords(en));
      const k = document.createElement("div");
      k.className = "br-ko";
      k.textContent = ko;
      bub.append(s, k);
      bub.addEventListener("click", e => { if (!e.target.classList.contains("word")) speak(en); });
      row.append(w, bub);
      body.appendChild(row);
      return row;
    });
    const play = document.createElement("button");
    play.className = "btn primary small book-play";
    play.textContent = "🔊 대화 듣기";
    play.addEventListener("click", () => playLines(rows, d.lines.map(l => ({ en: l[1] }))));
    const side = document.createElement("div");
    side.className = "book-side";
    const num = document.createElement("div");
    num.className = "book-num";
    num.textContent = `Dialogue ${di + 1}`;
    side.append(num, makeVisual(a, "book-pic"), play);
    card.append(side, body);
    box.appendChild(card);
  });
}

/* ===========================================================
 * 💡 빈도 표현 · 반응 표현 도움말
 * =========================================================== */
function renderReactions() {
  const grid = document.getElementById("reaction-grid");
  grid.innerHTML = "";
  REACTIONS.forEach((r, i) => grid.appendChild(makeCard({ emoji: r.emoji, en: r.en, ko: r.ko }, { tone: i % 6, tag: r.when })));
  document.getElementById("reaction-count").textContent = `${REACTIONS.length}개`;
}
function renderLadder() {
  const lad = document.getElementById("freq-ladder");
  lad.innerHTML = `
    <div class="ladder lv-basic"><h3>🌱 초급</h3>
      <p>🔢 몇 번? <b>once</b> 한 번 · <b>twice</b> 두 번 · <b>three times</b> 세 번 · <b>four / five / six times</b></p>
      <p>📅 언제마다? <b>a day</b> 하루에 · <b>a week</b> 일주일에 · <b>a month</b> 한 달에 · <b>a year</b> 일 년에</p>
      <p class="ex">I brush my teeth twice a day.</p>
      <p class="ex">I go to the dentist twice a year.</p></div>
    <div class="ladder lv-mid"><h3>🌿 중급</h3>
      <p>📊 빈도부사는 동사 앞에: <b>always</b> 100% · <b>usually</b> 80% · <b>often</b> 60% · <b>sometimes</b> 30% · <b>never</b> 0%</p>
      <p>➕ 언제·누구와: <b>after meals</b> · <b>after school</b> · <b>in the morning</b> · <b>before bed</b> · <b>on weekends</b> · <b>with my family</b> · <b>with my friends</b></p>
      <p class="ex">I usually brush my teeth three times a day after meals.</p>
      <p class="ex">I often ride my bike twice a week with my friends.</p>
      <p class="ex">I never eat fast food.</p></div>`;
  lad.querySelectorAll(".ex").forEach(p => p.addEventListener("click", () => speak(p.textContent)));
}

/* ===========================================================
 * ✍️ 2. 대답 만들기 : 고른 질문마다 수준 + 빈도 → 대화 완성
 * =========================================================== */
let curQ = 0;
let setView = null;
function renderAnswerTabs() {
  const tabs = document.getElementById("set-tabs");
  tabs.innerHTML = "";
  myQs.forEach((q, i) => {
    const a = qAct(q);
    const b = document.createElement("button");
    b.className = "set-tab" + (i === curQ ? " active" : "") + (qDone(q) ? " done" : "");
    b.textContent = `질문 ${i + 1} ${a.emoji}${qDone(q) ? " ✓" : ""}`;
    b.addEventListener("click", () => { curQ = i; synth.cancel(); renderBuilder(); speak(questionEn(a)); });
    tabs.appendChild(b);
  });
}
function renderSetPreview() {
  const q = myQs[curQ], a = qAct(q);
  const pic = document.getElementById("set-pic");
  pic.innerHTML = "";
  pic.appendChild(makeVisual(a, "ho-visual"));
  setView = renderDialogue(document.getElementById("set-dialogue"), a, q.sel);
  const vis = document.getElementById("set-vis");
  vis.innerHTML = "";
  vis.appendChild(freqVisual(q.sel, a.emoji));
  const st = document.getElementById("set-status");
  const n = doneCount(), total = myQs.length;
  if (!qDone(q)) {
    st.className = "dlg-status";
    st.textContent = q.sel.n && !q.sel.per ? "👆 이제 📅 언제마다?(a day · a week …)를 골라요"
      : q.sel.per && !q.sel.n ? "👆 이제 🔢 몇 번?(once ~ six times)을 골라요"
      : "👆 🔢 몇 번?과 📅 언제마다?를 골라 내 대답을 완성해요";
  }
  else {
    const re = reaction(a, q.sel);
    st.className = "dlg-status ok " + re.mood;
    st.textContent = (re.mood === "more" ? "💪 친구가 더 자주 하라고 충고해요. → I'll try! " : re.mood === "less" ? "⚠️ 친구가 덜 하라고 충고해요. → I'll try! " : "✅ 대답 완성! ") +
      (n < total ? `(${n}/${total}) 다음 질문도 대답해 볼까요?` : "🎉 모든 질문에 대답했어요! 🎤 3. 연습하기로 가요.");
  }
  document.getElementById("set-listen").disabled = !qDone(q);
  const next = document.getElementById("set-next");
  next.hidden = total < 2;
  next.textContent = curQ < total - 1 ? "다음 질문 ▶" : "처음 질문으로 ↺";
}
function renderBuilder() {
  updateBadges();
  const empty = document.getElementById("answer-empty"), main = document.getElementById("answer-main");
  document.getElementById("answer-count").textContent = `${doneCount()}/${myQs.length}`;
  document.getElementById("go-practice").disabled = doneCount() === 0;
  renderSheetSummary();
  if (!myQs.length) { empty.hidden = false; main.hidden = true; return; }
  empty.hidden = true; main.hidden = false;
  curQ = Math.min(curQ, myQs.length - 1);
  const q = myQs[curQ];
  renderFreqChips(document.getElementById("build-freq"), mode, q.sel, () => {
    persist(); renderBuilder();
    if (qDone(q)) speak(answerEn(qAct(q), q.sel));
  });
  renderAnswerTabs();
  renderSetPreview();
}
document.getElementById("set-listen").addEventListener("click", () => { if (setView && setView.done) playLines(setView.rows, setView.lines); });
document.getElementById("set-random").addEventListener("click", () => {
  const q = myQs[curQ]; if (!q) return;
  q.sel = exampleSel(qAct(q), mode);
  persist(); renderBuilder();
  speak(dialogLines(qAct(q), q.sel).map(l => l.en).join(" "));
});
document.getElementById("set-clear").addEventListener("click", () => {
  const q = myQs[curQ]; if (!q) return;
  q.sel = {}; persist(); synth.cancel(); renderBuilder();
});
document.getElementById("set-next").addEventListener("click", () => {
  if (!myQs.length) return;
  curQ = (curQ + 1) % myQs.length; synth.cancel(); renderBuilder(); speak(questionEn(qAct(myQs[curQ])));
});
document.getElementById("go-practice").addEventListener("click", () => goTab("practice"));
document.querySelectorAll(".go-ask").forEach(b => b.addEventListener("click", () => goTab("ask")));
document.querySelectorAll(".go-answer").forEach(b => b.addEventListener("click", () => goTab("answer")));

/* 📝 공책에 적기 */
function sheetRow(label, en, ko) {
  const row = document.createElement("div");
  row.className = "sheet-row" + (en ? "" : " empty");
  const lab = document.createElement("div"); lab.className = "sheet-label"; lab.textContent = label;
  const val = document.createElement("div"); val.className = "sheet-val";
  if (en) {
    const e = document.createElement("div"); e.className = "en"; e.appendChild(buildWords(en));
    const k = document.createElement("div"); k.className = "ko"; k.textContent = ko;
    val.append(e, k);
  } else val.textContent = "아직 만들지 않았어요";
  const btn = document.createElement("button");
  btn.className = "speak-btn small"; btn.textContent = "🔊"; btn.disabled = !en;
  btn.addEventListener("click", () => en && speak(en));
  row.append(lab, val, btn);
  return row;
}
function renderSheetSummary() {
  const box = document.getElementById("sheet-summary");
  box.innerHTML = "";
  if (!myQs.length) { box.innerHTML = '<p class="practice-empty">질문을 고르면 여기에 정리돼요.</p>'; return; }
  myQs.forEach((q, i) => {
    const a = qAct(q), ok = qDone(q);
    box.appendChild(sheetRow(`질문 ${i + 1}`, questionEn(a), questionKo(a)));
    box.appendChild(sheetRow(`내 대답 ${i + 1}`, ok && answerEn(a, q.sel), ok && answerKo(a, q.sel)));
  });
}

/* ===========================================================
 * 👫 짝 활동 카드
 * =========================================================== */
function renderPairCards() {
  const box = document.getElementById("pair-cards");
  box.innerHTML = "";
  const done = myQs.map((q, i) => [q, i]).filter(([q]) => qDone(q));
  if (!done.length) {
    const p = document.createElement("p"); p.className = "practice-empty";
    p.innerHTML = "대답을 만들면 짝 활동 카드가 나와요.";
    box.appendChild(p); return;
  }
  done.forEach(([q, i]) => {
    const a = qAct(q);
    const card = document.createElement("div");
    card.className = "pair-card tone-" + (i % 6);
    const head = document.createElement("div"); head.className = "pair-head";
    head.innerHTML = `<span class="card-tag tag-combo">질문 ${i + 1}</span><span class="pair-emoji">${a.emoji}</span>`;
    const ask = document.createElement("div"); ask.className = "pair-line me";
    ask.innerHTML = `<div class="pair-who">🙋 내가 묻기</div>`;
    const qq = document.createElement("div"); qq.className = "pair-en"; qq.appendChild(buildWords(questionEn(a)));
    ask.appendChild(qq);
    const fr = document.createElement("div"); fr.className = "pair-line friend";
    fr.innerHTML = `<div class="pair-who">🙆 친구의 대답 적기</div>
      <div class="pair-write">친구 이름: <span class="write-line"></span></div>
      <div class="pair-write">I ${a.a} <span class="write-line wide"></span>.</div>`;
    const re = document.createElement("div"); re.className = "pair-line me";
    re.innerHTML = `<div class="pair-who">🙋 반응하기</div>
      <div class="pair-choice"><span class="pair-ok">👍 Good for you!</span><span class="pair-no">💪 You should ${a.q} more often.</span></div>`;
    const mine = document.createElement("div"); mine.className = "pair-line mine";
    mine.innerHTML = `<div class="pair-who">🙆 친구가 나에게 물으면 · 내 대답</div>`;
    const m = document.createElement("div"); m.className = "pair-en small"; m.appendChild(buildWords(answerEn(a, q.sel)));
    mine.appendChild(m);
    const tools = document.createElement("div"); tools.className = "ptools";
    const b1 = document.createElement("button"); b1.className = "btn small primary"; b1.textContent = "🔊 질문 듣기";
    b1.addEventListener("click", () => speak(questionEn(a)));
    const b2 = document.createElement("button"); b2.className = "btn small"; b2.textContent = "🔊 내 대답 듣기";
    b2.addEventListener("click", () => speak(answerEn(a, q.sel)));
    tools.append(b1, b2);
    card.append(head, ask, fr, re, mine, tools);
    box.appendChild(card);
  });
}

/* ===========================================================
 * 🎙️ 말하기 연습 (음성 인식으로 정확도 측정 + 내 목소리 녹음)
 * - 음성 인식: Web Speech API (Chrome 권장) + 순서 맞춤·부분 점수·단어별 색깔 피드백
 * - 녹음: MediaRecorder → ▶ 내 목소리로 다시 듣기 (새로고침하면 녹음은 사라져요)
 * =========================================================== */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const srSupported = !!SR;
const recSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
let stats = {};          // 문장별 { attempts, best }
try { stats = JSON.parse(localStorage.getItem("howoften_stats") || "{}") || {}; } catch (e) {}
function saveStats() { try { localStorage.setItem("howoften_stats", JSON.stringify(stats)); } catch (e) {} }
const voiceClips = {};   // 문장 → 내 목소리 녹음 주소
let micBusy = false;

/* ---------- 정교한 발음 채점 ----------
 * 1) 줄임말 펼치기(I'm → i am)·숫자/동음어 정리 후 단어로 나눔
 * 2) 목표 문장과 들린 말을 "순서대로" 맞춰 봄 (동적 계획법 정렬)
 * 3) 단어마다 부분 점수: 같음 1 · 철자 한 글자 차이 0.85 · 소리가 비슷함 0.7 · 비슷한 편 0.5
 *    (한국 학생이 헷갈리는 r/l · f/p · v/b · th/s 는 비슷한 소리로 봐 줌)
 * 4) 가중치: 핵심 단어 1 (once · twice 포함) · 작은 단어(a, the, to …) 0.3 · 지명(Jeju 등) 0.6
 * 5) 덧붙인 말이 많으면 조금 감점 (최대 10%)
 */
const CONTRACTIONS = { "i'm": "i am", "i'll": "i will", "let's": "let us", "you're": "you are", "it's": "it is",
  "don't": "do not", "can't": "can not", "what's": "what is" };
const SAME_SOUND = { too: "to", two: "to", four: "for", "2": "to", "4": "for", "1": "one", "3": "three", "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine", "10": "ten", uh: "a", ah: "a", an: "a" };
const FUNCTION_WORDS = new Set(["a", "an", "the", "to", "of", "on", "in", "at", "for", "by", "my", "i", "am", "with", "and"]);

function tokenize(text) {
  const words = text.toLowerCase().replace(/[’`]/g, "'")
    .replace(/[^a-z0-9\s']/g, " ").split(/\s+/).filter(Boolean)
    .flatMap(w => (CONTRACTIONS[w] || w).split(" "))
    .map(w => SAME_SOUND[w] || w.replace(/'/g, ""));
  // "p c" 처럼 한 글자씩 들린 말은 붙여요 (a, i 는 그대로)
  const out = [];
  words.forEach(w => {
    const last = out[out.length - 1];
    if (/^[b-hj-z]$/.test(w) && last && /^[b-hj-z]+$/.test(last) && last.length < 4) out[out.length - 1] = last + w;
    else out.push(w);
  });
  return out;
}
/* 목표 문장 단어 + 가중치 (원래 대문자인 지명은 0.6) */
function targetWords(sentence) {
  const out = [];
  sentence.split(/\s+/).forEach((orig, gi) => {
    const isProper = gi > 0 && /^[A-Z][a-z]/.test(orig);
    tokenize(orig).forEach(w => out.push({
      w, group: gi, disp: orig.replace(/[.,!?]+$/, ""),
      weight: isProper ? 0.6 : FUNCTION_WORDS.has(w) ? 0.3 : 1,
    }));
  });
  return out;
}
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
/* 소리 열쇠: 비슷하게 들리는 자음 철자를 한 가지로 모아요 (모음은 그대로 → kite ≠ cat) */
function soundKey(w) {
  const k = w.replace(/ph/g, "f").replace(/th/g, "s").replace(/ck/g, "k").replace(/c(?=[eiy])/g, "s").replace(/c/g, "k")
    .replace(/q/g, "k").replace(/x/g, "ks").replace(/z/g, "s").replace(/v/g, "b").replace(/f/g, "p")
    .replace(/r/g, "l").replace(/wh/g, "w").replace(/gh/g, "");
  return k.replace(/(.)\1+/g, "$1");
}
function wordSim(t, h) {
  if (t === h) return 1;
  const dist = levenshtein(t, h), len = Math.max(t.length, h.length);
  if (dist === 1 && len >= 3) return 0.85;
  if (soundKey(t) === soundKey(h)) return 0.7;
  if (len >= 4 && 1 - dist / len >= 0.6) return 0.5;
  return 0;
}
/* 순서대로 맞춰 보고 점수(0~100)와 단어별 결과를 돌려줘요 */
function scoreDetailed(sentence, heardText) {
  const T = targetWords(sentence), H = tokenize(heardText);
  const n = T.length, m = H.length;
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1] + wordSim(T[i - 1].w, H[j - 1]) * T[i - 1].weight);
  const sims = Array(n).fill(0);
  let used = 0;
  for (let i = n, j = m; i > 0 && j > 0;) {
    const sim = wordSim(T[i - 1].w, H[j - 1]);
    if (sim > 0 && Math.abs(dp[i][j] - (dp[i - 1][j - 1] + sim * T[i - 1].weight)) < 1e-9) { sims[i - 1] = sim; used++; i--; j--; }
    else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
    else j--;
  }
  const totalW = T.reduce((a, x) => a + x.weight, 0);
  const extra = Math.max(0, m - used);
  const raw = totalW ? dp[n][m] / totalW : 0;
  const score = Math.max(0, Math.round((raw - Math.min(0.1, extra * 0.03)) * 100));
  // 원래 문장 단어 단위로 묶어요 (I'm = i + am → 둘 중 낮은 점수)
  const words = [];
  T.forEach((x, i) => {
    const last = words[words.length - 1];
    if (last && last.group === x.group) last.sim = Math.min(last.sim, sims[i]);
    else words.push({ w: x.disp, key: x.w, group: x.group, sim: sims[i] });
  });
  return { score, words };
}

/* 마이크 녹음 시작 → stop() 하면 녹음 파일(Blob)을 돌려줘요 */
function startRecorder() {
  if (!recSupported) return Promise.resolve(null);
  return navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const chunks = [];
    const mr = new MediaRecorder(stream);
    mr.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    const done = new Promise(res => {
      mr.onstop = () => {
        stream.getTracks().forEach(tr => tr.stop());
        res(chunks.length ? new Blob(chunks, { type: mr.mimeType || "audio/webm" }) : null);
      };
    });
    mr.start();
    return { stop() { if (mr.state !== "inactive") mr.stop(); return done; } };
  }).catch(() => null);
}

/* 한 번 말하기: 녹음 + 음성 인식 → done(점수, 들린 말, 오류, 녹음) */
function listenAndScore(target, done, onInterim) {
  micBusy = true;
  synth.cancel();
  startRecorder().then(recorder => {
    let best = { score: 0, words: [] }, heard = "", err = null, finished = false;
    const finals = [];   // 확정된 결과마다 후보 문장들
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(limit);
      // 후보 문장(최대 5개) 중 가장 잘 맞는 것으로 채점
      const cands = finals.length === 1 ? finals[0]
        : finals.length ? [finals.map(f => f[0]).join(" ")] : [];
      cands.forEach(c => { const r = scoreDetailed(target, c); if (r.score > best.score || !heard) { best = r; heard = c; } });
      (recorder ? recorder.stop() : Promise.resolve(null)).then(blob => {
        micBusy = false;
        done(best.score, heard, err, blob, best.words);
      });
    };
    let rec = null;
    // 너무 오래 말하지 않으면 끝내요 (음성 인식이 없으면 4초 동안 녹음만)
    const limit = setTimeout(() => { if (rec) { try { rec.stop(); } catch (e) { finish(); } } else finish(); }, srSupported ? 9000 : 4000);
    if (!srSupported) return;
    rec = new SR();
    rec.lang = "en-US"; rec.interimResults = true; rec.maxAlternatives = 5; rec.continuous = false;
    rec.onresult = e => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finals.push(Array.from(r, alt => alt.transcript));
        else interim += r[0].transcript;
      }
      if (onInterim) onInterim(finals.map(f => f[0]).join(" ") + " " + interim);
    };
    rec.onerror = e => { err = e.error; };
    rec.onend = finish;
    try { rec.start(); } catch (e) { err = "start"; finish(); }
  });
}

/* 문장별 기록: { attempts: 횟수, best: 최고, total: 정확도 합계 } → 평균 = total / attempts */
const statOf = en => {
  const st = stats[en] || { attempts: 0, best: 0, total: 0 };
  if (st.total == null) st.total = st.best * st.attempts;   // 예전 기록(합계 없음)은 최고 점수로 대신해요
  return st;
};
const avgOf = st => st.attempts ? Math.round(st.total / st.attempts) : null;

function statsText(en, last) {
  const st = statOf(en), avg = avgOf(st);
  return `이번 <b class="acc">${last != null ? last + "%" : "--"}</b>` +
    ` · 평균 <b class="avg">${avg != null ? avg + "%" : "--"}</b>` +
    ` · 최고 <b class="best">${st.best ? st.best + "%" : "--"}</b>` +
    ` · <b>${st.attempts}</b>회`;
}
/* 채점 결과 보여 주기: 점수 + 단어별 색깔(초록 맞음 · 노랑 비슷함 · 빨강 놓침) + 다시 연습할 단어 */
function showFeedback(fb, score, heard, words) {
  fb.innerHTML = "";
  fb.className = "mic-feedback " + (score >= 60 ? "good" : "bad");
  const head = document.createElement("div");
  head.className = "fb-head";
  head.textContent = score >= 85 ? `⭐ 훌륭해요! ${score}%` : score >= 60 ? `👍 좋아요! 한 번 더! ${score}%` : `🔁 다시 또박또박! ${score}%`;
  const line = document.createElement("div");
  line.className = "fb-words";
  words.forEach(x => {
    const sp = document.createElement("span");
    sp.className = "fw " + (x.sim >= 0.95 ? "ok" : x.sim >= 0.5 ? "close" : "miss");
    sp.textContent = x.w;
    line.appendChild(sp);
  });
  const missed = [...new Set(words.filter(x => x.sim < 0.95 && !FUNCTION_WORDS.has(x.key)).map(x => x.w))];
  fb.append(head, line);
  if (missed.length) {
    const tip = document.createElement("div");
    tip.className = "fb-tip";
    tip.append("🔁 다시 들어 볼 단어: ");
    missed.forEach(w => {
      const b = document.createElement("button");
      b.className = "fb-word-btn"; b.textContent = "🔊 " + w;
      b.addEventListener("click", () => speak(w, 0.75));
      tip.appendChild(b);
    });
    fb.appendChild(tip);
  }
  const h = document.createElement("div");
  h.className = "heard";
  h.textContent = "컴퓨터가 들은 말: " + (heard || "(못 들었어요)");
  fb.appendChild(h);
}

/* 계획표 한 줄의 말하기 도구: [🎙️ 말하기] [▶ 내 목소리] 정확도 · 최고 · 횟수 */
function makeMicTools(en) {
  const wrap = document.createElement("div");
  wrap.className = "plan-mic";
  const mic = document.createElement("button");
  mic.className = "mic-btn";
  mic.innerHTML = '<span class="mic-ico">🎙️</span><span class="mic-txt">말하기</span>';
  const play = document.createElement("button");
  play.className = "btn small play-btn";
  play.textContent = "▶ 내 목소리";
  play.disabled = !voiceClips[en];
  play.addEventListener("click", () => { synth.cancel(); new Audio(voiceClips[en]).play(); });
  const st = document.createElement("div");
  st.className = "pstats";
  st.innerHTML = statsText(en, null);
  const fb = document.createElement("div");
  fb.className = "mic-feedback";
  if (!srSupported && !recSupported) {
    mic.disabled = true;
    mic.title = "이 브라우저는 마이크 기능을 지원하지 않아요 (Chrome 권장)";
  }
  mic.addEventListener("click", () => {
    if (micBusy) return;
    mic.classList.add("recording");
    fb.className = "mic-feedback";
    fb.textContent = srSupported ? "🔴 듣고 있어요... 또박또박 말해 보세요!" : "🔴 녹음 중이에요 (4초)...";
    listenAndScore(en, (score, heard, err, blob, words) => {
      mic.classList.remove("recording");
      if (wrap._after) { const next = wrap._after; wrap._after = null; setTimeout(next, 900); }
      if (blob) {
        if (voiceClips[en]) URL.revokeObjectURL(voiceClips[en]);
        voiceClips[en] = URL.createObjectURL(blob);
        play.disabled = false;
      }
      if (!srSupported) {
        fb.className = "mic-feedback good";
        fb.textContent = blob ? "🎧 녹음 완료! ▶ 내 목소리로 들어 보세요. (정확도는 Chrome에서 볼 수 있어요)" : "마이크 권한을 허용해 주세요.";
        return;
      }
      if (err && score === 0) {
        fb.className = "mic-feedback bad";
        fb.textContent = err === "not-allowed" ? "마이크 권한을 허용해 주세요."
          : err === "no-speech" ? "소리가 안 들렸어요. 다시 말해 보세요." : "다시 시도해 주세요.";
        return;
      }
      const rec = statOf(en);
      rec.attempts++; rec.total += score; rec.best = Math.max(rec.best, score); stats[en] = rec; saveStats();
      renderPracticeSummary();
      st.innerHTML = statsText(en, score);
      showFeedback(fb, score, heard, words);
    }, live => {
      fb.className = "mic-feedback";
      fb.textContent = "🔴 듣고 있어요... 👂 " + live.trim();
    });
  });
  wrap.append(mic, play, st, fb);
  return wrap;
}

/* 🎙️ 연습 기록 요약: 만든 대화 문장들의 총 연습 횟수 · 평균 정확도 · 연습한 문장 수 */
function practiceSentences() {
  return myQs.filter(qDone).flatMap(q => dialogLines(qAct(q), q.sel).map(l => l.en));
}
function renderPracticeSummary() {
  const box = document.getElementById("practice-summary");
  if (!box) return;
  const sentences = [...new Set(practiceSentences())];
  let attempts = 0, total = 0, done = 0;
  sentences.forEach(en => {
    const st = statOf(en);
    attempts += st.attempts; total += st.total;
    if (st.attempts) done++;
  });
  const avg = attempts ? Math.round(total / attempts) : null;
  box.innerHTML =
    `<div class="ps-item"><span class="ps-label">🎙️ 총 연습</span><b class="ps-val">${attempts}회</b></div>` +
    `<div class="ps-item"><span class="ps-label">📊 평균 정확도</span><b class="ps-val">${avg != null ? avg + "%" : "--"}</b></div>` +
    `<div class="ps-item"><span class="ps-label">✅ 연습한 문장</span><b class="ps-val">${done} / ${sentences.length}</b></div>`;
  document.getElementById("stats-reset").disabled = attempts === 0;
}
/* 기록 지우기: 한 번 더 눌러야 지워져요 */
document.getElementById("stats-reset").addEventListener("click", () => {
  const b = document.getElementById("stats-reset");
  if (!b.dataset.armed) {
    b.dataset.armed = "1"; b.textContent = "⚠️ 한 번 더 누르면 지워져요";
    setTimeout(() => { delete b.dataset.armed; b.textContent = "🧹 기록 지우기"; }, 3000);
    return;
  }
  delete b.dataset.armed; b.textContent = "🧹 기록 지우기";
  stats = {}; saveStats(); renderPractice();
});

/* ===========================================================
 * 🎤 3. 연습하기 : 대화 카드마다 [🔊 대화 듣기] [🎙️ 연습하기] → 줄마다 말하기 + 🎭 역할극
 * =========================================================== */
function makePracticeCard(q, idx) {
  const a = qAct(q);
  const lines = dialogLines(a, q.sel);
  const card = document.createElement("div");
  card.className = "pcard pcard-dialog";
  const top = document.createElement("div");
  top.className = "card-top";
  top.innerHTML = `<div class="ptag-left"><span class="card-tag tag-combo">질문 ${idx + 1}</span><span class="pset-title">${a.emoji} ${a.q}</span></div>`;
  card.appendChild(top);
  const body = document.createElement("div");
  const rows = lines.map(l => {
    const row = document.createElement("div");
    row.className = "prow who-" + l.who.toLowerCase();
    const main = document.createElement("div");
    main.className = "prow-main";
    const sp = document.createElement("button");
    sp.className = "speak-btn small"; sp.textContent = "🔊"; sp.setAttribute("aria-label", "듣기");
    sp.addEventListener("click", () => speak(l.en));
    const txt = document.createElement("div");
    txt.className = "prow-text";
    const w = document.createElement("span"); w.className = "prow-who"; w.textContent = l.who === "A" ? "🙋 묻는 사람" : "🙆 대답하는 사람 (나)";
    const en = document.createElement("div"); en.className = "en"; en.appendChild(buildWords(l.en));
    const ko = document.createElement("div"); ko.className = "ko"; ko.textContent = l.ko;
    txt.append(w, en, ko);
    main.append(sp, txt);
    row.appendChild(main);
    row._who = l.who; row._en = l.en;
    body.appendChild(row);
    return row;
  });
  const tools = document.createElement("div"); tools.className = "ptools";
  const roleNote = document.createElement("div"); roleNote.className = "role-note";
  const listenBtn = document.createElement("button");
  listenBtn.className = "btn small"; listenBtn.textContent = "🔊 대화 듣기";
  listenBtn.addEventListener("click", () => playLines(rows, lines));
  const practiceBtn = document.createElement("button");
  practiceBtn.className = "btn primary practice-btn"; practiceBtn.textContent = "🎙️ 연습하기";
  const roleA = document.createElement("button");
  roleA.className = "btn small primary"; roleA.textContent = "🎭 내가 묻는 사람"; roleA.hidden = true;
  const roleB = document.createElement("button");
  roleB.className = "btn small primary"; roleB.textContent = "🎭 내가 대답하는 사람"; roleB.hidden = true;

  /* 🎙️ 연습하기 : 줄마다 말하기 버튼을 보여 줘요 (다시 누르면 접기) */
  let open = false;
  practiceBtn.addEventListener("click", () => {
    open = !open;
    card.classList.toggle("practicing", open);
    rows.forEach(r => {
      if (open && !r._mic) { r._mic = makeMicTools(r._en); r.appendChild(r._mic); }
      if (r._mic) r._mic.hidden = !open;
    });
    roleA.hidden = roleB.hidden = !open;
    practiceBtn.textContent = open ? "✖ 연습 접기" : "🎙️ 연습하기";
    roleNote.textContent = open ? "🎙️ 줄마다 말하기를 눌러 연습해요. 익숙해지면 🎭 역할극에 도전!" : "";
  });

  let playing = false;
  function rolePlay(me) {
    if (playing) return;
    playing = true; roleA.disabled = roleB.disabled = true;
    let i = 0;
    const step = () => {
      rows.forEach(r => r.classList.remove("turn"));
      if (i >= rows.length) {
        playing = false; roleA.disabled = roleB.disabled = false;
        roleNote.textContent = "🎉 역할극 끝! 잘했어요. 이번에는 다른 역할로 해 볼까요?";
        return;
      }
      const r = rows[i]; i++;
      r.classList.add("turn");
      if (r._who === me) {
        roleNote.innerHTML = `🎙️ 내 차례! 이 줄의 <b>🎙️ 말하기</b>를 누르고 "<b>${r._en}</b>" 라고 말해요.`;
        r._mic._after = step;
        r.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        roleNote.textContent = "👂 컴퓨터가 말해요. 잘 들어 보세요.";
        speakThen(r._en, () => setTimeout(step, 400));
      }
    };
    step();
  }
  roleA.addEventListener("click", () => rolePlay("A"));
  roleB.addEventListener("click", () => rolePlay("B"));
  tools.append(listenBtn, practiceBtn, roleA, roleB);
  card.append(body, tools, roleNote);
  return card;
}
/* 말한 뒤 다음으로 (음성이 없어도 넘어가도록 안전장치) */
function speakThen(text, cb) {
  let done = false;
  const finish = () => { if (!done) { done = true; cb(); } };
  const timer = setTimeout(finish, Math.min(9000, 1500 + text.length * 90));
  speak(text, null, null, () => { clearTimeout(timer); finish(); });
}
function renderPractice() {
  updateBadges();
  renderPairCards();
  const empty = document.getElementById("practice-empty");
  const list = document.getElementById("practice-list");
  list.innerHTML = "";
  const done = myQs.map((q, i) => [q, i]).filter(([q]) => qDone(q));
  empty.hidden = !!done.length;
  document.getElementById("practice-count").textContent = `${done.length}개 대화`;
  done.forEach(([q, i]) => list.appendChild(makePracticeCard(q, i)));
  const left = myQs.length - done.length;
  if (done.length && left > 0) {
    const note = document.createElement("p");
    note.className = "practice-empty";
    note.innerHTML = `아직 대답하지 않은 질문이 <b>${left}개</b> 있어요. <b>✍️ 2. 대답 만들기</b>에서 마저 만들어 보세요.`;
    list.appendChild(note);
  }
  renderPracticeSummary();
}

/* ===========================================================
 * 🌱 초급 · 🌿 중급 (맨 위 탭) : 수준마다 고른 질문과 대답을 따로 저장해요
 * =========================================================== */
const MODE_GUIDE = {
  basic: "🌱 <b>초급</b>: <b>🔢 몇 번?</b>(once ~ six times)과 <b>📅 언제마다?</b>(a day · a week · a month · a year)를 골라 대답해요. 예) I brush my teeth <b>twice a day</b>.",
  mid: "🌿 <b>중급</b>: 초급 대답에 <b>📊 빈도부사</b>(always · usually · often · sometimes · never)를 동사 앞에 넣고, <b>➕ 언제·누구와</b>를 덧붙여요. 예) I <b>usually</b> brush my teeth twice a day <b>after meals</b>.",
};
function renderModeBar() {
  document.body.classList.toggle("mode-mid", mode === "mid");
  document.querySelectorAll(".mode-bar .mode-btn").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
  document.querySelectorAll(".mode-guide").forEach(el => { el.innerHTML = MODE_GUIDE[mode]; });
}
function setMode(m) {
  if (m === mode) return;
  mode = m; myQs = qaStore[mode]; curQ = 0;
  persist(); synth.cancel(); hidePopup();
  renderModeBar(); refreshAskCards(); renderPicked(); renderBuilder(); updateBadges();
  if (document.getElementById("tab-practice").classList.contains("active")) renderPractice();
  toast(`${LEVEL_LABEL[mode]} 으로 바꿨어요. 고른 질문과 대답은 수준마다 따로 저장돼요.`);
}
document.querySelectorAll(".mode-bar .mode-btn").forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));

/* ---------- 초기 렌더 ---------- */
renderModeBar();
renderBook();
renderAskCards();
renderPicked();
renderReactions();
renderLadder();
renderBuilder();
updateBadges();

/* ---------- 탭 전환 ---------- */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    document.getElementById("tab-" + tab).classList.add("active");
    synth.cancel();
    hidePopup();
    if (tab === "practice") renderPractice();
    else if (tab === "answer") renderBuilder();
    else if (tab === "ask") { refreshAskCards(); renderPicked(); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

/* ---------- 속도 조절 ---------- */
document.getElementById("rate").addEventListener("input", e => {
  speakRate = parseFloat(e.target.value);
});
