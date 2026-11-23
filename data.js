/* =========================================================
 * 6학년 10단원 · How often do you ___? 데이터
 * - 질문 : How often do you brush your teeth?
 * - 대답 : I brush my teeth twice a day.
 * - 반응 : Good for you! / You should brush your teeth more often. — I'll try.
 *
 * 수준
 *  🌱 초급 : once · twice · three times  ×  a day · a week
 *  🌿 중급 : once ~ ten times  ×  a day · a week · a month · a year  (+ every day · every weekend)
 *  🌳 고급 : always · usually · often · sometimes · never  + 횟수 + 언제·누구와 + 이유 한 문장
 *
 * ※ 그림: images/활동id.png (Canva로 만든 그림). 그림이 없으면 이모지로 보여 줘요.
 * ========================================================= */

/* ===== 활동 종류 ===== */
const ACT_CATS = [
  { key: "health", label: "🍎 건강 습관" },
  { key: "home",   label: "🏠 집·공부" },
  { key: "sports", label: "⚽ 운동·취미" },
  { key: "out",    label: "👨‍👩‍👧 가족·나들이" },
];

/* ===== 활동 =====
 * q    : 질문 속 말 (How often do you ___?)
 * a    : 대답 속 말 (I ___ twice a day.)
 * koQ  : "너는 얼마나 자주 ___?"   koA : "나는 하루에 두 번 ___."
 * lv   : 1 = 초급부터 · 2 = 중급부터 (고급은 전부)
 * rule : good = 이만큼(일주일 기준 횟수) 이상이면 Good for you! / 적으면 more often
 *        less = 이만큼보다 많으면 less often / 적으면 Good for you!
 *        (없으면 Sounds fun! 같은 반응)
 * book : 📘 교과서 표현
 * life : 🧒 우리 생활 표현 (교과서 밖, 초등학생 생활과 가까운 표현 20개)
 * rec  : 자연스러운 빈도 예시 (랜덤 · 퀴즈에 사용)
 */
const ACTIVITIES = [
  /* 📘 교과서 */
  { id: "brush",      emoji: "🪥", cat: "health", lv: 1, book: true, q: "brush your teeth",      a: "brush my teeth",      koQ: "이를 닦니",            koA: "이를 닦아",            rule: { good: 14 }, rec: [3, "day"] },
  { id: "exercise",   emoji: "🏃", cat: "health", lv: 1, book: true, q: "exercise",              a: "exercise",            koQ: "운동하니",             koA: "운동해",               rule: { good: 3 },  rec: [2, "week"] },
  { id: "vegetables", emoji: "🥦", cat: "health", lv: 1, book: true, q: "eat vegetables",        a: "eat vegetables",      koQ: "채소를 먹니",          koA: "채소를 먹어",          rule: { good: 14 }, rec: [3, "day"] },
  { id: "wash",       emoji: "🧼", cat: "health", lv: 1, book: true, q: "wash your hands",       a: "wash my hands",       koQ: "손을 씻니",            koA: "손을 씻어",            rule: { good: 28 }, rec: [5, "day"] },
  { id: "library",    emoji: "📚", cat: "out",    lv: 1, book: true, q: "go to the library",     a: "go to the library",   koQ: "도서관에 가니",        koA: "도서관에 가",          rule: { good: 2 },  rec: [1, "week"] },
  /* 🍎 건강 습관 */
  { id: "milk",       emoji: "🥛", cat: "health", lv: 1, q: "drink milk",            a: "drink milk",            koQ: "우유를 마시니",          koA: "우유를 마셔",          rule: { good: 7 },  rec: [1, "day"] },
  { id: "fruit",      emoji: "🍎", cat: "health", lv: 1, q: "eat fruit",             a: "eat fruit",             koQ: "과일을 먹니",            koA: "과일을 먹어",          rule: { good: 7 },  rec: [2, "day"] },
  { id: "sleep",      emoji: "😴", cat: "health", lv: 1, q: "go to bed early",       a: "go to bed early",       koQ: "일찍 자니",              koA: "일찍 자",              rule: { good: 5 },  rec: [4, "week"] },
  { id: "shower",     emoji: "🚿", cat: "health", lv: 1, q: "take a shower",         a: "take a shower",         koQ: "샤워하니",               koA: "샤워해",               rule: { good: 5 },  rec: [1, "day"] },
  { id: "fastfood",   emoji: "🍔", cat: "health", lv: 1, q: "eat fast food",         a: "eat fast food",         koQ: "패스트푸드를 먹니",      koA: "패스트푸드를 먹어",    rule: { less: 1 },  rec: [2, "month"] },
  { id: "dentist",    emoji: "🦷", cat: "health", lv: 2, q: "go to the dentist",     a: "go to the dentist",     koQ: "치과에 가니",            koA: "치과에 가",            rule: { good: 2 / 52 }, rec: [2, "year"] },
  { id: "haircut",    emoji: "💇", cat: "health", lv: 2, q: "get a haircut",         a: "get a haircut",         koQ: "머리를 자르니",          koA: "머리를 잘라",          rec: [1, "month"] },
  /* 🏠 집·공부 */
  { id: "clean",      emoji: "🧹", cat: "home",   lv: 1, q: "clean your room",       a: "clean my room",         koQ: "방을 청소하니",          koA: "방을 청소해",          rule: { good: 1 },  rec: [2, "week"] },
  { id: "read",       emoji: "📖", cat: "home",   lv: 1, q: "read books",            a: "read books",            koQ: "책을 읽니",              koA: "책을 읽어",            rule: { good: 3 },  rec: [4, "week"] },
  { id: "homework",   emoji: "✏️", cat: "home",   lv: 1, q: "do your homework",      a: "do my homework",        koQ: "숙제를 하니",            koA: "숙제를 해",            rule: { good: 5 },  rec: [5, "week"] },
  { id: "dishes",     emoji: "🍽️", cat: "home",   lv: 1, q: "do the dishes",         a: "do the dishes",         koQ: "설거지를 하니",          koA: "설거지를 해",          rule: { good: 1 },  rec: [1, "week"] },
  { id: "english",    emoji: "🔤", cat: "home",   lv: 1, q: "study English",         a: "study English",         koQ: "영어를 공부하니",        koA: "영어를 공부해",        rule: { good: 3 },  rec: [3, "week"] },
  { id: "cook",       emoji: "🍳", cat: "home",   lv: 2, q: "cook",                  a: "cook",                  koQ: "요리하니",               koA: "요리해",               rec: [2, "month"] },
  { id: "walk",       emoji: "🎒", cat: "home",   lv: 1, q: "walk to school",        a: "walk to school",        koQ: "걸어서 학교에 가니",     koA: "걸어서 학교에 가",     rec: [5, "week"] },
  { id: "music",      emoji: "🎧", cat: "home",   lv: 1, q: "listen to music",       a: "listen to music",       koQ: "음악을 듣니",            koA: "음악을 들어",          rec: [1, "day"] },
  { id: "tv",         emoji: "📺", cat: "home",   lv: 1, q: "watch TV",              a: "watch TV",              koQ: "TV를 보니",              koA: "TV를 봐",              rule: { less: 7 },  rec: [3, "week"] },
  { id: "games",      emoji: "🎮", cat: "home",   lv: 1, q: "play computer games",   a: "play computer games",   koQ: "컴퓨터 게임을 하니",     koA: "컴퓨터 게임을 해",     rule: { less: 3 },  rec: [2, "week"] },
  { id: "phone",      emoji: "📱", cat: "home",   lv: 1, q: "use your smartphone",   a: "use my smartphone",     koQ: "스마트폰을 쓰니",        koA: "스마트폰을 써",        rule: { less: 7 },  rec: [1, "day"] },
  /* ⚽ 운동·취미 */
  { id: "soccer",     emoji: "⚽", cat: "sports", lv: 1, q: "play soccer",           a: "play soccer",           koQ: "축구를 하니",            koA: "축구를 해",            rec: [2, "week"] },
  { id: "bike",       emoji: "🚲", cat: "sports", lv: 1, q: "ride your bike",        a: "ride my bike",          koQ: "자전거를 타니",          koA: "자전거를 타",          rec: [3, "week"] },
  { id: "swim",       emoji: "🏊", cat: "sports", lv: 1, q: "go swimming",           a: "go swimming",           koQ: "수영하러 가니",          koA: "수영하러 가",          rec: [1, "week"] },
  { id: "rope",       emoji: "🪢", cat: "sports", lv: 1, q: "jump rope",             a: "jump rope",             koQ: "줄넘기를 하니",          koA: "줄넘기를 해",          rec: [3, "week"] },
  { id: "taekwondo",  emoji: "🥋", cat: "sports", lv: 1, q: "practice taekwondo",    a: "practice taekwondo",    koQ: "태권도를 연습하니",      koA: "태권도를 연습해",      rec: [5, "week"] },
  { id: "badminton",  emoji: "🏸", cat: "sports", lv: 2, q: "play badminton",        a: "play badminton",        koQ: "배드민턴을 치니",        koA: "배드민턴을 쳐",        rec: [2, "month"] },
  { id: "piano",      emoji: "🎹", cat: "sports", lv: 1, q: "play the piano",        a: "play the piano",        koQ: "피아노를 치니",          koA: "피아노를 쳐",          rec: [2, "week"] },
  { id: "draw",       emoji: "🎨", cat: "sports", lv: 1, q: "draw pictures",         a: "draw pictures",         koQ: "그림을 그리니",          koA: "그림을 그려",          rec: [3, "week"] },
  /* 👨‍👩‍👧 가족·나들이 */
  { id: "grandparents", emoji: "👵", cat: "out", lv: 2, q: "visit your grandparents", a: "visit my grandparents", koQ: "조부모님을 찾아뵙니", koA: "조부모님을 찾아뵈어", rule: { good: 1 / 4.3 }, rec: [1, "month"] },
  { id: "movies",     emoji: "🎬", cat: "out",    lv: 2, q: "go to the movies",      a: "go to the movies",      koQ: "영화를 보러 가니",       koA: "영화를 보러 가",       rec: [1, "month"] },
  { id: "shopping",   emoji: "🛍️", cat: "out",    lv: 2, q: "go shopping",           a: "go shopping",           koQ: "쇼핑하러 가니",          koA: "쇼핑하러 가",          rec: [2, "month"] },
  { id: "camping",    emoji: "⛺", cat: "out",    lv: 2, q: "go camping",            a: "go camping",            koQ: "캠핑하러 가니",          koA: "캠핑하러 가",          rec: [3, "year"] },
  { id: "hiking",     emoji: "⛰️", cat: "out",    lv: 2, q: "go hiking",             a: "go hiking",             koQ: "등산하러 가니",          koA: "등산하러 가",          rec: [1, "month"] },
  { id: "fishing",    emoji: "🎣", cat: "out",    lv: 2, q: "go fishing",            a: "go fishing",            koQ: "낚시하러 가니",          koA: "낚시하러 가",          rec: [2, "year"] },
  /* 🧒 우리 생활 표현 20개 (life: true) — 교과서 밖, 초등학생 생활과 가까운 표현 */
  { id: "breakfast",  emoji: "🍳", cat: "health", lv: 1, life: true, q: "eat breakfast",          a: "eat breakfast",          koQ: "아침밥을 먹니",            koA: "아침밥을 먹어",            rule: { good: 6 },  rec: [5, "week"] },
  { id: "youtube",    emoji: "▶️", cat: "home",   lv: 1, life: true, q: "watch YouTube",          a: "watch YouTube",          koQ: "유튜브를 보니",            koA: "유튜브를 봐",              rule: { less: 7 },  rec: [1, "day"] },
  { id: "math",       emoji: "➕", cat: "home",   lv: 1, life: true, q: "study math",             a: "study math",             koQ: "수학 공부를 하니",         koA: "수학 공부를 해",           rule: { good: 3 },  rec: [3, "week"] },
  { id: "diary",      emoji: "📔", cat: "home",   lv: 1, life: true, q: "write in your diary",    a: "write in my diary",      koQ: "일기를 쓰니",              koA: "일기를 써",                rule: { good: 2 },  rec: [2, "week"] },
  { id: "dog",        emoji: "🐶", cat: "home",   lv: 1, life: true, q: "walk your dog",          a: "walk my dog",            koQ: "강아지를 산책시키니",      koA: "강아지를 산책시켜",        rec: [1, "day"] },
  { id: "coding",     emoji: "💻", cat: "home",   lv: 1, life: true, q: "learn coding",           a: "learn coding",           koQ: "코딩을 배우니",            koA: "코딩을 배워",              rec: [1, "week"] },
  { id: "photos",     emoji: "📸", cat: "home",   lv: 1, life: true, q: "take pictures",          a: "take pictures",          koQ: "사진을 찍니",              koA: "사진을 찍어",              rec: [2, "day"] },
  { id: "boardgame",  emoji: "🎲", cat: "home",   lv: 1, life: true, q: "play board games",       a: "play board games",       koQ: "보드게임을 하니",          koA: "보드게임을 해",            rec: [1, "week"] },
  { id: "cookies",    emoji: "🍪", cat: "home",   lv: 2, life: true, q: "bake cookies",           a: "bake cookies",           koQ: "쿠키를 굽니",              koA: "쿠키를 구워",              rec: [1, "month"] },
  { id: "basketball", emoji: "🏀", cat: "sports", lv: 1, life: true, q: "play basketball",        a: "play basketball",        koQ: "농구를 하니",              koA: "농구를 해",                rec: [2, "week"] },
  { id: "dodgeball",  emoji: "🔴", cat: "sports", lv: 1, life: true, q: "play dodgeball",         a: "play dodgeball",         koQ: "피구를 하니",              koA: "피구를 해",                rec: [1, "week"] },
  { id: "dance",      emoji: "💃", cat: "sports", lv: 1, life: true, q: "dance to K-pop",         a: "dance to K-pop",         koQ: "케이팝에 맞춰 춤을 추니",  koA: "케이팝에 맞춰 춤을 춰",    rec: [3, "week"] },
  { id: "sing",       emoji: "🎤", cat: "sports", lv: 1, life: true, q: "sing songs",             a: "sing songs",             koQ: "노래를 부르니",            koA: "노래를 불러",              rec: [1, "day"] },
  { id: "roller",     emoji: "🛼", cat: "sports", lv: 2, life: true, q: "go roller skating",      a: "go roller skating",      koQ: "롤러스케이트를 타러 가니", koA: "롤러스케이트를 타러 가",   rec: [2, "month"] },
  { id: "trampoline", emoji: "🤸", cat: "sports", lv: 2, life: true, q: "jump on a trampoline",   a: "jump on a trampoline",   koQ: "트램펄린에서 뛰니",        koA: "트램펄린에서 뛰어",        rec: [2, "month"] },
  { id: "kite",       emoji: "🪁", cat: "sports", lv: 2, life: true, q: "fly a kite",             a: "fly a kite",             koQ: "연을 날리니",              koA: "연을 날려",                rec: [1, "year"] },
  { id: "karaoke",    emoji: "🎶", cat: "out",    lv: 1, life: true, q: "go to a karaoke room",   a: "go to a karaoke room",   koQ: "코인노래방에 가니",        koA: "코인노래방에 가",          rec: [2, "month"] },
  { id: "amusement",  emoji: "🎢", cat: "out",    lv: 2, life: true, q: "go to an amusement park", a: "go to an amusement park", koQ: "놀이공원에 가니",        koA: "놀이공원에 가",            rec: [2, "year"] },
  { id: "waterpark",  emoji: "🌊", cat: "out",    lv: 2, life: true, q: "go to a water park",     a: "go to a water park",     koQ: "워터파크에 가니",          koA: "워터파크에 가",            rec: [1, "year"] },
  { id: "sleepover",  emoji: "🛌", cat: "out",    lv: 2, life: true, q: "have a sleepover",       a: "have a sleepover",       koQ: "친구랑 파자마 파티를 하니", koA: "친구랑 파자마 파티를 해", rec: [2, "year"] },
];

/* ===== 빈도 표현 ===== */
const NUM_EN = ["", "once", "twice", "three times", "four times", "five times", "six times", "seven times", "eight times", "nine times", "ten times"];
const NUM_KO = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉", "열"];
const PERIODS = {
  day:   { en: "a day",   ko: "하루에",   perWeek: 7 },
  week:  { en: "a week",  ko: "일주일에", perWeek: 1 },
  month: { en: "a month", ko: "한 달에",  perWeek: 12 / 52 },
  year:  { en: "a year",  ko: "일 년에",  perWeek: 1 / 52 },
};
/* 횟수 없이 쓰는 표현 (중급·고급) */
const EVERY = {
  everyday:     { en: "every day",     ko: "매일",       perWeek: 7 },
  everyweekend: { en: "every weekend", ko: "주말마다",   perWeek: 2 },
};
/* 빈도부사 (고급) : I always brush my teeth. */
const ADVERBS = [
  { key: "always",    en: "always",    ko: "항상",     pct: 100, perWeek: 7 },
  { key: "usually",   en: "usually",   ko: "보통",     pct: 80,  perWeek: 5 },
  { key: "often",     en: "often",     ko: "자주",     pct: 60,  perWeek: 3.5 },
  { key: "sometimes", en: "sometimes", ko: "가끔",     pct: 30,  perWeek: 1 },
  { key: "never",     en: "never",     ko: "전혀 ~않아", pct: 0, perWeek: 0 },
];
/* 덧붙이기 (고급) : 언제 · 누구와 */
const EXTRAS = [
  { key: "after-meals",   en: "after meals",       ko: "식사 후에" },
  { key: "after-school",  en: "after school",      ko: "방과 후에" },
  { key: "morning",       en: "in the morning",    ko: "아침에" },
  { key: "before-bed",    en: "before bed",        ko: "자기 전에" },
  { key: "weekends",      en: "on weekends",       ko: "주말에" },
  { key: "family",        en: "with my family",    ko: "가족과 함께" },
  { key: "friends",       en: "with my friends",   ko: "친구들과 함께" },
];
/* 이유 한 문장 (고급) */
const REASONS = [
  { key: "health", en: "It's good for my health.", ko: "건강에 좋거든." },
  { key: "good",   en: "It's good for me.",        ko: "나한테 도움이 되거든." },
  { key: "fun",    en: "It's fun.",                ko: "재미있거든." },
  { key: "like",   en: "I like it.",               ko: "나는 그게 좋아." },
  { key: "busy",   en: "I'm too busy.",            ko: "너무 바빠서." },
  { key: "hard",   en: "It's hard for me.",        ko: "나한테는 어려워." },
];

/* ===== 고급 예시 문장에 붙일 말 (언제·누구와) ===== */
const ADV_EXTRA = {
  brush: "after-meals", exercise: "after-school", library: "weekends", milk: "morning", fruit: "after-school",
  shower: "before-bed", fastfood: "family", clean: "weekends", read: "before-bed", homework: "after-school",
  dishes: "family", english: "after-school", cook: "family", walk: "morning", music: "before-bed", tv: "after-school",
  games: "weekends", phone: "after-school", soccer: "friends", bike: "friends", swim: "weekends", rope: "after-school",
  taekwondo: "after-school", badminton: "family", piano: "after-school", draw: "weekends", grandparents: "family",
  movies: "friends", shopping: "family", camping: "family", hiking: "family", fishing: "family",
  breakfast: "morning", youtube: "before-bed", math: "after-school", diary: "before-bed", dog: "morning",
  coding: "after-school", photos: "friends", boardgame: "family", cookies: "family", basketball: "friends",
  dodgeball: "friends", dance: "friends", sing: "friends", roller: "friends", trampoline: "friends", kite: "family",
  karaoke: "friends", amusement: "family", waterpark: "family", sleepover: "friends",
};

/* ===== 친구의 반응 표현 ===== */
const REACTIONS = [
  { en: "Good for you!",                       ko: "잘하고 있구나!",              emoji: "👍", when: "자주 하는 좋은 습관을 들었을 때" },
  { en: "You should exercise more often.",     ko: "너는 더 자주 운동해야 해.",    emoji: "💪", when: "좋은 습관을 조금 할 때 (more often)" },
  { en: "You should watch TV less often.",     ko: "너는 TV를 덜 봐야 해.",        emoji: "⏬", when: "너무 많이 할 때 (less often)" },
  { en: "I'll try.",                           ko: "노력해 볼게.",                emoji: "🙂", when: "충고를 들었을 때" },
  { en: "Sounds fun!",                         ko: "재미있겠다!",                 emoji: "😆", when: "재미있는 활동을 들었을 때" },
  { en: "Wow, me too!",                        ko: "와, 나도 그래!",              emoji: "🙌", when: "나도 비슷하게 할 때" },
];

/* ===== 수준별 설정 ===== */
const LEVELS = {
  basic: { label: "🌱 초급", nums: [1, 2, 3],                      periods: ["day", "week"],                 every: [] },
  mid:   { label: "🌿 중급", nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], periods: ["day", "week", "month", "year"], every: ["everyday", "everyweekend"] },
  adv:   { label: "🌳 고급", nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], periods: ["day", "week", "month", "year"], every: ["everyday", "everyweekend"] },
};

/* ===== 📘 교과서 대화 ===== */
const TEXTBOOK_WORDS = [
  { en: "once",      ko: "한 번",  emoji: "1️⃣" },
  { en: "twice",     ko: "두 번",  emoji: "2️⃣" },
  { en: "often",     ko: "자주",   emoji: "🔁" },
  { en: "eat",       ko: "먹다",   emoji: "🍽️" },
  { en: "vegetable", ko: "채소",   emoji: "🥦" },
  { en: "exercise",  ko: "운동하다", emoji: "🏃" },
  { en: "brush",     ko: "닦다, 솔질하다", emoji: "🪥" },
];
const TEXTBOOK_DIALOGS = [
  { img: "exercise", lines: [
    ["A", "How often do you exercise?", "너는 얼마나 자주 운동하니?"],
    ["B", "I exercise twice a week.", "나는 일주일에 두 번 운동해."],
  ] },
  { img: "vegetables", lines: [
    ["A", "How often do you eat vegetables?", "너는 얼마나 자주 채소를 먹니?"],
    ["B", "I eat vegetables three times a day.", "나는 하루에 세 번 채소를 먹어."],
  ] },
  { img: "wash", lines: [
    ["A", "How often do you wash your hands?", "너는 얼마나 자주 손을 씻니?"],
    ["B", "I wash my hands five times a day.", "나는 하루에 다섯 번 손을 씻어."],
    ["A", "Good for you.", "잘하고 있구나."],
  ] },
  { img: "library", lines: [
    ["A", "How often do you go to the library?", "너는 얼마나 자주 도서관에 가니?"],
    ["B", "I go to the library once a week.", "나는 일주일에 한 번 도서관에 가."],
    ["A", "You should go to the library more often.", "너는 도서관에 더 자주 가야 해."],
    ["B", "I'll try.", "노력해 볼게."],
  ] },
  { img: "brush", lines: [
    ["A", "How often do you brush your teeth?", "너는 얼마나 자주 이를 닦니?"],
    ["B", "I brush my teeth once a day.", "나는 하루에 한 번 이를 닦아."],
    ["A", "You should brush your teeth more often.", "너는 이를 더 자주 닦아야 해."],
    ["B", "I'll try.", "노력해 볼게."],
  ] },
];

/* ===== 단어 뜻 ===== */
const WORD_MEANINGS = {
  how: "어떻게, 얼마나", often: "자주", "how often": "얼마나 자주", do: "하다 (질문을 만드는 말)", you: "너, 너는", i: "나는",
  once: "한 번", twice: "두 번", three: "셋, 3", four: "넷, 4", five: "다섯, 5", six: "여섯, 6", seven: "일곱, 7",
  eight: "여덟, 8", nine: "아홉, 9", ten: "열, 10", times: "~번, ~회", time: "번, 회; 시간",
  a: "하나의; ~마다 (a day = 하루에)", day: "날, 하루", week: "주, 일주일", month: "달, 한 달", year: "해, 일 년",
  every: "모든, ~마다", weekend: "주말", weekends: "주말", always: "항상, 언제나", usually: "보통, 대개",
  sometimes: "가끔, 때때로", never: "결코 ~않다, 한 번도 ~않다",
  good: "좋은", for: "~에게, ~을 위해", should: "~해야 한다", more: "더", less: "덜, 더 적게", try: "노력하다, 해 보다",
  "i'll": "나는 ~할 것이다 (I will)", "it's": "그것은 ~이다 (it is)", "i'm": "나는 ~이다 (I am)",
  brush: "닦다, 솔질하다", teeth: "이, 치아 (tooth의 복수)", your: "너의", my: "나의",
  exercise: "운동하다", eat: "먹다", vegetables: "채소들", vegetable: "채소", wash: "씻다", hands: "손 (복수)",
  go: "가다", to: "~에, ~로", the: "그", library: "도서관", drink: "마시다", milk: "우유", fruit: "과일",
  bed: "침대", early: "일찍", take: "(샤워를) 하다, 가지고 가다", shower: "샤워", fast: "빠른", food: "음식",
  dentist: "치과 의사, 치과", get: "받다, 얻다", haircut: "이발, 머리 자르기", clean: "청소하다, 깨끗한", room: "방",
  read: "읽다", books: "책들", homework: "숙제", dishes: "접시들, 설거지", study: "공부하다", english: "영어",
  cook: "요리하다", walk: "걷다", school: "학교", listen: "듣다", music: "음악", watch: "보다", tv: "텔레비전",
  play: "(놀이·운동을) 하다, (악기를) 연주하다", computer: "컴퓨터", games: "게임들", use: "쓰다, 사용하다", smartphone: "스마트폰",
  soccer: "축구", ride: "타다", bike: "자전거", swimming: "수영", jump: "뛰다", rope: "줄 (jump rope = 줄넘기하다)",
  practice: "연습하다", taekwondo: "태권도", badminton: "배드민턴", piano: "피아노", draw: "그리다", pictures: "그림들",
  visit: "방문하다, 찾아뵙다", grandparents: "조부모님", movies: "영화 (go to the movies = 영화 보러 가다)",
  shopping: "쇼핑", camping: "캠핑", hiking: "등산, 하이킹", fishing: "낚시",
  after: "~ 후에", meals: "식사", in: "~에", morning: "아침", before: "~ 전에", on: "~에", with: "~와 함께",
  family: "가족", friends: "친구들", health: "건강", fun: "재미있는", like: "좋아하다", it: "그것", too: "너무",
  busy: "바쁜", hard: "어려운", me: "나에게", wow: "와!", sounds: "~처럼 들리다", that: "그것", "that's": "그것은 ~이다",
  cool: "멋진", great: "훌륭한", nice: "좋은",
  breakfast: "아침밥", youtube: "유튜브", math: "수학", diary: "일기장 (write in my diary = 일기를 쓰다)", dog: "개, 강아지",
  learn: "배우다", coding: "코딩", board: "판 (board games = 보드게임)", bake: "굽다", cookies: "쿠키들",
  basketball: "농구", dodgeball: "피구", dance: "춤추다", "k-pop": "케이팝", sing: "노래하다", songs: "노래들",
  roller: "롤러 (roller skating = 롤러스케이트 타기)", skating: "스케이트 타기", trampoline: "트램펄린", fly: "날리다, 날다", kite: "연",
  karaoke: "노래방", an: "하나의 (모음 앞)", amusement: "놀이, 오락 (amusement park = 놀이공원)", park: "공원",
  water: "물 (water park = 워터파크)", have: "가지다, (파티를) 하다", sleepover: "친구 집에서 자고 오기, 파자마 파티",
};
