import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

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
const provider = new GoogleAuthProvider();

// Step 1: Ask for the username and store it before sign-in
document.getElementById("google-login").addEventListener("click", async () => {
  const username = prompt("Enter your username:");

  if (!username || username.trim() === "") {
    alert("Username is required!");
    return;
  }

  // Store username temporarily in session storage
  sessionStorage.setItem("username", username);

  // Step 2: Use Google sign-in with redirect (to avoid popup issues)
  signInWithRedirect(auth, provider);
});

// Step 3: Handle Redirect Login ONLY if there is a result
window.addEventListener("load", async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const user = result.user;
      const username = sessionStorage.getItem("username") || "Unknown User";

      // Check if we got the user object
      console.log("User Info:", user); // Logs the user object

      // If the email is undefined, check if Google account data is available
      if (!user.email) {
        console.error("Email is not available in the user object.");
        return;
      }

      // ✅ Save user data to Firestore (email included)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: username,
        email: user.email || "No email found", // Ensure email is stored
        profilePic: user.photoURL || "No profile pic",
      });

      alert(`Welcome, ${username}!`);
      window.location.href = "index.html"; // Redirect after login
    } else {
      console.error("No user found after redirect.");
    }
  } catch (error) {
    console.error("Login Error:", error);
  }
});
