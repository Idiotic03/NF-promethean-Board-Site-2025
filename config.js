// config.js
const DEBUG_MODE = false;
const DEBUG_DATE = new Date("2025-08-15T16:00:00");


function getCurrentWeek() {
  const startDate = new Date("2025-12-15"); // Set your first A-week Monday here
  const now = DEBUG_MODE ? DEBUG_DATE : new Date();

  const diffInDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  const weeksPassed = Math.floor(diffInDays / 7);

  return weeksPassed % 2 === 0 ? "A" : "B"; // Even weeks are A-week
}



