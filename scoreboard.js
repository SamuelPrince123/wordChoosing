// Wrap everything inside this function to avoid multiple declarations
// showAll=false → current user only; showAll=true → full leaderboard
async function loadScoreboard(showAll = false) {
  const output = document.getElementById("output");
  const userCard = document.getElementById("user-card");

  // Safely initialize Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: "AIzaSyCxyhobAIxWsTPRGjAiTpYywsWBA4MkAj8",
      authDomain: "wordchoosing.firebaseapp.com",
      projectId: "wordchoosing",
      storageBucket: "wordchoosing.appspot.com",
      messagingSenderId: "11998731462",
      appId: "1:11998731462:web:fa6494cfc027896b6d8bc7",
      measurementId: "G-0JMJRW97WE",
    });
  }

  async function calculateAndShowStats(user) {
    const logsRef = firebase
      .firestore()
      .collection(`/users/${user.uid}/level_logs`);
    const userDocRef = firebase.firestore().doc(`/users/${user.uid}`);

    try {
      const levelsSnapshot = await logsRef.get();
      if (levelsSnapshot.empty) {
        output.textContent = "⚠️ No levels found.";
        return;
      }

      let resultHTML = "<h3>✅ Average Marks for All Levels</h3><ul>";
      let totalOfAverages = 0;
      let validLevelCount = 0;
      let finalScoreTotal = 0;
      let finalScoreCount = 0;

      for (const doc of levelsSnapshot.docs) {
        const docId = doc.id;
        const data = doc.data();
        let gradeTotal = 0;
        let gradeCount = 0;

        for (const key in data) {
          if (/^pure_grade \d+$/.test(key)) {
            const value = parseFloat(data[key].replace("%", ""));
            if (!isNaN(value)) {
              gradeTotal += value;
              gradeCount++;
            }
          }
        }

        if (gradeCount > 0) {
          const avg = gradeTotal / gradeCount;
          await logsRef
            .doc(docId)
            .set({ "average marks": `${avg.toFixed(2)}%` }, { merge: true });
          resultHTML += `<li>📘 ${docId} → Average Marks: <strong>${avg.toFixed(
            2
          )}%</strong> (from ${gradeCount} pure_grades)</li>`;
          totalOfAverages += avg;
          validLevelCount++;
        } else {
          resultHTML += `<li>⚠️ ${docId}: No pure_grade fields found.</li>`;
        }

        const levelNumMatch = docId.match(/^Level_(\d+)$/);
        const levelNum = levelNumMatch ? parseInt(levelNumMatch[1]) : 0;
        if (levelNum >= 4 && typeof data.finalScore === "number") {
          finalScoreTotal += data.finalScore;
          finalScoreCount++;
        }
      }

      resultHTML += "</ul>";
      let totalAvg1 = null;
      let totalAvg2 = null;

      if (validLevelCount > 0) {
        totalAvg1 = totalOfAverages / validLevelCount;
        await userDocRef.set(
          { "Total Average Percentage 1": `${totalAvg1.toFixed(2)}%` },
          { merge: true }
        );
        resultHTML += `<p><strong>🎯 Total Average Percentage 1 (From Levels):</strong> ${totalAvg1.toFixed(
          2
        )}%</p>`;
      }

      if (finalScoreCount > 0) {
        totalAvg2 = finalScoreTotal / finalScoreCount;
        await userDocRef.set(
          { "Total Average Percentage 2": `${totalAvg2.toFixed(2)}%` },
          { merge: true }
        );
        resultHTML += `<p><strong>🚀 Total Average Percentage 2 (From Tests):</strong> ${totalAvg2.toFixed(
          2
        )}%</p>`;
      } else {
        resultHTML += `<p>⚠️ No finalScore values found in Level_4 or higher.</p>`;
      }

      if (totalAvg1 !== null && totalAvg2 !== null) {
        const score40 = (totalAvg1 / 100) * 40;
        const score60 = (totalAvg2 / 100) * 60;
        const finalPercentage = score40 + score60;
        await userDocRef.set(
          { FinalPercentage: `${finalPercentage.toFixed(2)}%` },
          { merge: true }
        );
        resultHTML += `<p><strong>🏆 Final Percentage:</strong> ${finalPercentage.toFixed(
          2
        )}%</p>`;
      }

      const totalLevelsCreated = levelsSnapshot.docs.length;
      const totalAvailableLevels = 23;
      const completionRatio = (totalLevelsCreated / totalAvailableLevels) * 100;
      await userDocRef.set(
        { "Level Completion": `${completionRatio.toFixed(2)}%` },
        { merge: true }
      );
      resultHTML += `<p><strong>📈 Grade Completion:</strong> ${completionRatio.toFixed(
        2
      )}% (based on ${totalLevelsCreated} of 23 Grades)</p>`;

      output.innerHTML = resultHTML;

      const userDocSnap = await userDocRef.get();
      const userData = userDocSnap.data();
      userCard.innerHTML = `
        <div class="user-info">
          <div class="left">
            <img src="${user.photoURL}" alt="User Photo" />
            <div>
              <div><strong>${userData.name || "Unnamed"}</strong></div>
              <div>${user.email}</div>
            </div>
          </div>
          <div class="right">
            <div><strong>Final Marks:</strong> ${
              userData.FinalPercentage || "N/A"
            }</div>
            <div><strong>Progress:</strong> ${
              userData["Level Completion"] || "N/A"
            } completed</div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error("❌ Error:", error);
      output.textContent = "❌ Error fetching or processing data.";
      userCard.innerHTML = "<p>Error loading scoreboard.</p>";
    }
  }

  async function loadAllUsersScoreboard() {
    const db = firebase.firestore();
    try {
      const usersSnapshot = await db.collection("users").get();
      if (usersSnapshot.empty) {
        output.textContent = "⚠️ No users found.";
        userCard.innerHTML = "";
        return;
      }
      let usersData = [];
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          name: data.name || "Unnamed",
          email: data.email || "No Email",
          photoURL: data.photoURL || "default-avatar.png",
          finalPercentage: data.FinalPercentage || "N/A",
          levelCompletion: data["Level Completion"] || "N/A",
          rankScore: data.rankScore || "0%",
        });
      });
      usersData.sort(
        (a, b) => parseFloat(b.rankScore) - parseFloat(a.rankScore)
      );
      let html = `<div class="scoreboard-scroll"><div class="scoreboard-header"><div>#</div><div>User</div><div>Rank Score</div><div>Final Marks</div><div>Progress</div></div>`;
      usersData.forEach((user, idx) => {
        html += `
          <div class="user-info"><div>${idx + 1}</div><div><img src="${
          user.photoURL
        }"/><div>${user.name}</div><div>${user.email}</div></div><div>${
          user.rankScore
        }</div><div>${user.finalPercentage}</div><div>${
          user.levelCompletion
        } completed</div></div>
        `;
      });
      html += `</div>`;
      output.innerHTML = html;
      userCard.style.display = "none";
    } catch (err) {
      console.error("Error loading users:", err);
      output.textContent = "❌ Error loading scoreboard.";
      userCard.innerHTML = "";
    }
  }

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      output.textContent = "⚠️ Please log in to view the scoreboard.";
      userCard.innerHTML = "<p>Please log in to view your stats.</p>";
      userCard.style.display = "block";
      return;
    }
    if (showAll) {
      await loadAllUsersScoreboard();
    } else {
      await calculateAndShowStats(user);
    }
  });
}
