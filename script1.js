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
