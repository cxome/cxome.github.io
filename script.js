// 요소 선택
const board = document.querySelector("#board");
const keys = document.querySelectorAll(".key");
const rows = document.querySelectorAll(".row");
const modal = document.getElementById("ending-modal");
const retryBtn = document.getElementById("retry-btn");
const failModal = document.getElementById("fail-modal");
const failRetryBtn = document.getElementById("fail-retry-btn");
const correctWordDisplay = document.getElementById("correct-word");

// 상태 변수
let validWords = new Set();
let wordsList = [];
let ANSWER = "";

let currentRow = 0;
let currentCol = 0;
let resetInProgress = false;
let inputLocked = false;

// 단어 리스트 로드 및 정답 선택
async function loadWordList() {
  try {
    const response = await fetch("words.json");
    const data = await response.json();
    wordsList = data.words.map(word => word.toUpperCase());
    validWords = new Set(wordsList);
    pickRandomAnswer();
  } catch (error) {
    console.error("단어 리스트를 불러오는 중 오류 발생:", error);
  }
}

function pickRandomAnswer() {
  const index = Math.floor(Math.random() * wordsList.length);
  ANSWER = wordsList[index];
  console.log("정답:", ANSWER);
}

// 가상 키보드 입력
keys.forEach(key => {
  key.addEventListener("click", () => {
    key.blur();
    if (key.disabled || inputLocked) return;

    const letter = key.dataset.key;
    if (letter === "ENTER") handleEnter();
    else if (letter === "BACKSPACE") deleteLetter();
    else addLetter(letter);
  });
});

// 실제 키보드 입력
document.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (inputLocked) return;

  const key = e.key.toUpperCase();

  if (/^[A-Z]$/.test(key)) {
    highlightKey(key);
    addLetter(key);
  } else if (e.key === "Backspace") {
    highlightKey("BACKSPACE");
    deleteLetter();
  } else if (e.key === "Enter") {
    highlightKey("ENTER");
    handleEnter();
  }
});

document.addEventListener("keyup", (e) => {
  const key = e.key.toUpperCase();
  if (/^[A-Z]$/.test(key)) removeKeyHighlight(key);
  else if (e.key === "Backspace") removeKeyHighlight("BACKSPACE");
  else if (e.key === "Enter") removeKeyHighlight("ENTER");
});

// 키보드 시각 효과
function highlightKey(letter) {
  const key = document.querySelector(`.key[data-key="${letter}"]`);
  if (key && !key.disabled) key.classList.add("pressed");
}

function removeKeyHighlight(letter) {
  const key = document.querySelector(`.key[data-key="${letter}"]`);
  if (key) key.classList.remove("pressed");
}

// 글자 입력/삭제
function addLetter(letter) {
  if (inputLocked || currentCol >= 5 || currentRow >= 6) return;
  const tile = rows[currentRow].children[currentCol];
  tile.textContent = letter;
  tile.dataset.letter = letter;
  currentCol++;
}

function deleteLetter() {
  if (inputLocked || currentCol === 0 || currentRow >= 6) return;
  currentCol--;
  const tile = rows[currentRow].children[currentCol];
  tile.textContent = "";
  tile.dataset.letter = "";
}

// 엔터 입력 처리
function handleEnter() {
  if (inputLocked || currentCol !== 5) return;

  const guess = Array.from(rows[currentRow].children)
    .map(tile => tile.dataset.letter)
    .join("");

  if (!validWords.has(guess)) {
    shakeRow(currentRow);
    return;
  }

  inputLocked = true;
  colorTilesWithAnimation(guess);

  if (guess === ANSWER) {
    setTimeout(() => {
      if (!resetInProgress) showEndingModal();
    }, 1800); // 5칸 × 300ms + 여유
    return;
  }

  currentRow++;
  currentCol = 0;

  if (currentRow === 6) {
    setTimeout(() => {
      if (!resetInProgress) showFailModal();
    }, 1800);
  } else {
    setTimeout(() => {
      if (!resetInProgress) inputLocked = false;
    }, 1800);
  }
}

// 줄 흔들기 (오답 애니메이션)
function shakeRow(rowIndex) {
  const tiles = rows[rowIndex].children;
  for (let tile of tiles) {
    tile.classList.add("shake");
    setTimeout(() => tile.classList.remove("shake"), 500);
  }
}

// 정답/위치 판단 및 타일 색 적용
function colorTilesWithAnimation(guess) {
  const tiles = rows[currentRow].children;
  const answerArr = ANSWER.split("");
  const guessArr = guess.split("");

  const result = Array(5).fill("absent");
  const remaining = {};

  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === answerArr[i]) {
      result[i] = "correct";
      answerArr[i] = null;
    } else {
      remaining[answerArr[i]] = (remaining[answerArr[i]] || 0) + 1;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (result[i] === "correct") continue;
    const letter = guessArr[i];
    if (remaining[letter] > 0) {
      result[i] = "present";
      remaining[letter]--;
    }
  }

  for (let i = 0; i < 5; i++) {
    const tile = tiles[i];
    const letter = guessArr[i];
    const status = result[i];

    setTimeout(() => {
      if (resetInProgress) return;
      tile.classList.add("flip");

      setTimeout(() => {
        if (resetInProgress) return;
        tile.classList.add(status);
        tile.classList.remove("flip");
      }, 300);

      const key = document.querySelector(`.key[data-key="${letter}"]`);
      if (key) updateKeyboardKeyColor(key, status);
    }, i * 300);
  }
}

// 키보드 색상 업데이트
function updateKeyboardKeyColor(key, status) {
  if (key.classList.contains("correct")) return;

  if (status === "correct") {
    key.classList.remove("present", "absent");
    key.classList.add("correct");
  } else if (status === "present") {
    if (!key.classList.contains("correct")) {
      key.classList.remove("absent");
      key.classList.add("present");
    }
  } else if (status === "absent") {
    if (!key.classList.contains("correct") && !key.classList.contains("present")) {
      key.classList.add("absent");
      key.disabled = true;
    }
  }
}

// 모달 제어
function showEndingModal() {
  modal.style.display = "flex";
}

function showFailModal() {
  correctWordDisplay.textContent = ANSWER;
  failModal.style.display = "flex";
}

// 게임 리셋
function resetGame() {
  resetInProgress = true;
  inputLocked = false;

  currentRow = 0;
  currentCol = 0;
  pickRandomAnswer();

  modal.style.display = "none";
  failModal.style.display = "none";

  rows.forEach(row => {
    Array.from(row.children).forEach(tile => {
      tile.textContent = "";
      tile.dataset.letter = "";
      tile.classList.remove("correct", "present", "absent", "flip", "shake");
      tile.className = "tile";
    });
  });

  keys.forEach(key => {
    key.className = "key";
    key.disabled = false;
  });

  setTimeout(() => {
    resetInProgress = false;
  }, 100);
}

// 이벤트 바인딩
retryBtn.addEventListener("click", resetGame);
failRetryBtn.addEventListener("click", resetGame);

// 초기화
loadWordList();