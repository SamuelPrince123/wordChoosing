import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCxyhobAIxWsTPRGjAiTpYywsWBA4MkAj8",
  authDomain: "wordchoosing.firebaseapp.com",
  projectId: "wordchoosing",
  storageBucket: "wordchoosing.appspot.com",
  messagingSenderId: "11998731462",
  appId: "1:11998731462:web:fa6494cfc027896b6d8bc7",
  measurementId: "G-0JMJRW97WE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Coins progress bar setup
const maxCoins = 200;

function showCoinsFromFirebase(energyValue) {
  const progressBar = document.getElementById("progress-bar");

  if (!progressBar) {
    console.error("❌ Element with ID 'progress-bar' not found.");
    return;
  }

  const coins = energyValue || 0;
  const percent = Math.min(100, (coins / maxCoins) * 100);

  console.log("✅ Updating progress bar: ", coins, "/", maxCoins);

  progressBar.style.width = percent + "%";
  progressBar.textContent = `${coins}/${maxCoins} Coins`;
}

// Timer logic
let timeLeft = 60;

function startTimer() {
  const timerElement = document.getElementById("timer");

  const timerInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showFinalScore();
    } else {
      let minutes = Math.floor(timeLeft / 60);
      let seconds = timeLeft % 60;
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      timerElement.textContent = minutes + ":" + seconds;
      timeLeft--;
    }
  }, 1000);
}

// Start the game on button click
document.addEventListener("DOMContentLoaded", function () {
  const startButton = document.getElementById("start-button");
  if (startButton) {
    startButton.addEventListener("click", function () {
      startTimer();
      document.getElementById("start-screen").style.display = "none";
      document.getElementById("game-container").style.display = "block";
    });
  }
});

// Load user info from Firestore
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("✅ User is signed in:", user.uid);
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const username = userData.name || "User";

      const usernameElement = document.querySelector(".username");
      if (usernameElement) {
        usernameElement.textContent = username;
      } else {
        console.warn("⚠️ No element with class 'username' found.");
      }

      // ✅ Energy is now fetched from root user document
      let energy = 0;
      if (userData.energy !== undefined) {
        energy = userData.energy;
      } else {
        console.warn("⚠️ Energy not found in root user document.");
      }

      // ✅ Level progress still fetched from Level_1 doc
      const levelDocRef = doc(db, "users", user.uid, "level_logs", "Level_3");
      const levelDoc = await getDoc(levelDocRef);

      if (levelDoc.exists()) {
        const levelData = levelDoc.data();

        // Update level label (e.g., "Lv. 2") from `level` field
        if (levelData.level) {
          const match = levelData.level.match(/Level\s*(\d+)/i);
          if (match) {
            const levelNum = match[1];
            const label = document.querySelector(".progress-label1");
            if (label) label.textContent = `Lv.${levelNum}`;
          }
        }

        // Update progress bar fill from `levelNumber` field
        if (typeof levelData.levelNumber === "number") {
          const levelNumber = levelData.levelNumber;
          const progressPercent = Math.min(100, levelNumber * 10);

          const progressFill = document.getElementById("progressFill1");
          if (progressFill) {
            progressFill.style.width = `${progressPercent}%`;
          }

          console.log(
            `📊 Level progress set to ${progressPercent}% for levelNumber = ${levelNumber}`
          );
        } else {
          console.warn("⚠️ levelNumber is missing or invalid.");
        }
      } else {
        console.warn("⚠️ No Level_1 document found in level_logs.");
      }

      showCoinsFromFirebase(energy);
    } else {
      console.warn("⚠️ User document not found in Firestore.");
    }
  } else {
    console.log("❌ No user is signed in.");
  }
});
