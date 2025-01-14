// List of available music files
const musicFiles = [
  "music/music1.mp3",
  "music/music2.mp3",
  "music/music3.mp3",
  "music/music4.mp3",
];

// Correct and Incorrect audio files
const correctAudio = new Audio("PopUP/correct.mp3"); // Correct audio
const incorrectAudio = new Audio("PopUP/incorrect.mp3"); // Incorrect audio

// Shuffle function to randomly reorder an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

// Function to play random music with a delay of 3.5 seconds after starting the game
function playRandomMusic() {
  const randomIndex = Math.floor(Math.random() * musicFiles.length); // Random index for music
  const audioElement = document.getElementById("background-music");
  audioElement.src = musicFiles[randomIndex]; // Set the source to the random music

  // Start with a low volume
  audioElement.volume = 0.1; // Set initial low volume (10%)

  // Play the music after 2 seconds
  setTimeout(() => {
    audioElement.play().catch((error) => {
      console.error("Error playing music:", error);
    });

    // Gradually increase the volume to max over 10 seconds
    let volume = 0.1;
    const volumeInterval = setInterval(() => {
      if (volume < 1) {
        volume += 0.1; // Increase volume in increments
        audioElement.volume = volume;
      } else {
        clearInterval(volumeInterval); // Stop increasing when the volume reaches max
      }
    }, 1000); // Adjust the frequency of volume increase (1000ms = 1 second)
  }, 2000); // Delay the music by 3500ms (2 seconds)
}

// Define words and image paths
const words = [
  "apple",
  "banana",
  "cherry",
  "annoy",
  "attention",
  "calm",
  "comfortable",
];
const imagePaths = [
  "images/apple.jpg",
  "images/banana.jpg",
  "images/cherry.jpg",
  "images/annoy.jpg",
  "images/attention.jpg",
  "images/calm.jpg",
  "images/comfortable.jpg",
];

// Create an array of objects combining words and their corresponding image paths
const imagesAndWords = words.map((word, index) => ({
  word: word,
  imagePath: imagePaths[index],
}));

// Shuffle the combined array
shuffleArray(imagesAndWords);

// Separate the shuffled array back into words and image paths
const shuffledWords = imagesAndWords.map((item) => item.word);
const shuffledImagePaths = imagesAndWords.map((item) => item.imagePath);

// Define current index for tracking progress
let currentImageIndex = 0;

// Function to check if the word matches the current image
function checkWord(word) {
  const currentImage = shuffledWords[currentImageIndex];

  // Check if the selected word matches the current image
  if (word === currentImage) {
    // Play correct audio
    correctAudio.play();

    // Add green outline to the image
    document.getElementById("current-image").classList.add("green-outline");
    document.getElementById("message").textContent =
      "Correct! Click Next to continue.";

    // Hide the clicked word button
    const buttons = document.querySelectorAll(".word-button");
    buttons.forEach((button) => {
      if (button.textContent.toLowerCase() === word) {
        button.style.display = "none";
      }
    });

    // Move to the next image after a delay
    setTimeout(() => {
      currentImageIndex++;
      if (currentImageIndex < shuffledWords.length) {
        // Change the image source to the next shuffled image
        document.getElementById("current-image").src =
          shuffledImagePaths[currentImageIndex];
        document.getElementById("message").textContent = "";
        document
          .getElementById("current-image")
          .classList.remove("green-outline");
      } else {
        document.getElementById("message").textContent =
          "Congratulations! You completed the game!";
      }
    }, 1000);
  } else {
    // Play incorrect audio
    incorrectAudio.play();
    document.getElementById("message").textContent =
      "Try again! That's not the correct word.";
  }
}

// Show the game and play the music when the user clicks "Start"
document.getElementById("start-button").onclick = function () {
  document.getElementById("start-screen").style.display = "none"; // Hide the start screen
  document.getElementById("game-container").style.display = "block"; // Show the game
  playRandomMusic(); // Play random background music on start

  // Display the first shuffled image
  document.getElementById("current-image").src =
    shuffledImagePaths[currentImageIndex];
};

// Mute/unmute functionality
let isMuted = false;
const audioElement = document.getElementById("background-music");
document.getElementById("mute-button").onclick = function () {
  if (isMuted) {
    audioElement.muted = false; // Unmute the audio
    document.getElementById("mute-button").textContent = "Mute"; // Change button text to "Mute"
  } else {
    audioElement.muted = true; // Mute the audio
    document.getElementById("mute-button").textContent = "Unmute"; // Change button text to "Unmute"
  }
  isMuted = !isMuted; // Toggle mute state
};
