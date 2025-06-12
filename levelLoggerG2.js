import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCxyhobAIxWsTPRGjAiTpYywsWBA4MkAj8",
  authDomain: "wordchoosing.firebaseapp.com",
  projectId: "wordchoosing",
  storageBucket: "wordchoosing.appspot.com",
  messagingSenderId: "11998731462",
  appId: "1:11998731462:web:fa6494cfc027896b6d8bc7",
  measurementId: "G-0JMJRW97WE",
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Animation function
function showEnergySubtractionAnimation(targetElement) {
  const anim = document.createElement("span");
  anim.textContent = "-3 Coins";
  anim.className = "energy-feedback";

  const rect = targetElement.getBoundingClientRect();
  anim.style.left = `${rect.left + rect.width / 2}px`;
  anim.style.top = `${rect.top - 10}px`;

  document.body.appendChild(anim);
  requestAnimationFrame(() => anim.classList.add("visible"));

  setTimeout(() => {
    anim.classList.remove("visible");
    anim.classList.add("hidden");
    setTimeout(() => anim.remove(), 500);
  }, 1500);
}

// Logging and updating level in Level_1, but energy is stored in root user doc
function logLevelClick(levelName, levelNumber, redirectTo, currentEnergy) {
  const user = auth.currentUser;
  if (!user) return;

  const levelRef = doc(db, `users/${user.uid}/level_logs/Level_5`);
  const userRef = doc(db, `users/${user.uid}`);
  const newEnergy = Math.max(currentEnergy - 3, 0);

  // Always update level and levelNumber regardless of previous value
  const updatedLevelData = {
    level: levelName,
    levelNumber: levelNumber,
    timestamp: new Date().toISOString(),
  };

  Promise.all([
    setDoc(levelRef, updatedLevelData, { merge: true }),
    setDoc(userRef, { energy: newEnergy }, { merge: true }),
  ])
    .then(() => {
      console.log("Level and energy updated");
      console.log("Redirecting to:", redirectTo); // <-- Added this line to debug
      window.location.href = redirectTo;
    })
    .catch((error) => {
      console.error("Error updating Firestore:", error);
      alert("Error: " + error.message);
    });
}

// On DOM load
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("a.level").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const user = auth.currentUser;

      if (!user) {
        alert("Please log in first to access levels.");
        return;
      }

      const userRef = doc(db, `users/${user.uid}`);
      const levelName = btn.textContent.trim();

      try {
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};
        const currentEnergy = userData.energy ?? 0;

        if (currentEnergy < 3) {
          window.location.href = "shop.html";
          return;
        }

        showEnergySubtractionAnimation(btn);

        const levelNumberMatch = levelName.match(/\d+/);
        const levelNumber = levelNumberMatch
          ? parseInt(levelNumberMatch[0])
          : 0;
        const redirectTo = btn.getAttribute("href") || "#";

        logLevelClick(levelName, levelNumber, redirectTo, currentEnergy);
      } catch (err) {
        console.error("Error checking energy:", err);
        alert("Error: " + err.message);
      }
    });
  });
});
