// File: bob.js

function logBhutanTime() {
  const bhutanTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Thimphu",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
  console.log("\u23F0 Bhutan Time:", bhutanTime);
}
setInterval(logBhutanTime, 5000);

const prices = { 20: 15, 50: 30, 100: 55, 200: 100 };
const query = new URLSearchParams(window.location.search);
let coins = query.get("coins");
if (!coins) {
  coins = localStorage.getItem("selectedCoins");
} else {
  localStorage.setItem("selectedCoins", coins);
}
const price = prices[coins] || "—";
document.getElementById("coinAmount").textContent = `You selected: ${
  coins || "—"
} Coins`;
document.getElementById(
  "coinPrice"
).textContent = `Amount to Pay: Nu. ${price}`;

const endpoint =
  "https://ocr-vision-sonu.cognitiveservices.azure.com/vision/v3.2/read/analyze";
const subscriptionKey =
  "4IirSEHGytWAlA0KkJpMqr7bUmxm8zG6guvyMXo7Qhfd5B6UfON0JQQJ99BFACGhslBXJ3w3AAAFACOG6aEw";

async function scanWithAzure(file) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": subscriptionKey,
      "Content-Type": "application/octet-stream",
    },
    body: file,
  });
  if (response.status !== 202) {
    const errorData = await response.json();
    throw new Error(`Error ${response.status}: ${errorData.error.message}`);
  }
  return response.headers.get("Operation-Location");
}

async function getAzureResult(operationLocation) {
  while (true) {
    const resp = await fetch(operationLocation, {
      headers: { "Ocp-Apim-Subscription-Key": subscriptionKey },
    });
    const result = await resp.json();
    if (result.status === "succeeded") return result.analyzeResult.readResults;
    if (result.status === "failed") throw new Error("OCR processing failed");
    await new Promise((r) => setTimeout(r, 1000));
  }
}

const submitBtn = document.getElementById("submitPayment");
const fileInput = document.getElementById("paymentProof");
const ocrOutput = document.getElementById("ocrOutput");
const loadingSpinner = document.getElementById("loadingSpinner");
const loadingText = document.getElementById("loadingText");
const modal = document.getElementById("confirmationModal");
const modalCoins = document.getElementById("modalCoins");
const timeModal = document.getElementById("timeMismatchModal");
const blurOverlay = document.getElementById("blurOverlay");
const contentWrapper = document.getElementById("contentWrapper");

submitBtn.addEventListener("click", async () => {
  if (!fileInput.files.length) {
    alert("Please upload a payment screenshot before submitting.");
    return;
  }

  ocrOutput.style.display = "block";
  ocrOutput.textContent = "Scanning image, please wait...";
  loadingSpinner.style.display = "block";
  loadingText.style.display = "block";
  blurOverlay.style.display = "block";
  contentWrapper.classList.add("blurred");

  try {
    const operationLocation = await scanWithAzure(fileInput.files[0]);
    const pages = await getAzureResult(operationLocation);

    // Build full OCR text
    let text = "";
    pages.forEach((page) =>
      page.lines.forEach((line) => (text += line.text + "\n"))
    );
    ocrOutput.textContent =
      "Scanned Text:\n\n" + (text.trim() || "No text detected.");
    console.log("📄 OCR Scanned Text:", text);

    // —— Manual parse into Bhutan‐local timestamps ——
    // Month mapping
    const months = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
    };

    // Extract date & time parts
    const dateMatch = text.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    const timeMatch = text.match(/(\d{1,2}):(\d{2}):(\d{2})\s*([APMapm]{2})/);
    let scannedTimestampMs = null;

    if (dateMatch && timeMatch) {
      const day = parseInt(dateMatch[1], 10);
      const month = months[dateMatch[2]];
      const year = parseInt(dateMatch[3], 10);

      let hour = parseInt(timeMatch[1], 10);
      const minute = parseInt(timeMatch[2], 10);
      const second = parseInt(timeMatch[3], 10);
      const ampm = timeMatch[4].toUpperCase();
      if (ampm === "PM" && hour !== 12) hour += 12;
      if (ampm === "AM" && hour === 12) hour = 0;

      // Build UTC-based timestamp corresponding to that Bhutan local time
      scannedTimestampMs = Date.UTC(year, month, day, hour, minute, second);
    }
    if (scannedTimestampMs === null) {
      throw new Error("Could not detect time in the uploaded image.");
    }
    console.log(
      "🕒 Parsed Bhutan Local Date (as UTC ms):",
      new Date(scannedTimestampMs).toISOString()
    );

    // Compute current Bhutan timestamp in ms
    const now = new Date();
    const nowUtcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const currentBhutanMs = nowUtcMs + 6 * 3600 * 1000;
    console.log("📍 Current Bhutan timestamp (ms):", currentBhutanMs);

    // Difference in minutes (absolute)
    let diffMinutes = Math.abs((currentBhutanMs - scannedTimestampMs) / 60000);

    // Manually subtract 780 minutes (13 hours) to adjust difference
    diffMinutes = diffMinutes - 421;
    if (diffMinutes < 0) diffMinutes = Math.abs(diffMinutes);

    console.log(
      "⏱️ Adjusted Time difference (minutes):",
      diffMinutes.toFixed(2)
    );

    if (diffMinutes > 30) {
      throw new Error("Time gap too large. Purchase cancelled.");
    }

    // If time difference is okay, send data to Google Apps Script
    const formData = new FormData();
    formData.append("name", "Sonu Tiwari");
    formData.append("message", text);
    formData.append("email", "st659136@gmail.com");

    const res = await fetch(
      "https://script.google.com/macros/s/AKfycby3w823YAvtLU_bJlIECm-qeJvilZ_juMxhxsMjuevJVVF7RrGszAeyPE8KQGvfXEdd/exec",
      { method: "POST", body: formData }
    );
    await res.text();

    modalCoins.textContent = coins;
    modal.style.display = "flex";
  } catch (err) {
    console.error("❌ Error:", err.message);
    timeModal.style.display = "flex";
  } finally {
    loadingSpinner.style.display = "none";
    loadingText.style.display = "none";
    blurOverlay.style.display = "none";
    contentWrapper.classList.remove("blurred");
  }
});
