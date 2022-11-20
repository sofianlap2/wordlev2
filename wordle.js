window.onload = function () {
  startGame();
};

const width = 5;
const height = 6;
let row = 0;
let col = 0;
let word = "hello";
let gameOver = false;

async function check_if_word_exists(word) {
  const url =
    "https://api.wordnik.com/v4/word.json/" +
    word +
    "/definitions?limit=200&includeRelated=false&useCanonical=false&includeTags=false&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5";
  const fetchUrl = await fetch(url);
  const data = await fetchUrl.json();

  if (data.length > 0) {
    return true;
  } else {
    return false;
  }
}

function startGame() {
  const board = document.querySelector("#board");

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const tile = document.createElement("span");
      tile.id = r.toString() + "-" + c.toString();
      tile.classList.add("tile");
      tile.innerText = "";
      board.append(tile);
    }
  }

  // Listen for key press
  document.addEventListener("keyup", (e) => {
    processInput(e);
  });
}

function processInput(e) {
  if (gameOver) return;

  if (e.code >= "KeyA" && e.code <= "KeyZ") {
    if (col < width && row < height) {
      const currentTile = document.getElementById(
        row.toString() + "-" + col.toString()
      );
      if (currentTile.innerText === "") {
        currentTile.innerText = e.code[3];
        col++;
      }
    }
  } else if (e.code == "Backspace") {
    if (col > 0 && col <= width) {
      col--;
    }
    let currentTile = document.getElementById(
      row.toString() + "-" + col.toString()
    );
    currentTile.innerText = "";
  } else if (e.code == "Enter") {
    update();
  }

  if (!gameOver && row == height) {
    gameOver = true;
    document.getElementById("answer").innerText = word;
  }
}

async function update() {
  let guess = "";

  for (let i = 0; i < width; i++) {
    let currentTile = document.getElementById(
      row.toString() + "-" + i.toString()
    );
    let letter = currentTile.innerText;
    guess += letter;
  }

  guess = guess.toLowerCase();

  const wordExists = await check_if_word_exists(guess);

  if (!wordExists) {
    document.getElementById("answer").innerText = "Not in word list";
    return;
  }

  let correct = 0;
  let letterCount = {};

  for (let i = 0; i < word.length; i++) {
    let letter = word[i];

    if (letterCount[letter]) {
      letterCount[letter] += 1;
    } else {
      letterCount[letter] = 1;
    }
  }

  for (let c = 0; c < width; c++) {
    let currentTile = document.getElementById(
      row.toString() + "-" + c.toString()
    );
    let currentLetter = currentTile.innerText.toLowerCase();

    if (currentLetter === word[c]) {
      currentTile.classList.add("correct");
      correct++;
      letterCount[currentLetter] -= 1;
    }

    if (correct === width) {
      gameOver = true;
    }
  }

  for (let c = 0; c < width; c++) {
    let currentTile = document.getElementById(
      row.toString() + "-" + c.toString()
    );
    let currentLetter = currentTile.innerText.toLowerCase();

    if (!currentTile.classList.contains("correct")) {
      if (word.includes(currentLetter) && letterCount[currentLetter] > 0) {
        currentTile.classList.add("present");
        letterCount[currentLetter] -= 1;
      } else {
        currentTile.classList.add("absent");
      }
    }
  }

  col = 0;
  row++;
}
