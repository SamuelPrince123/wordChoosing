// Initialize coins and max coins
let currentCoins = 50;
const maxCoins = 100;

// Function to update the coins progress bar
function updateCoins(amount) {
  const progressBar = document.getElementById("progress-bar");
  currentCoins = Math.max(0, Math.min(maxCoins, currentCoins + amount)); // Ensure within range
  const progressPercentage = (currentCoins / maxCoins) * 100; // Calculate width in %
  progressBar.style.width = progressPercentage + "%";
  progressBar.textContent = `${currentCoins}/${maxCoins} Coins`;
}

// // Example: Add 10 coins every 3 seconds
setInterval(() => updateCoins(10), 3000);

//for the profiles

let currentLevel = 1;
let progress = 0;

function increaseProgress(amount) {
  const progressFill = document.getElementById("progressFill1");
  progress += amount;
  if (progress >= 100) {
    progress = 0;
    currentLevel++;
    document.querySelector(
      ".progress-label1"
    ).textContent = `Lv. ${currentLevel}`;
  }
  progressFill.style.width = `${progress}%`;
}

// Simulate the progress increment for demonstration
setInterval(() => {
  increaseProgress(10);
}, 1000);

// Set a default time (in seconds)
let timeLeft = 30; // Set your time here (e.g., 60 seconds)

// Function to start the countdown
function startTimer() {
  const timerElement = document.getElementById("timer");

  // Update the timer every second
  const timerInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timerInterval);

      // Trigger the final score modal instead of an alert
      showFinalScore();
    } else {
      let minutes = Math.floor(timeLeft / 60); // Get minutes
      let seconds = timeLeft % 60; // Get seconds

      // Format the minutes and seconds to always have two digits
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      timerElement.textContent = minutes + ":" + seconds; // Update the timer display
      timeLeft--; // Decrease time by 1 second
    }
  }, 1000);
}

document.addEventListener("DOMContentLoaded", function () {
  // Trigger the timer when the game starts (e.g., after clicking a "Start" button)
  document
    .getElementById("start-button")
    .addEventListener("click", function () {
      startTimer(); // Start the countdown
      document.getElementById("start-screen").style.display = "none"; // Hide the start screen
      document.getElementById("game-container").style.display = "block"; // Show the game content
    });
});

//for username to use in the profile
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
  storageBucket: "wordchoosing.firebasestorage.app",
  messagingSenderId: "11998731462",
  appId: "1:11998731462:web:fa6494cfc027896b6d8bc7",
  measurementId: "G-0JMJRW97WE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Listen for authentication state changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Fetch username from Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const username = userDoc.data().name; // Retrieve username from Firestore
      // Update the username in the HTML
      document.querySelector(".username").textContent = username;
    } else {
      console.log("User data not found in Firestore.");
    }
  } else {
    console.log("No user is signed in.");
  }
});
