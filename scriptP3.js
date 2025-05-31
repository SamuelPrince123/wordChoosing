function saveFinalScoreToFirestore(resultMessage) {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        const scoreDocRef = db
          .collection("users")
          .doc(user.uid)
          .collection("level_logs")
          .doc("Level_1");

        await scoreDocRef.set(
          {
            result: resultMessage, // ✅ Only updating the score
          },
          { merge: true } // ✅ Merges with existing data (does not overwrite)
        );

        console.log("✅ Final score updated in Firestore.");
      } catch (error) {
        console.error("❌ Error updating score:", error);
      }
    } else {
      console.warn("⚠️ User not logged in. Score not saved.");
    }
  });
}

// List of available music files

const musicFiles = [
  "music/music1.mp3",
  "music/music2.mp3",
  "music/music3.mp3",
  "music/music4.mp3",
];

// Function to simulate loading progress from 0% to 100%
window.onload = function () {
  let progress = 0;
  const progressBar = document.querySelector(".loading-progress");
  const loadingText = document.getElementById("loading-text");

  const interval = setInterval(function () {
    if (progress < 100) {
      progress += 4; // Increase progress by 2% at a time
      progressBar.style.width = progress + "%"; // Update progress bar width
      loadingText.textContent = "Loading... " + progress + "%"; // Update text
    } else {
      clearInterval(interval); // Stop the loading animation once it's 100%
      document.getElementById("loading-screen").style.display = "none"; // Hide the loading screen
      document.getElementById("start-screen").style.display = "block"; // Show the start screen
    }
  }, 100); // Update every 100ms (adjust for speed)
};

function goBack() {
  window.location.href = "Pkg.html";
}

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
  "Dad",
  "Baby",
  "Boy",
  "Girl",
  "Friend",
  "Teacher",
  "Play",
  "Women",
  "Cry",
  "Sisters",
  "Brothers",
  "Grandma",
];
const imagePaths = [
  "images/Dad.png",
  "images/Baby.jpg",
  "images/Boy.png",
  "images/Girl.png",
  "images/Friend.jpg",
  "images/Teacher.jpg",
  "images/Play.jpg",
  "images/Women.png",
  "images/Cry.jpg",
  "images/Sisters.png",
  "images/Brothers.png",
  "images/Grandma.avif",
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
let correctCount = 0;
let incorrectCount = 0;

// Function to check if the word matches the current image
function checkWord(word) {
  const currentImage = shuffledWords[currentImageIndex];

  // Check if the selected word matches the current image
  if (word === currentImage) {
    // Play correct audio
    correctAudio.play();
    correctCount++;

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
        showOptions(); // Show new word options
      } else {
        showFinalScore(); // Show final score
      }
    }, 1000);
  } else {
    // Play incorrect audio
    incorrectAudio.play();
    incorrectCount++;

    document.getElementById("message").textContent =
      "Try again! That's not the correct word.";

    // Automatically move to the next image after a brief delay
    setTimeout(() => {
      currentImageIndex++;
      if (currentImageIndex < shuffledWords.length) {
        // Change the image source to the next shuffled image
        document.getElementById("current-image").src =
          shuffledImagePaths[currentImageIndex];
        document.getElementById("message").textContent = "";
        showOptions(); // Show new word options
      } else {
        showFinalScore(); // Show final score
      }
    }, 1000); // Delay before moving to the next image
  }
}

// Function to display five random word options for each image
function showOptions() {
  const optionsContainer = document.getElementById("options-container");
  optionsContainer.innerHTML = ""; // Clear existing options

  // Select three random words (including the correct word)
  const options = [shuffledWords[currentImageIndex]]; // Start with the correct word

  // Add two more random words that are not the current word
  while (options.length < 5) {
    const randomWord =
      shuffledWords[Math.floor(Math.random() * shuffledWords.length)];
    if (!options.includes(randomWord)) {
      options.push(randomWord);
    }
  }

  // Shuffle the options array to randomize the order
  shuffleArray(options);

  // Create the buttons for each option
  options.forEach((word) => {
    const button = document.createElement("button");
    button.classList.add("word-button");
    button.textContent = word;
    button.onclick = () => checkWord(word); // Attach the check function
    optionsContainer.appendChild(button);
  });
}

// Show the game and play the music when the user clicks "Start"
document.getElementById("start-button").onclick = function () {
  document.getElementById("start-screen").style.display = "none"; // Hide the start screen
  document.getElementById("game-container").style.display = "block"; // Show the game
  playRandomMusic(); // Play random background music on start

  // Display the first shuffled image
  document.getElementById("current-image").src =
    shuffledImagePaths[currentImageIndex];

  // Display the word options for the first round
  showOptions();
};

// Mute/unmute functionality
let isMuted = false;
const audioElement = document.getElementById("background-music");

document.getElementById("mute-button").onclick = function () {
  if (isMuted) {
    audioElement.muted = false;
    document.getElementById("mute-button").textContent = "🔊";
  } else {
    audioElement.muted = true;
    document.getElementById("mute-button").textContent = "🔇";
  }
  isMuted = !isMuted;
};

const correctAudio = new Audio("PopUP/correct.mp3");
const incorrectAudio = new Audio("PopUP/incorrect.mp3");

// Update their mute state to follow the global mute toggle
document.getElementById("mute-button").onclick = function () {
  isMuted = !isMuted;
  audioElement.muted = isMuted;
  correctAudio.muted = isMuted;
  incorrectAudio.muted = isMuted;
  document.getElementById("mute-button").textContent = isMuted ? "🔇" : "🔊";
};

// Function to show the final score in a dramatic pop-up modal and redirect
function showFinalScore() {
  // Prepare the message
  const message = `Correct: ${correctCount}, Incorrect: ${incorrectCount}`;

  // Determine the additional message based on the score
  let additionalMessage = "";
  if (correctCount === shuffledWords.length) {
    additionalMessage = "Perfect Score! 🎉";
  } else if (correctCount > incorrectCount) {
    additionalMessage = "Well done! 👍";
  } else {
    additionalMessage = "Better luck next time! 💪";
  }

  // Display the message in the modal
  const finalScoreMessage = document.getElementById("final-score-message");
  const finalResultMessage = `${message} ${additionalMessage}`;
  finalScoreMessage.textContent = finalResultMessage;

  // ✅ Save to Firebase
  saveFinalScoreToFirestore(finalResultMessage);

  // Show the modal with an animation
  const modal = document.getElementById("final-score-modal");
  modal.style.display = "block";

  // Function to play final sound
  function playFinalSound() {
    const finalSound = new Audio(
      "music/hand-clap-with-together-sound-effect-263698.mp3"
    );
    finalSound.muted = isMuted; // Respect the mute state
    finalSound.play();
  }

  // Add an animation to the modal (zoom-in effect)
  setTimeout(() => {
    modal.classList.add("zoom-in");
  }, 10);

  // Add event listener to close the modal when clicking the close button
  document.getElementById("close-modal").onclick = function () {
    modal.style.display = "none";
    startLoading(); // Start the loading animation
  };

  // Optionally, add a delay to close the modal after a few seconds
  setTimeout(() => {
    modal.style.display = "none";
    startLoading(); // Start the loading animation after 10 seconds if not closed
  }, 10000); // Close the modal after 10 seconds
}

// Function to handle the loading animation from 0% to 100%
function startLoading() {
  // Dynamically add styles for the loading bar
  const style = document.createElement("style");
  style.innerHTML = `
  @media (min-width: 769px) {
    /* Style for the loading screen */
    #loading-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 9999;
    }

    .loading-bar {
      width: 70%;
      height: 10px;
      background-color: #ddd;
      border-radius: 5px;
      overflow: hidden;
      position: relative;
      top: 250px;
      left: 230px;
    }

    .loading-progress {
      width: 0%;
      height: 100%;
      background-color: #ff69b4;
      border-radius: 5px;
    }

    #loading-text {
      font-size: 18px;
      font-weight: bold;
      color: #ff69b4;
      margin-top: 20px;
      position: relative;
      top: 250px;
      left: 0;
    }
  }
`;

  document.head.appendChild(style);

  // Show the loading screen
  document.getElementById("loading-screen").style.display = "block";

  let progress = 0;
  const progressBar = document.querySelector(".loading-progress");
  const loadingText = document.getElementById("loading-text");

  const interval = setInterval(function () {
    if (progress < 100) {
      progress += 2; // Increase progress by 2% at a time
      progressBar.style.width = progress + "%"; // Update progress bar width
      loadingText.textContent = "Loading... " + progress + "%"; // Update text
    } else {
      clearInterval(interval); // Stop the loading animation once it's 100%
      setTimeout(() => {
        redirectToPage(); // Redirect after the loading is complete
      }, 500); // Optional delay before redirecting
    }
  }, 100); // Update every 100ms (adjust for speed)
}

// Function to handle redirection to the desired page
function redirectToPage() {
  window.location.href = "Pkg.html"; // Replace with your target page
}
