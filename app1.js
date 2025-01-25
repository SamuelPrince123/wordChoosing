// Import Firebase modules (from CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// Firebase configuration
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

// Check if the user is logged in when the page loads
onAuthStateChanged(auth, (user) => {
  if (user) {
    // If the user is logged in, redirect to index.html
    window.location.href = "grade1.html";
  }
});

// Google Login Function
const googleLoginButton = document.getElementById("google-login");
googleLoginButton.addEventListener("click", async () => {
  const googleProvider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Save user info to Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      provider: "Google",
      lastLogin: new Date().toISOString(),
    });

    alert(`Welcome, ${user.displayName}!`);
    window.location.href = "grade1.html"; // Redirect to index.html after login
  } catch (error) {
    console.error("Google login failed:", error);
    alert("Google login failed. Check console for details.");
  }
});
