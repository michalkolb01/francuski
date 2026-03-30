const vocabulary = [
  {
    french: "les pommes",
    polish: ["jablka", "jabłka"],
    displayAnswer: "jabłka",
    image: "./assets/apples.svg",
  },
  {
    french: "les fraises",
    polish: ["truskawki"],
    displayAnswer: "truskawki",
    image: "./assets/strawberries.svg",
  },
  {
    french: "les cerises",
    polish: ["czeresnie", "czereśnie", "wisnie", "wiśnie"],
    displayAnswer: "czereśnie / wiśnie",
    image: "./assets/cherries.svg",
  },
  {
    french: "les pommes de terre",
    polish: ["ziemniaki"],
    displayAnswer: "ziemniaki",
    image: "./assets/potatoes.svg",
  },
  {
    french: "le jambon",
    polish: ["szynka"],
    displayAnswer: "szynka",
    image: "./assets/ham.svg",
  },
  {
    french: "le pâté",
    polish: ["pasztet"],
    displayAnswer: "pasztet",
    image: "./assets/pate.svg",
  },
];

const progressEntries = [];

const exerciseList = document.querySelector("#exercise-list");
const audioExerciseList = document.querySelector("#audio-exercise-list");
const imageExerciseList = document.querySelector("#image-exercise-list");
const exerciseTemplate = document.querySelector("#exercise-template");
const audioExerciseTemplate = document.querySelector("#audio-exercise-template");
const imageExerciseTemplate = document.querySelector("#image-exercise-template");
const correctCount = document.querySelector("#correct-count");
const totalCount = document.querySelector("#total-count");
const scoreRate = document.querySelector("#score-rate");
const resetButton = document.querySelector("#reset-progress");

function normalizeAnswer(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function updateStats() {
  const solvedCorrectly = progressEntries.filter((entry) => entry.correct).length;
  correctCount.textContent = String(solvedCorrectly);
  totalCount.textContent = String(progressEntries.length);
  scoreRate.textContent = `${Math.round((solvedCorrectly / progressEntries.length) * 100)}%`;
}

function setFeedback(feedbackNode, message, type) {
  feedbackNode.textContent = message;
  feedbackNode.classList.remove("success", "error");
  if (type) {
    feedbackNode.classList.add(type);
  }
}

function markProgress(progressEntry, isCorrect) {
  progressEntry.solved = true;
  progressEntry.correct = isCorrect;
  updateStats();
}

function checkAnswer(index, inputNode, feedbackNode, progressEntry) {
  const userAnswer = normalizeAnswer(inputNode.value);
  const acceptedAnswers = vocabulary[index].polish.map(normalizeAnswer);

  if (!userAnswer) {
    setFeedback(feedbackNode, "Ecris une reponse d'abord.", "error");
    return;
  }

  const isCorrect = acceptedAnswers.includes(userAnswer);
  markProgress(progressEntry, isCorrect);

  if (isCorrect) {
    setFeedback(feedbackNode, "Correct.", "success");
  } else {
    setFeedback(
      feedbackNode,
      `Ce n'est pas correct. Bonne reponse : ${vocabulary[index].displayAnswer}`,
      "error"
    );
  }
}

function showAnswer(index, inputNode, feedbackNode, progressEntry) {
  inputNode.value = vocabulary[index].displayAnswer;
  markProgress(progressEntry, false);
  setFeedback(feedbackNode, `Reponse : ${vocabulary[index].displayAnswer}`, "error");
}

function buildExerciseCard(exercise, index) {
  const progressEntry = { solved: false, correct: false };
  const fragment = exerciseTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".exercise-card");
  const numberNode = fragment.querySelector(".exercise-number");
  const wordNode = fragment.querySelector(".exercise-word");
  const inputNode = fragment.querySelector(".answer-input");
  const checkButton = fragment.querySelector(".check-button");
  const showButton = fragment.querySelector(".show-button");
  const feedbackNode = fragment.querySelector(".feedback");

  numberNode.textContent = `#${index + 1}`;
  wordNode.textContent = exercise.french;
  inputNode.setAttribute("aria-label", `Traduction polonaise pour ${exercise.french}`);

  checkButton.addEventListener("click", () => checkAnswer(index, inputNode, feedbackNode, progressEntry));
  showButton.addEventListener("click", () => showAnswer(index, inputNode, feedbackNode, progressEntry));
  inputNode.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      checkAnswer(index, inputNode, feedbackNode, progressEntry);
    }
  });

  progressEntries.push(progressEntry);
  exerciseList.appendChild(card);
}

function speakFrench(text, feedbackNode) {
  if (!("speechSynthesis" in window)) {
    setFeedback(feedbackNode, "La lecture audio n'est pas disponible sur cet appareil.", "error");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  setFeedback(feedbackNode, `Lecture : ${text}`, "success");
}

function buildAudioExerciseCard(exercise, index) {
  const progressEntry = { solved: false, correct: false };
  const fragment = audioExerciseTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".exercise-card");
  const numberNode = fragment.querySelector(".exercise-number");
  const listenButton = fragment.querySelector(".listen-button");
  const inputNode = fragment.querySelector(".answer-input");
  const checkButton = fragment.querySelector(".check-button");
  const showButton = fragment.querySelector(".show-button");
  const feedbackNode = fragment.querySelector(".feedback");

  numberNode.textContent = `#${index + 1}`;
  inputNode.setAttribute("aria-label", `Reponse polonaise apres ecoute de ${exercise.french}`);

  listenButton.addEventListener("click", () => speakFrench(exercise.french, feedbackNode));
  checkButton.addEventListener("click", () => checkAnswer(index, inputNode, feedbackNode, progressEntry));
  showButton.addEventListener("click", () => showAnswer(index, inputNode, feedbackNode, progressEntry));
  inputNode.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      checkAnswer(index, inputNode, feedbackNode, progressEntry);
    }
  });

  progressEntries.push(progressEntry);
  audioExerciseList.appendChild(card);
}

function checkFrenchMatch(exercise, selectNode, feedbackNode, progressEntry) {
  const answer = selectNode.value;

  if (!answer) {
    setFeedback(feedbackNode, "Choisis une reponse d'abord.", "error");
    return;
  }

  if (answer === exercise.french) {
    markProgress(progressEntry, true);
    setFeedback(feedbackNode, "Correct.", "success");
  } else {
    markProgress(progressEntry, false);
    setFeedback(feedbackNode, `Ce n'est pas correct. Bonne reponse : ${exercise.french}`, "error");
  }
}

function buildImageExerciseCard(exercise, index) {
  const progressEntry = { solved: false, correct: false };
  const fragment = imageExerciseTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".exercise-card");
  const numberNode = fragment.querySelector(".exercise-number");
  const visualNode = fragment.querySelector(".image-visual");
  const imageNode = fragment.querySelector(".image-photo");
  const selectNode = fragment.querySelector(".match-select");
  const checkButton = fragment.querySelector(".check-button");
  const feedbackNode = fragment.querySelector(".feedback");

  numberNode.textContent = `#${index + 1}`;
  visualNode.setAttribute("aria-label", `Image pour ${exercise.french}`);
  imageNode.src = exercise.image;
  imageNode.alt = `Illustration de ${exercise.french}`;

  vocabulary.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.french;
    option.textContent = item.french;
    selectNode.appendChild(option);
  });

  checkButton.addEventListener("click", () =>
    checkFrenchMatch(exercise, selectNode, feedbackNode, progressEntry)
  );
  progressEntries.push(progressEntry);
  imageExerciseList.appendChild(card);
}

function resetProgress() {
  progressEntries.forEach((entry) => {
    entry.solved = false;
    entry.correct = false;
  });

  document.querySelectorAll(".answer-input").forEach((input) => {
    input.value = "";
  });

  document.querySelectorAll(".feedback").forEach((feedbackNode) => {
    setFeedback(feedbackNode, "", "");
  });

  document.querySelectorAll(".match-select").forEach((selectNode) => {
    selectNode.value = "";
  });

  updateStats();
}

vocabulary.forEach(buildExerciseCard);
vocabulary.forEach(buildAudioExerciseCard);
vocabulary.forEach(buildImageExerciseCard);
updateStats();
resetButton.addEventListener("click", resetProgress);
