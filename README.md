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

## 기능 — 질문 고르기 → 대답 만들기 → 연습하기

1. ❓ **질문 고르기** — 활동 종류(📘 교과서 · 🧒 우리 생활 20 · 🍎 건강 · 🏠 집·공부 · ⚽ 운동·취미 · 👨‍👩‍👧 나들이)별 질문 카드 57개
   - 카드의 **✅ 이 질문 고르기**로 친구에게 물어볼 질문을 **최대 5개** 고름 · 아래 **고른 질문** 막대에서 확인하고 ✕로 빼기
   - 📘 교과서 대화 5개 · 핵심 낱말 7개 다시 보기
2. ✍️ **대답 만들기** — 고른 질문마다 수준(🌱 초급 · 🌿 중급 · 🌳 고급)을 정하고 빈도를 골라 **I ___ (몇 번) (언제마다).** 대답 완성
   - 말풍선 대화(질문 → 내 대답 → 친구 반응 → I'll try.)와 📅 빈도 그림이 바로 바뀜 · 🎲 예시로 채우기 · 다음 질문 ▶
   - 💡 빈도 표현 · 반응 표현 도움말 · 📝 **공책에 적기** 표(질문 · 내 대답)
3. 🎤 **연습하기** — 만든 대화마다 **🔊 대화 듣기** · **🎙️ 연습하기** 버튼
   - 🎙️ 연습하기를 누르면 줄마다 말하기(정확도 · 단어별 피드백 · 녹음해서 다시 듣기)와 🎭 역할극(내가 묻는 사람 / 대답하는 사람) 버튼이 나옴
   - 👫 짝 활동 카드: 내가 묻기 → 친구 대답 적기 → 반응하기 · 내 대답
- 🎯 **빈도 퀴즈** (수준별 10문제) — 👀 그림 보고 고르기 / 👂 듣고 고르기
- 단어 클릭 시 **뜻 풍선 + 발음**, 말하기 **속도 조절** · 고른 질문과 대답, 연습 기록은 브라우저에 저장

## 🧒 우리 생활 표현 20개

교과서 밖에서 초등학생이 실제로 자주 하는 일로 골랐습니다. 활동 카드의 **🧒 우리 생활 20** 버튼으로 모아 볼 수 있습니다.

eat breakfast · watch YouTube · study math · write in my diary · walk my dog · learn coding · take pictures · play board games · bake cookies · play basketball · play dodgeball · dance to K-pop · sing songs · go roller skating · jump on a trampoline · fly a kite · go to a karaoke room · go to an amusement park · go to a water park · have a sleepover

- 아침밥은 일주일에 6번 이상이면 *Good for you!*, 유튜브는 하루에 한 번보다 많으면 *You should watch YouTube less often.* 처럼 반응이 달라집니다.

## 그림

활동 그림은 **Canva로 만든 같은 그림체의 일러스트**입니다(`images/활동id.png`, 예: `images/brush.png`).
인터넷 연결 없이도 보이고, 그림 파일이 없으면 이모지가 대신 보입니다.
그림을 바꾸려면 `images/` 폴더의 같은 이름 파일을 바꾸거나, `data.js` 의 해당 활동에 `photo: "images/파일.png"` 를 추가하세요.

## 사용 방법

### GitHub Pages로 올리기
1. 저장소 **Settings → Pages** 로 가요.
2. **Source: Deploy from a branch** 를 고르고, 브랜치는 이 앱이 있는 브랜치(예: `main`), 폴더는 **/ (root)** 로 정한 뒤 **Save**.
3. 1~2분 뒤 `https://z2x3c4v5.github.io/10th_How_Often/` 에서 열려요. (HTTPS라서 크롬에서 🎙️ 말하기도 돼요)

`.nojekyll` 파일이 있어 GitHub가 파일을 그대로 올려요. 모든 경로가 상대 경로라 저장소 이름이 바뀌어도 그대로 동작해요.

### 컴퓨터에서 바로 열기

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
