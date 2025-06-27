// File: energy-update.js

// ——————————————————————————————————————————————————
// 1) This file assumes you already loaded the v8 Firebase SDK
//    (firebase-app.js and firebase-firestore.js) *before* this.
// 2) It also assumes you initialized firebase.initializeApp(firebaseConfig)
//    somewhere earlier (e.g. in your dashboard HTML).
// ——————————————————————————————————————————————————

(function (window, firebase) {
  // Shortcut to your Firestore
  const db = firebase.firestore();

  // Your fixed user‐doc path
  const USER_DOC = "/users/wonqxTRDoyX3k63xrFTk6KTZMhH3";

  // Map paid amount → coins
  const priceToCoins = {
    15: 20, // Nu.15
    0.99: 20, // $0.99
    30: 50, // Nu.30
    1.99: 50, // $1.99
    55: 100, // Nu.55
    2.99: 100, // $2.99
    100: 200, // Nu.100
    3.99: 200, // $3.99
  };

  /**
   * Call this after you know the user paid `amountPaid` (number).
   * It will pick the right coin bundle and bump `energy` in Firestore.
   *
   * @param {number} amountPaid  The numeric price (e.g. 15, 0.99, 30, etc.)
   */
  window.updateEnergyFromAmount = async function (amountPaid) {
    const coins = priceToCoins[amountPaid];
    if (!coins) {
      console.warn("⚠️ No mapping for amount:", amountPaid);
      return;
    }
    try {
      await db
        .doc(USER_DOC)
        .update({ energy: firebase.firestore.FieldValue.increment(coins) });
      console.log(`✅ Energy +${coins} applied`);
    } catch (err) {
      console.error("❌ Failed to update energy:", err);
    }
  };
})(window, firebase);
