/* =========================================================
 * 6학년 10단원 · How often do you ___? · 얼마나 자주 하는지 묻고 답하기 웹 앱
 * - 음성 출력: Web Speech API (SpeechSynthesis)
 * - 단어 클릭: 단어 발음 + 뜻 풍선(popup)
 * - 그림: Canva로 만든 활동 그림 images/활동id.png (없으면 이모지)
 * - 📘 교과서 대화(역할 놀이) · 🌱 초급 · 🌿 중급 · 🌳 고급 보드 · 🎯 빈도 퀴즈
 * - 🎤 연습하기: 나의 생활 습관표 · 🎙️ 말하기(정확도 측정 + 녹음해서 다시 듣기) · 인쇄
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
 * 📝 나의 생활 습관표 (저장)
 * =========================================================== */
let habits = [];   // [{ id, level, sel }]
try { habits = JSON.parse(localStorage.getItem("howoften_habits") || "[]") || []; } catch (e) {}
habits = habits.filter(h => findAct(h.id));
function persist() { try { localStorage.setItem("howoften_habits", JSON.stringify(habits)); } catch (e) {} }
function updateHabitBadge() { document.getElementById("habit-count").textContent = habits.length; }
const HABIT_MAX = 12;
function addHabit(a, level, sel) {
  const en = answerEn(a, sel);
  const same = habits.findIndex(h => h.id === a.id);
  const item = { id: a.id, level, sel: { ...sel } };
  if (same >= 0) { habits[same] = item; toast(`✏️ ${a.emoji} 습관표의 대답을 바꿨어요: ${en}`); }
  else {
    if (habits.length >= HABIT_MAX) { toast(`습관표는 ${HABIT_MAX}개까지 담을 수 있어요. 🎤 연습하기에서 ✕로 빼 주세요.`); return false; }
    habits.push(item); toast(`➕ ${a.emoji} ${en} → 🎤 연습하기에 담았어요!`);
  }
  persist(); updateHabitBadge();
  return true;
}

/* ===========================================================
 * 🌱🌿🌳 수준별 보드 (공통)
 *  - 1️⃣ 활동 카드 고르기 → 질문이 바로 나와요
 *  - 2️⃣ 빈도 고르기 → 대답 · 친구 반응 · 빈도 그림이 바로 바뀌어요
 *  - 3️⃣ 대화 듣기 · ➕ 습관표에 담기
 * =========================================================== */
function createBoard(root, level) {
  const L = LEVELS[level];
  const acts = ACTIVITIES.filter(a => level === "adv" || a.lv <= (level === "basic" ? 1 : 2));
  let act = acts[0];
  let sel = {};
  let cat = "all";

  const guide = {
    basic: "<b>once</b>(한 번) · <b>twice</b>(두 번) · <b>three times</b>(세 번) 에 <b>a day</b>(하루에) · <b>a week</b>(일주일에)를 붙여 말해요.",
    mid: "<b>four times ~ ten times</b>, <b>a month</b>(한 달에) · <b>a year</b>(일 년에), <b>every day</b> · <b>every weekend</b> 까지 써 봐요. 친구의 충고에는 <b>I'll try.</b> 로 대답해요.",
    adv: "<b>always · usually · often · sometimes · never</b> 를 동사 앞에 넣고, <b>언제 · 누구와</b>를 붙이고, <b>이유</b>를 한 문장 더 말해 봐요.",
  }[level];

  root.innerHTML = `
    <div class="lv-banner lv-${level}">
      <div class="lv-name">${L.label}</div>
      <div class="lv-guide">${guide}</div>
    </div>
    <div class="ho-panel">
      <div class="ho-top">
        <div class="ho-pic"></div>
        <div class="br-dialogue ho-dialogue"></div>
      </div>
      <div class="ho-freq">
        <div class="pp-step">2️⃣ 빈도를 골라요 <span class="pp-sub">How often?</span></div>
        <div class="ho-chips"></div>
        <div class="ho-vis"></div>
      </div>
      <div class="dlg-status ho-status"></div>
      <div class="fill-actions">
        <button class="btn primary ho-listen">🔊 대화 듣기</button>
        <button class="btn ho-random">🎲 아무거나</button>
        <button class="btn ok ho-add">➕ 습관표에 담기</button>
        <button class="btn ghost ho-go">🎤 연습하기로 가기</button>
      </div>
    </div>
    <div class="section-block">
      <h2>1️⃣ 활동 카드 고르기 · How often do you ___? <span class="count act-count"></span></h2>
      <p class="hint">카드를 누르면 위의 질문이 바뀌어요. <b>📘</b> 표시는 교과서 표현이에요.</p>
      <div class="cat-switch"></div>
      <div class="card-grid act-grid"></div>
    </div>`;
  const $ = s => root.querySelector(s);
  const grid = $(".act-grid");

  /* ----- 대화 ----- */
  function renderDialogue() {
    const pic = $(".ho-pic");
    pic.innerHTML = "";
    pic.appendChild(makeVisual(act, "ho-visual"));
    const cap = document.createElement("div");
    cap.className = "ho-cap";
    cap.textContent = `${act.emoji} ${act.q}`;
    pic.appendChild(cap);

    const dlg = $(".ho-dialogue");
    dlg.innerHTML = "";
    const done = isComplete(sel);
    const lines = done ? dialogLines(act, sel) : [
      { who: "A", en: questionEn(act), ko: questionKo(act) },
      { who: "B", en: null, ko: "나는 ________ " + act.koA + "." },
    ];
    lines.forEach((ln, i) => {
      const row = document.createElement("div");
      row.className = "br-line " + (ln.who === "A" ? "line-a" : "line-b") + (ln.en ? "" : " empty");
      const who = document.createElement("span");
      who.className = "br-who";
      who.textContent = ln.who === "A" ? "🙋 친구" : "🙆 나";
      const bub = document.createElement("div");
      bub.className = "br-bubble";
      const s = document.createElement("div");
      s.className = "br-sentence";
      if (ln.en) s.appendChild(buildWords(ln.en));
      else s.innerHTML = `I ${act.a} <span class="blank">________</span>.`;
      const k = document.createElement("div");
      k.className = "br-ko";
      k.textContent = ln.ko;
      bub.append(s, k);
      const sp = document.createElement("button");
      sp.className = "speak-btn small";
      sp.textContent = "🔊";
      sp.disabled = !ln.en;
      sp.addEventListener("click", () => ln.en && speak(ln.en));
      row.append(who, bub, sp);
      row.style.animationDelay = (i * 0.06) + "s";
      dlg.appendChild(row);
    });

    const vis = $(".ho-vis");
    vis.innerHTML = "";
    vis.appendChild(freqVisual(sel, act.emoji));

    const st = $(".ho-status");
    const inList = habits.some(h => h.id === act.id);
    if (!done) { st.className = "dlg-status ho-status"; st.textContent = "👆 위에서 빈도를 골라 대답을 완성해요"; }
    else {
      const re = reaction(act, sel);
      st.className = "dlg-status ho-status ok " + re.mood;
      st.textContent = re.mood === "good" ? "👍 건강한 습관이에요! ➕ 습관표에 담아 볼까요?"
        : re.mood === "more" ? "💪 친구가 더 자주 하라고 충고해요. I'll try! 로 대답해요."
        : re.mood === "less" ? "⚠️ 너무 많이 하고 있나 봐요! 친구가 덜 하라고 충고해요."
        : "😊 대답 완성! ➕ 습관표에 담아 볼까요?";
    }
    $(".ho-listen").disabled = !done;
    $(".ho-add").disabled = !done;
    $(".ho-add").textContent = inList ? "✏️ 습관표 대답 바꾸기" : "➕ 습관표에 담기";
    $(".ho-go").disabled = habits.length === 0;
  }

  /* ----- 빈도 칩 ----- */
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
      b.addEventListener("click", () => { onClick(it); });
      wrap.appendChild(b);
    });
    row.appendChild(wrap);
    return row;
  }
  function update(say) {
    renderChips(); renderDialogue(); refreshCards();
    if (say && isComplete(sel)) speak(answerEn(act, sel));
  }
  function renderChips() {
    const box = $(".ho-chips");
    box.innerHTML = "";
    const never = isNever(sel);
    if (level === "adv") {
      box.appendChild(chipRow("📊 얼마나?<small>빈도부사</small>",
        ADVERBS.map(x => ({ key: x.key, en: x.en, ko: `${x.ko} ${x.pct}%` })),
        it => sel.adv === it.key,
        it => { sel.adv = sel.adv === it.key ? null : it.key; if (sel.adv === "never") { sel.n = sel.per = sel.every = null; } update(true); },
        "row-adv"));
    }
    box.appendChild(chipRow("🔢 몇 번?",
      L.nums.map(n => ({ n, en: NUM_EN[n], ko: `${NUM_KO[n]} 번`, disabled: never })),
      it => sel.n === it.n,
      it => { sel.every = null; sel.n = sel.n === it.n ? null : it.n; if (!sel.per && sel.n) sel.per = L.periods[0]; update(true); }));
    box.appendChild(chipRow("📅 언제마다?",
      L.periods.map(p => ({ p, en: PERIODS[p].en, ko: PERIODS[p].ko, disabled: never })),
      it => !sel.every && sel.per === it.p,
      it => { sel.every = null; sel.per = it.p; if (!sel.n) sel.n = 1; update(true); }));
    if (L.every.length) {
      box.appendChild(chipRow("🔁 또는",
        L.every.map(k => ({ k, en: EVERY[k].en, ko: EVERY[k].ko, disabled: never })),
        it => sel.every === it.k,
        it => { sel.every = sel.every === it.k ? null : it.k; if (sel.every) { sel.n = null; sel.per = null; } update(true); }));
    }
    if (level === "adv") {
      box.appendChild(chipRow("➕ 언제·누구와?",
        EXTRAS.map(x => ({ key: x.key, en: x.en, ko: x.ko })),
        it => sel.extra === it.key,
        it => { sel.extra = sel.extra === it.key ? null : it.key; update(true); }, "row-extra"));
      box.appendChild(chipRow("💬 왜?<small>한 문장 더</small>",
        REASONS.map(x => ({ key: x.key, en: x.en, ko: x.ko })),
        it => sel.reason === it.key,
        it => { sel.reason = sel.reason === it.key ? null : it.key; update(true); }, "row-reason"));
    }
    const reset = document.createElement("button");
    reset.className = "btn small ghost chip-reset";
    reset.textContent = "↺ 빈도 다시 고르기";
    reset.addEventListener("click", () => { sel = {}; synth.cancel(); update(false); });
    box.appendChild(reset);
  }

  /* ----- 활동 카드 ----- */
  function renderFilters() {
    const wrap = $(".cat-switch");
    wrap.innerHTML = "";
    [{ key: "all", label: "전체" }, { key: "book", label: "📘 교과서 표현" }, ...ACT_CATS].forEach(c => {
      const b = document.createElement("button");
      b.className = "cat-btn" + (cat === c.key ? " active" : "");
      b.textContent = c.label;
      b.addEventListener("click", () => { cat = c.key; synth.cancel(); hidePopup(); renderFilters(); renderCards(); });
      wrap.appendChild(b);
    });
  }
  function pickAct(a, keepSel) {
    act = a;
    if (!keepSel) sel = {};
    synth.cancel();
    update(false);
    speak(questionEn(a));
    root.querySelector(".ho-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function refreshCards() {
    grid.querySelectorAll(".card").forEach(c => {
      const on = c.dataset.act === act.id;
      c.classList.toggle("picked", on);
      c.classList.toggle("saved", habits.some(h => h.id === c.dataset.act));
    });
  }
  function renderCards() {
    grid.innerHTML = "";
    const list = acts.filter(a => cat === "all" || (cat === "book" ? a.book : a.cat === cat));
    list.forEach((a, i) => {
      const card = document.createElement("button");
      card.className = "card act-card tone-" + (i % 6) + (a.book ? " textbook" : "");
      card.dataset.act = a.id;
      const tag = document.createElement("span");
      tag.className = "card-tag";
      tag.textContent = (a.book ? "📘 " : "") + catLabel(a.cat);
      const q = document.createElement("div");
      q.className = "act-q";
      q.innerHTML = `<b>${a.q}</b><span>${a.koQ.replace(/니$/, "기")}</span>`;
      const savedMark = document.createElement("span");
      savedMark.className = "saved-mark";
      savedMark.textContent = "✓ 담음";
      card.append(tag, makeVisual(a), q, savedMark);
      card.addEventListener("click", () => pickAct(a));
      grid.appendChild(card);
    });
    $(".act-count").textContent = `${list.length}개`;
    refreshCards();
  }

  /* 🎲 아무거나 : 자연스러운 빈도로 */
  function randomSel(a) {
    const s = {};
    if (level === "adv" && Math.random() < 0.5) s.adv = rand(["always", "usually", "often", "sometimes"]);
    const [n, per] = a.rec;
    if (L.periods.includes(per) && L.nums.includes(n)) { s.n = n; s.per = per; }
    else { s.n = rand(L.nums.filter(x => x <= 3)); s.per = rand(L.periods); }
    if (level !== "basic" && Math.random() < 0.15 && a.rec[1] !== "year" && a.rec[1] !== "month") { s.every = "everyday"; s.n = s.per = null; }
    if (level === "adv") {
      if (Math.random() < 0.6) s.extra = rand(EXTRAS).key;
      if (Math.random() < 0.6) s.reason = rand(REASONS.slice(0, 3)).key;
    }
    return s;
  }

  $(".ho-listen").addEventListener("click", () => {
    if (!isComplete(sel)) return;
    const rows = root.querySelectorAll(".ho-dialogue .br-line");
    const lines = dialogLines(act, sel);
    let i = 0;
    const next = () => {
      rows.forEach(r => r.classList.remove("speaking"));
      if (i >= lines.length) return;
      const row = rows[i];
      speak(lines[i].en, null, () => row && row.classList.add("speaking"), () => { i++; setTimeout(next, 250); });
    };
    next();
  });
  $(".ho-random").addEventListener("click", () => {
    const a = rand(acts);
    act = a; sel = randomSel(a);
    update(false);
    speak(dialogLines(a, sel).map(l => l.en).join(" "));
  });
  $(".ho-add").addEventListener("click", () => { if (isComplete(sel) && addHabit(act, level, sel)) update(false); });
  $(".ho-go").addEventListener("click", () => document.querySelector('.tab-btn[data-tab="practice"]').click());

  return {
    render() { renderFilters(); renderCards(); renderChips(); renderDialogue(); },
    refresh() { renderDialogue(); refreshCards(); },
  };
}

const boards = {
  basic: createBoard(document.getElementById("board-basic"), "basic"),
  mid: createBoard(document.getElementById("board-mid"), "mid"),
  adv: createBoard(document.getElementById("board-adv"), "adv"),
};

/* ===========================================================
 * 📘 교과서 대화
 * =========================================================== */
let bookRole = null;   // null · "A" · "B"
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

  const rs = document.getElementById("role-switch");
  rs.innerHTML = "";
  [[null, "👀 모두 보기"], ["A", "🙋 내가 A 역할"], ["B", "🙆 내가 B 역할"]].forEach(([r, label]) => {
    const b = document.createElement("button");
    b.className = "cat-btn" + (bookRole === r ? " active" : "");
    b.textContent = label;
    b.addEventListener("click", () => { bookRole = r; renderBook(); });
    rs.appendChild(b);
  });

  const box = document.getElementById("book-dialogs");
  box.innerHTML = "";
  TEXTBOOK_DIALOGS.forEach((d, di) => {
    const a = findAct(d.img);
    const card = document.createElement("div");
    card.className = "book-card tone-" + (di % 6);
    const pic = makeVisual(a, "book-pic");
    const body = document.createElement("div");
    body.className = "br-dialogue";
    const rows = d.lines.map(([who, en, ko]) => {
      const row = document.createElement("div");
      const mine = bookRole === who;
      row.className = "br-line " + (who === "A" ? "line-a" : "line-b") + (mine ? " my-turn" : "");
      const w = document.createElement("span");
      w.className = "br-who";
      w.textContent = mine ? "🎤 나" : who === "A" ? "🙋 A" : "🙆 B";
      const bub = document.createElement("div");
      bub.className = "br-bubble";
      const s = document.createElement("div");
      s.className = "br-sentence";
      s.appendChild(buildWords(en));
      const k = document.createElement("div");
      k.className = "br-ko";
      k.textContent = ko;
      bub.append(s, k);
      if (mine) {
        const hide = document.createElement("button");
        hide.className = "reveal";
        hide.textContent = "🙈 내가 말할 차례! (눌러서 보기)";
        hide.addEventListener("click", e => { e.stopPropagation(); row.classList.remove("my-turn"); hide.remove(); speak(en); });
        bub.appendChild(hide);
      }
      bub.addEventListener("click", e => { if (!e.target.classList.contains("word") && !row.classList.contains("my-turn")) speak(en); });
      row.append(w, bub);
      body.appendChild(row);
      return { row, en, who };
    });
    const play = document.createElement("button");
    play.className = "btn primary small book-play";
    play.textContent = "🔊 대화 듣기";
    play.addEventListener("click", () => {
      let i = 0;
      const next = () => {
        rows.forEach(r => r.row.classList.remove("speaking"));
        if (i >= rows.length) return;
        const r = rows[i];
        if (bookRole === r.who) {   // 내 차례 : 잠깐 기다려 줘요
          r.row.classList.add("speaking");
          setTimeout(() => { i++; next(); }, 2600 + r.en.length * 60);
          return;
        }
        speak(r.en, null, () => r.row.classList.add("speaking"), () => { i++; setTimeout(next, 300); });
      };
      next();
    });
    const side = document.createElement("div");
    side.className = "book-side";
    const num = document.createElement("div");
    num.className = "book-num";
    num.textContent = `Dialogue ${di + 1}`;
    side.append(num, pic, play);
    card.append(side, body);
    box.appendChild(card);
  });

  const lad = document.getElementById("freq-ladder");
  lad.innerHTML = `
    <div class="ladder lv-basic"><h3>🌱 초급</h3>
      <p><b>once</b> 한 번 · <b>twice</b> 두 번 · <b>three times</b> 세 번</p>
      <p>+ <b>a day</b> 하루에 · <b>a week</b> 일주일에</p>
      <p class="ex">I brush my teeth <u>twice a day</u>.</p></div>
    <div class="ladder lv-mid"><h3>🌿 중급</h3>
      <p><b>four ~ ten times</b> · <b>a month</b> 한 달에 · <b>a year</b> 일 년에</p>
      <p><b>every day</b> 매일 · <b>every weekend</b> 주말마다</p>
      <p class="ex">I go to the dentist <u>twice a year</u>.<br>You should ~ <u>more often</u>. — <u>I'll try.</u></p></div>
    <div class="ladder lv-adv"><h3>🌳 고급</h3>
      <p><b>always</b> 100% · <b>usually</b> 80% · <b>often</b> 60% · <b>sometimes</b> 30% · <b>never</b> 0%</p>
      <p>+ 언제·누구와 (after school, with my family) + 이유</p>
      <p class="ex">I <u>usually</u> ride my bike twice a week <u>with my friends</u>. <u>It's fun.</u></p></div>`;
  lad.querySelectorAll(".ex").forEach(p => p.addEventListener("click", () => speak(p.textContent.replace(/—/g, ""))));
}

/* ===========================================================
 * 🎯 빈도 퀴즈
 *  👀 그림 보고 고르기 : 빈도 그림을 보고 알맞은 문장 고르기
 *  👂 듣고 고르기     : 문장을 듣고 알맞은 빈도 그림 고르기
 * =========================================================== */
const quiz = { mode: "see", level: "basic", qs: [], i: 0, score: 0, answered: false };
const QUIZ_LEN = 10;

function quizSel(level) {
  if (level === "adv") return { adv: rand(ADVERBS).key };
  if (level === "mid" && Math.random() < 0.2) return { every: rand(["everyday", "everyweekend"]) };
  const per = rand(LEVELS[level].periods);
  const max = level === "basic" ? 3 : { day: 5, week: 7, month: 6, year: 4 }[per];
  return { n: 1 + Math.floor(Math.random() * max), per };
}
const selKey = s => s.adv || s.every || `${s.n}-${s.per}`;
function makeQuiz() {
  const pool = ACTIVITIES.filter(a => quiz.level === "adv" || a.lv <= (quiz.level === "basic" ? 1 : 2));
  return shuffle(pool).slice(0, QUIZ_LEN).map(a => {
    const ans = quizSel(quiz.level);
    const opts = [ans];
    let guard = 0;
    while (opts.length < 4 && guard++ < 200) {
      const s = quiz.level === "basic" || Math.random() < 0.5
        ? { n: ans.n || 1 + Math.floor(Math.random() * 3), per: rand(LEVELS[quiz.level].periods) } : quizSel(quiz.level);
      if (quiz.level === "adv") Object.assign(s, { adv: rand(ADVERBS).key, n: null, per: null });
      if (quiz.level === "basic" && Math.random() < 0.5) s.n = 1 + Math.floor(Math.random() * 3);
      if (!opts.some(o => selKey(o) === selKey(s))) opts.push(s);
    }
    return { a, ans, opts: shuffle(opts) };
  });
}
function renderQuiz() {
  const root = document.getElementById("quiz");
  root.innerHTML = "";
  const head = document.createElement("div");
  head.className = "quiz-head";
  const modes = document.createElement("div");
  modes.className = "cat-switch";
  [["see", "👀 그림 보고 고르기"], ["listen", "👂 듣고 고르기"]].forEach(([k, l]) => {
    const b = document.createElement("button");
    b.className = "cat-btn" + (quiz.mode === k ? " active" : "");
    b.textContent = l;
    b.addEventListener("click", () => { quiz.mode = k; startQuiz(); });
    modes.appendChild(b);
  });
  const lvs = document.createElement("div");
  lvs.className = "cat-switch";
  Object.entries(LEVELS).forEach(([k, v]) => {
    const b = document.createElement("button");
    b.className = "cat-btn lvbtn lv-" + k + (quiz.level === k ? " active" : "");
    b.textContent = v.label;
    b.addEventListener("click", () => { quiz.level = k; startQuiz(); });
    lvs.appendChild(b);
  });
  head.append(modes, lvs);
  root.appendChild(head);

  if (quiz.i >= quiz.qs.length) {
    const end = document.createElement("div");
    end.className = "quiz-end";
    const stars = quiz.score >= 9 ? "⭐⭐⭐" : quiz.score >= 6 ? "⭐⭐" : "⭐";
    end.innerHTML = `<div class="qe-stars">${stars}</div><div class="qe-score">${quiz.score} / ${quiz.qs.length}</div>
      <div class="qe-msg">${quiz.score >= 9 ? "Excellent! 빈도 표현 박사예요!" : quiz.score >= 6 ? "Good job! 조금만 더 연습해요!" : "Keep trying! 다시 도전해 봐요!"}</div>`;
    const again = document.createElement("button");
    again.className = "btn primary";
    again.textContent = "🔁 다시 하기";
    again.addEventListener("click", startQuiz);
    end.appendChild(again);
    root.appendChild(end);
    speak(quiz.score >= 6 ? "Great job!" : "Good try!");
    return;
  }

  const q = quiz.qs[quiz.i];
  const prog = document.createElement("div");
  prog.className = "quiz-prog";
  prog.innerHTML = `<span>문제 ${quiz.i + 1} / ${quiz.qs.length}</span><span>점수 ${quiz.score}</span>
    <div class="qp-bar"><div style="width:${(quiz.i / quiz.qs.length) * 100}%"></div></div>`;
  root.appendChild(prog);

  const card = document.createElement("div");
  card.className = "quiz-card";
  const correctEn = answerEn(q.a, q.ans);
  if (quiz.mode === "see") {
    const top = document.createElement("div");
    top.className = "quiz-top";
    top.append(makeVisual(q.a, "quiz-pic"), freqVisual(q.ans, q.a.emoji));
    const ask = document.createElement("div");
    ask.className = "quiz-ask";
    ask.innerHTML = `🙋 <b>${questionEn(q.a)}</b><span>그림을 보고 알맞은 대답을 골라요.</span>`;
    card.append(ask, top);
    speak(questionEn(q.a));
  } else {
    const ask = document.createElement("div");
    ask.className = "quiz-ask";
    ask.innerHTML = `👂 <b>잘 듣고 알맞은 빈도 그림을 골라요.</b>`;
    const again = document.createElement("button");
    again.className = "btn primary";
    again.textContent = "🔊 다시 듣기";
    again.addEventListener("click", () => speak(`${questionEn(q.a)} ${correctEn}`));
    const top = document.createElement("div");
    top.className = "quiz-top";
    top.append(makeVisual(q.a, "quiz-pic"), again);
    card.append(ask, top);
    setTimeout(() => speak(`${questionEn(q.a)} ${correctEn}`), 250);
  }
  const opts = document.createElement("div");
  opts.className = "quiz-opts " + quiz.mode;
  const fb = document.createElement("div");
  fb.className = "quiz-fb";
  q.opts.forEach((o, k) => {
    const b = document.createElement("button");
    b.className = "quiz-opt";
    if (quiz.mode === "see") b.innerHTML = `<span class="qo-k">${"ABCD"[k]}</span> ${answerEn(q.a, o)}`;
    else { b.innerHTML = `<span class="qo-k">${"ABCD"[k]}</span>`; b.appendChild(freqVisual(o, q.a.emoji, true)); }
    b.addEventListener("click", () => {
      if (quiz.answered) return;
      quiz.answered = true;
      const ok = selKey(o) === selKey(q.ans);
      if (ok) quiz.score++;
      opts.querySelectorAll(".quiz-opt").forEach((x, j) => {
        if (selKey(q.opts[j]) === selKey(q.ans)) x.classList.add("right");
        else if (x === b) x.classList.add("wrong");
      });
      fb.className = "quiz-fb " + (ok ? "good" : "bad");
      fb.innerHTML = `${ok ? "⭕ 정답!" : "❌ 아쉬워요!"} <b>${correctEn}</b> <span>${answerKo(q.a, q.ans)}</span>`;
      speak(correctEn);
      const next = document.createElement("button");
      next.className = "btn primary";
      next.textContent = quiz.i < quiz.qs.length - 1 ? "다음 문제 ▶" : "결과 보기 🏁";
      next.addEventListener("click", () => { quiz.i++; quiz.answered = false; renderQuiz(); });
      fb.appendChild(next);
    });
    opts.appendChild(b);
  });
  card.append(opts, fb);
  root.appendChild(card);
}
function startQuiz() { quiz.qs = makeQuiz(); quiz.i = 0; quiz.score = 0; quiz.answered = false; synth.cancel(); renderQuiz(); }
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

/* 🎙️ 연습 기록 요약: 지금 습관표 문장들의 총 연습 횟수 · 평균 정확도 · 연습한 문장 수 */
function renderPracticeSummary() {
  const box = document.getElementById("practice-summary");
  if (!box) return;
  const sentences = habits.map(h => answerMain(findAct(h.id), h.sel));
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
document.getElementById("stats-reset").addEventListener("click", () => {
  if (!confirm("연습 기록(횟수 · 평균 · 최고 정확도)을 모두 지울까요?")) return;
  stats = {}; saveStats(); renderHabits();
});

/* ===========================================================
 * 📝 나의 생활 습관표 (연습하기 탭)
 * =========================================================== */
function renderHabits() {
  const box = document.getElementById("habit-board");
  box.innerHTML = "";
  const head = document.createElement("div");
  head.className = "plan-board-head";
  head.textContent = "🔁 나의 생활 습관표 · My Habits";
  box.appendChild(head);
  if (!habits.length) {
    const empty = document.createElement("div");
    empty.className = "habit-empty";
    empty.innerHTML = "아직 담은 대화가 없어요.<br><b>🌱 초급 · 🌿 중급 · 🌳 고급</b> 탭에서 활동과 빈도를 고르고 <b>➕ 습관표에 담기</b>를 눌러요!";
    box.appendChild(empty);
  }
  habits.forEach((h, i) => {
    const a = findAct(h.id);
    const lines = dialogLines(a, h.sel);
    const main = answerMain(a, h.sel);   // 말하기 채점은 첫 문장으로
    const row = document.createElement("div");
    row.className = "plan-row tone-" + (i % 6);
    const when = document.createElement("div");
    when.className = "plan-when";
    when.innerHTML = `<span class="plan-when-emoji">${a.emoji}</span><span>${LEVELS[h.level].label}</span>`;
    const body = document.createElement("div");
    body.className = "plan-body";
    const qEl = document.createElement("div"); qEl.className = "plan-q"; qEl.appendChild(buildWords("Q. " + lines[0].en));
    const aEl = document.createElement("div"); aEl.className = "plan-a"; aEl.appendChild(buildWords("A. " + lines[1].en));
    const ko = document.createElement("div"); ko.className = "ko"; ko.textContent = lines[1].ko;
    const re = document.createElement("div"); re.className = "plan-re";
    re.textContent = "💬 " + lines.slice(2).map(l => l.en).join(" → ");
    body.append(qEl, aEl, ko, re, makeMicTools(main));
    const visual = makeVisual(a, "plan-thumb");
    const tools = document.createElement("div");
    tools.className = "plan-tools";
    const btn = document.createElement("button");
    btn.className = "speak-btn small"; btn.textContent = "🔊";
    btn.setAttribute("aria-label", "듣기");
    btn.addEventListener("click", () => speak(lines.map(l => l.en).join(" ")));
    const del = document.createElement("button");
    del.className = "premove"; del.textContent = "✕"; del.title = "습관표에서 빼기";
    del.addEventListener("click", () => { habits.splice(i, 1); persist(); updateHabitBadge(); renderHabits(); });
    tools.append(btn, del);
    row.append(when, body, visual, tools);
    box.appendChild(row);
  });
  document.getElementById("habit-listen-all").disabled = !habits.length;
  updateHabitBadge();
  renderPracticeSummary();
}
document.getElementById("habit-listen-all").addEventListener("click", () => {
  const text = habits.map(h => { const a = findAct(h.id); return `${questionEn(a)} ${answerEn(a, h.sel)}`; }).join(" ");
  if (text) speak(text);
});
document.getElementById("print-habits").addEventListener("click", () => {
  document.body.classList.add("print-plan");
  window.print();
  setTimeout(() => document.body.classList.remove("print-plan"), 500);
});

/* ---------- 초기 렌더 ---------- */
renderBook();
Object.values(boards).forEach(b => b.render());
let quizStarted = false;
renderHabits();

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
    if (tab === "practice") renderHabits();
    else if (boards[tab]) boards[tab].refresh();
    else if (tab === "quiz" && !quizStarted) { quizStarted = true; startQuiz(); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

/* ---------- 속도 조절 ---------- */
document.getElementById("rate").addEventListener("input", e => {
  speakRate = parseFloat(e.target.value);
});
