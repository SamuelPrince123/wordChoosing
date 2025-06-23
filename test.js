const API_URL = "https://api.languagetool.org/v2/check";

const wordPrompt = document.getElementById("word-prompt");
const sentenceInputs = [
  document.getElementById("sentence1"),
  document.getElementById("sentence2"),
];
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const submitBtn = document.getElementById("submit-btn");
const feedback = document.getElementById("feedback");
const scoreboard = document.getElementById("scoreboard");
const loader = document.getElementById("loader-overlay");

const words = [
  "Basket",
  "Cheese",
  "Lamp",
  "Nut",
  "Slide",
  "Vest",
  "Yawn",
  "Ride",
  "Huge",
  "Messy",
]; // Your word list here
let currentWordIndex = 0;
let inputData = words.map((word) => ({ word, text: ["", ""] }));

let verbs = []; // Will be loaded from verbs.json
let adjectives = []; // Will be loaded from adjective.json

// Helper to load JSON file and return a promise
function loadJsonFile(url) {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    return res.json();
  });
}

// Load verbs and adjectives in parallel before starting the app
Promise.all([
  loadJsonFile("/verbs.json")
    .then((data) => {
      verbs = data;
      console.log(`✅ Loaded ${verbs.length} verbs`);
    })
    .catch((e) => {
      console.error("Error loading verbs:", e);
      verbs = [];
    }),

  loadJsonFile("/adjective.json")
    .then((data) => {
      adjectives = data;
      console.log(`✅ Loaded ${adjectives.length} adjectives`);
    })
    .catch((e) => {
      console.error("Error loading adjectives:", e);
      adjectives = [];
    }),
]).then(() => {
  // Both verbs and adjectives loaded (or failed), initialize app
  initApp();
});

function initApp() {
  sentenceInputs.forEach((input) => {
    input.addEventListener("input", () => {
      const currentSentences = getCurrentSentences();
      const word =
        inputData[Math.min(currentWordIndex, inputData.length - 1)].word;
      nextBtn.disabled = !validateSentences(currentSentences, word);
      feedback.textContent = "";
    });
  });

  prevBtn.addEventListener("click", () => {
    if (currentWordIndex > 0) {
      if (currentWordIndex < inputData.length) {
        inputData[currentWordIndex].text = getCurrentSentences();
      }
      currentWordIndex--;
      showWord(currentWordIndex);
      feedback.textContent = "";
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentWordIndex >= inputData.length) {
      feedback.textContent = "⚠️ Click Submit to finish.";
      return;
    }

    const currentWord = inputData[currentWordIndex].word;
    const sentences = getCurrentSentences();

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      if (sentence === "") {
        feedback.textContent = `⚠️ Please fill sentence ${i + 1}.`;
        sentenceInputs[i].focus();
        sentenceInputs[i].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        return;
      }
      if (!sentence.toLowerCase().includes(currentWord.toLowerCase())) {
        feedback.textContent = `⚠️ Sentence ${
          i + 1
        } must include the word: "${currentWord}".`;
        sentenceInputs[i].focus();
        sentenceInputs[i].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        return;
      }
    }

    inputData[currentWordIndex].text = sentences;

    if (currentWordIndex < inputData.length - 1) {
      currentWordIndex++;
      feedback.textContent = "";
      showWord(currentWordIndex);
    } else {
      feedback.textContent = "⚠️ Click Submit to finish.";
      showWord(currentWordIndex);
    }
  });

  submitBtn.addEventListener("click", () => {
    if (currentWordIndex < inputData.length) {
      inputData[currentWordIndex].text = getCurrentSentences();
    }

    const incomplete = inputData.some((item) => {
      if (!item.text || item.text.length !== 2) return true;
      return item.text.some((s) => s.trim() === "");
    });

    if (incomplete) {
      feedback.textContent =
        "⚠️ Please complete all sentences for all words before submitting.";
      return;
    }

    document.getElementById("sentence-input-container").style.display = "none";
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";
    submitBtn.style.display = "none";
    feedback.textContent = "Checking all your sentences...";
    loader.style.display = "flex";

    checkAllSentences();
  });

  // Show the first word once everything is ready
  showWord(currentWordIndex);
}

function getCurrentSentences() {
  return sentenceInputs.map((input) => input.value.trim());
}

function setCurrentSentences(sentences) {
  sentences.forEach((text, i) => {
    sentenceInputs[i].value = text || "";
  });
}

function validateSentences(sentences, word) {
  if (sentences.some((s) => s === "")) return false;
  if (sentences.some((s) => !s.toLowerCase().includes(word.toLowerCase())))
    return false;
  return true;
}

function showWord(index) {
  if (index >= inputData.length) {
    wordPrompt.textContent = "✅ All words completed!";
    setCurrentSentences(inputData[inputData.length - 1].text);
    prevBtn.disabled = false;
    nextBtn.disabled = true;
    return;
  }
  const word = inputData[index].word;
  wordPrompt.textContent = `Word ${index + 1} of ${words.length}: "${word}"`;
  const savedText = inputData[index].text || ["", ""];

  setCurrentSentences(savedText);

  prevBtn.disabled = index === 0;
  nextBtn.disabled = !validateSentences(savedText, word);
}

function isTrivialSentence(sentence, word) {
  const lowered = sentence.toLowerCase().replace(/[.,!?]/g, "");
  const tokens = lowered.split(/\s+/);
  if (tokens.length < 3) return true;
  if (tokens.every((t) => t === tokens[0])) return true;
  if (lowered === `${word.toLowerCase()} is ${word.toLowerCase()}`) return true;
  if (
    tokens.length === 3 &&
    tokens[0] === word.toLowerCase() &&
    tokens[1] === tokens[2]
  )
    return true;
  return false;
}

// Use the dynamically loaded verbs and adjectives arrays
function hasVerbOrAdjective(sentence) {
  const tokens = sentence.toLowerCase().split(/\s+/);
  return tokens.some((t) => verbs.includes(t) || adjectives.includes(t));
}

async function checkAllSentences() {
  let totalScore = 0;
  let results = {};

  for (let entry of inputData) {
    let wordTotalScore = 0;
    let allErrors = [];

    for (let sentence of entry.text) {
      if (isTrivialSentence(sentence, entry.word)) {
        allErrors.push({
          sentence,
          errors: [],
          trivialMessage:
            "⚠️ Sentence is too trivial or repetitive and gets 0 points.",
        });
        continue;
      }

      if (!hasVerbOrAdjective(sentence)) {
        allErrors.push({
          sentence,
          errors: [],
          trivialMessage:
            "⚠️ Sentence lacks verbs or adjectives, indicating low complexity, gets 0 points.",
        });
        continue;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          text: sentence,
          language: "en-US",
        }),
      });

      const result = await response.json();
      const errors = result.matches;
      const score = Math.max(0, 10 - errors.length * 2);

      wordTotalScore += score;
      allErrors.push({ sentence, errors, trivialMessage: null });
    }

    entry.score = wordTotalScore;
    totalScore += wordTotalScore;

    results[entry.word] = {
      sentences: allErrors,
      score: wordTotalScore,
    };
  }

  showFinalResults(results, totalScore);
}

async function showFinalResults(results, totalScore) {
  loader.style.display = "none";
  feedback.innerHTML = "";
  scoreboard.innerHTML = `<h2>🏁 Game Completed</h2><p><strong>Total Score: ${totalScore}/${
    words.length * 20
  }</strong></p>`;

  for (const [word, data] of Object.entries(results)) {
    const section = document.createElement("div");
    section.innerHTML = `<h3>📝 Word: ${word}</h3><p>Score: ${data.score}/20</p><ul></ul>`;
    const list = section.querySelector("ul");

    data.sentences.forEach((item, i) => {
      let errorText = "";

      if (item.trivialMessage) {
        errorText = item.trivialMessage;
      } else if (item.errors.length) {
        errorText = item.errors
          .map((e) => `❌ ${e.message} — <i>${e.context.text}</i>`)
          .join("<br>");
      } else {
        errorText = "✅ No mistakes!";
      }

      const li = document.createElement("li");
      li.innerHTML = `<strong>Sentence ${i + 1}:</strong> ${
        item.sentence
      }<br>${errorText}`;
      list.appendChild(li);
    });

    scoreboard.appendChild(section);
  }

  // ✅ Wait for login to be confirmed
  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      console.error("User not logged in, cannot save score");
      return;
    }

    try {
      const maxScore = words.length * 20;
      const score100Percent = (totalScore / maxScore) * 100;

      const docRef = firebase
        .firestore()
        .doc(`/users/${user.uid}/level_logs/Level_4`);

      await docRef.set(
        {
          finalScore: score100Percent,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      console.log(`Score saved to Firebase: ${score100Percent}`);
    } catch (error) {
      console.error("Error saving score to Firebase:", error);
    }
  });
}
