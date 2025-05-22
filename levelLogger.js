import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCxyhobAIxWsTPRGjAiTpYywsWBA4MkAj8",
  authDomain: "wordchoosing.firebaseapp.com",
  projectId: "wordchoosing",
  storageBucket: "wordchoosing.appspot.com",
  messagingSenderId: "11998731462",
  appId: "1:11998731462:web:fa6494cfc027896b6d8bc7",
  measurementId: "G-0JMJRW97WE",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function logLevelClick(levelName, levelNumber, energy, redirectTo) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const levelDocRef = doc(
          db,
          `users/${user.uid}/level_logs/${levelName.replace(" ", "_")}`
        );
        await setDoc(levelDocRef, {
          level: levelName,
          levelNumber: levelNumber, // ✅ new numeric value
          energy: energy,
          timestamp: new Date().toISOString(),
        });
        window.location.href = redirectTo;
      } catch (err) {
        console.error("Error logging level:", err);
        alert("Error logging level: " + err.message);
      }
    } else {
      alert("Please log in first to access levels.");
    }
  });
}

// Attach listener for Level 1
document.addEventListener("DOMContentLoaded", () => {
  const level1 = document.querySelector(".level1");
  if (level1) {
    level1.addEventListener("click", (e) => {
      e.preventDefault();
      logLevelClick("Level 1", 1, 25, "level1.html"); // ✅ pass level name and number
    });
  }
});
