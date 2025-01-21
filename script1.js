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
