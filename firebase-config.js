// Import necessary Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Ensure auth is imported
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
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
const auth = getAuth(app); // Initialize Firebase Auth
const analytics = getAnalytics(app);

export { app, auth }; // Export both for use in other files
