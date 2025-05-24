import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
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

// Logging level clicks and updating energy
function logLevelClick(levelName, levelNumber, redirectTo, currentEnergy) {
  const user = auth.currentUser;
  if (!user) return;

  const levelKey = levelName.replace(" ", "_");
  const levelDocRef = doc(db, `users/${user.uid}/level_logs/${levelKey}`);
  const newEnergy = Math.max(currentEnergy - 3, 0);

  getDoc(levelDocRef)
    .then((docSnap) => {
      const existingData = docSnap.exists() ? docSnap.data() : {};
      const existingLevelNumber = existingData.levelNumber || 0;

      if (levelNumber > existingLevelNumber) {
        return setDoc(
          levelDocRef,
          {
            level: levelName,
            levelNumber: levelNumber,
            timestamp: new Date().toISOString(),
            energy: newEnergy,
          },
          { merge: true }
        );
      } else {
        return updateDoc(levelDocRef, { energy: newEnergy });
      }
    })
    .then(() => {
      console.log("Level and energy updated");
      window.location.href = redirectTo;
    })
    .catch((error) => {
      console.error("Error updating Firestore:", error);
      alert("Error: " + error.message);
    });
}

// On DOM load
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".level, .test").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const user = auth.currentUser;

      if (!user) {
        alert("Please log in first to access levels.");
        return;
      }

      const levelName = btn.textContent.trim();
      const levelKey = levelName.replace(" ", "_");
      const levelDocRef = doc(db, `users/${user.uid}/level_logs/${levelKey}`);

      try {
        const docSnap = await getDoc(levelDocRef);
        const existingData = docSnap.exists() ? docSnap.data() : {};
        const currentEnergy = existingData.energy ?? 0;

        // If energy is less than 3, redirect to shop and stop
        if (currentEnergy < 3) {
          window.location.href = "shop.html";
          return;
        }

        // Show animation
        showEnergySubtractionAnimation(btn);

        // Get level number from button text or class
        const levelNumberMatch = levelName.match(/\d+/);
        const levelNumber = levelNumberMatch
          ? parseInt(levelNumberMatch[0])
          : 0;
        const redirectTo = btn.getAttribute("href") || "#";

        // Log level
        logLevelClick(levelName, levelNumber, redirectTo, currentEnergy);
      } catch (err) {
        console.error("Error checking energy:", err);
        alert("Error: " + err.message);
      }
    });
  });
});
