# How often do you ___? · 얼마나 자주 하니?

6학년 영어 **10단원 How often do you ___?** 학습용 웹앱입니다.
교과서 대화를 그대로 담고, 빈도 표현을 **🌱 초급 · 🌿 중급 · 🌳 고급**으로 나눠 묻고 답하며 익힐 수 있도록 만들었습니다.
(6학년 *What are you going to do?*, 5학년 *My Favorite* 와 같은 구성, ❄️ 겨울 테마)

## 주요 표현

| 역할 | 표현 |
|------|------|
| 묻기 | **How often do you** brush your teeth**?** |
| 대답 | **I** brush my teeth **twice a day.** |
| 반응 | **Good for you!** / **You should** brush your teeth **more often.** — **I'll try.** |

## 수준별 빈도 표현

| 수준 | 빈도 표현 | 예시 |
|------|-----------|------|
| 🌱 초급 | once · twice · three times × a day · a week | I brush my teeth **twice a day**. |
| 🌿 중급 | once ~ ten times × a day · a week · a month · a year, every day · every weekend, **more often / less often**, I'll try. | I go to the dentist **twice a year**. / You should play computer games **less often**. |
| 🌳 고급 | 빈도부사 **always(100%) · usually(80%) · often(60%) · sometimes(30%) · never(0%)** + 횟수 + 언제·누구와 + 이유 한 문장 | I **usually** ride my bike twice a week **with my friends**. **It's fun.** |

## 기능

- 📘 **교과서 대화** — 핵심 낱말 7개(once, twice, often, eat, vegetable, exercise, brush) · 교과서 대화 5개 🔊 듣기 · **역할 놀이**(A/B 역할을 고르면 내 차례 말풍선이 가려짐) · 수준별 빈도 표현 한눈에 보기
- 🌱🌿🌳 **수준별 묻고 답하기**
  - 1️⃣ 활동 카드(초급 40개 · 중급·고급 57개)를 고르면 질문이 바로 나옴 — 📘 교과서 표현 · 🧒 우리 생활 표현 20개 · 🍎 건강 습관 · 🏠 집·공부 · ⚽ 운동·취미 · 👨‍👩‍👧 가족·나들이
  - 2️⃣ 빈도 칩(몇 번? · 언제마다? · 또는 every day …)을 고르면 대답이 완성되고 **📅 빈도 그림**(하루 · 일주일 달력 · 한 달 달력 · 열두 달 · 빈도부사 막대)이 함께 바뀜
  - 친구의 반응이 자동으로 이어짐: 건강한 습관을 충분히 하면 **Good for you!**, 부족하면 **You should ~ more often.**, 게임·TV·스마트폰·패스트푸드를 너무 많이 하면 **You should ~ less often.** → **I'll try.**
  - 🔊 대화 듣기(말풍선이 차례로 빛남) · 🎲 아무거나 · ➕ 습관표에 담기
- 🎯 **빈도 퀴즈** (수준별 10문제) — 👀 빈도 그림을 보고 알맞은 문장 고르기 / 👂 문장을 듣고 알맞은 빈도 그림 고르기
- 🎤 **연습하기 · 나의 생활 습관표** — 담은 대화(최대 12개) 🔊 듣기 · **🎙️ 말하기**(음성 인식 정확도 · 단어별 색깔 피드백 · 녹음해서 **▶ 내 목소리** 듣기) · 연습 기록 · 🖨️ 인쇄
- 단어 클릭 시 **뜻 풍선 + 발음**, 말하기 **속도 조절**

## 🧒 우리 생활 표현 20개

교과서 밖에서 초등학생이 실제로 자주 하는 일로 골랐습니다. 활동 카드의 **🧒 우리 생활 20** 버튼으로 모아 볼 수 있습니다.

eat breakfast · watch YouTube · study math · write in my diary · walk my dog · learn coding · take pictures · play board games · bake cookies · play basketball · play dodgeball · dance to K-pop · sing songs · go roller skating · jump on a trampoline · fly a kite · go to a karaoke room · go to an amusement park · go to a water park · have a sleepover

- 아침밥은 일주일에 6번 이상이면 *Good for you!*, 유튜브는 하루에 한 번보다 많으면 *You should watch YouTube less often.* 처럼 반응이 달라집니다.

## 그림

활동 그림은 **Canva로 만든 같은 그림체의 일러스트**입니다(`images/활동id.png`, 예: `images/brush.png`).
인터넷 연결 없이도 보이고, 그림 파일이 없으면 이모지가 대신 보입니다.
그림을 바꾸려면 `images/` 폴더의 같은 이름 파일을 바꾸거나, `data.js` 의 해당 활동에 `photo: "images/파일.png"` 를 추가하세요.

## 사용 방법

`index.html`을 브라우저(크롬 권장)에서 열면 됩니다. 별도 설치가 필요 없습니다.
음성은 브라우저 내장 **Web Speech API**(음성 합성·음성 인식)와 **MediaRecorder**(녹음)를 사용합니다. 습관표와 연습 기록은 브라우저(localStorage)에 저장됩니다.

## 파일 구성

| 파일 | 설명 |
|------|------|
| `index.html` | 화면 구조(탭·섹션) |
| `style.css`  | 디자인·겨울 테마 |
| `data.js`    | 활동 57개(질문·대답·한국어·수준·반응 기준), 빈도 표현(횟수·기간·빈도부사·덧붙이기·이유), 교과서 대화, 단어 뜻 |
| `app.js`     | 음성·단어 풍선·수준별 보드·빈도 그림·교과서 역할 놀이·퀴즈·습관표·말하기 채점·녹음 로직 |
| `images/`    | 활동 그림 (Canva 제작) |
