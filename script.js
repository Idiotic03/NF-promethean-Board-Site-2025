// === CONFIG IS LOADED FROM config.js ===
// Expected globals: DEBUG_MODE, DEBUG_DATE

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Get current time, optionally overridden for debug mode
let now = DEBUG_MODE ? new Date(DEBUG_DATE) : new Date();
let currentDayIndex = now.getDay();
let todayName = weekdays[currentDayIndex];

// Determine week type based on date
let weekType;

function isAWeek() {
  const startDate = new Date("2024-08-05"); // Set your first A-week Monday here
  const nowDate = DEBUG_MODE ? new Date(DEBUG_DATE) : new Date();

  const diffInDays = Math.floor((nowDate - startDate) / (1000 * 60 * 60 * 24));
  const weeksPassed = Math.floor(diffInDays / 7);

  return weeksPassed % 2 === 0 ? "A" : "B"; // Even weeks are A-week
}

// Get the week type dynamically based on the date
weekType = isAWeek();

// Apply the correct class to the body (for color changes)
document.body.classList.remove("a-week", "b-week");
document.body.classList.add(`${weekType.toLowerCase()}-week`);

// === DOM Update ===
document.getElementById("day-name").textContent = todayName;
document.getElementById("week-label").textContent = `${weekType}-WEEK`;

// === LIVE CLOCK + ROLLOVER HANDLING ===
function updateClock() {
  if (DEBUG_MODE) {
    now = new Date(now.getTime() + 1000); // Simulated passage of time
  } else {
    now = new Date();
  }

  const dateElem = document.getElementById("date-text");
  const timeElem = document.getElementById("time-text");

  if (dateElem) {
    dateElem.textContent = now.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  if (timeElem) {
    timeElem.textContent = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  const newDayIndex = now.getDay();
  if (newDayIndex !== currentDayIndex) {
    location.reload();
  }
}
setInterval(updateClock, 1000);
updateClock();

// === Schedule Data ===
// Define your schedule data for both A and B weeks
const schedule = {
  "A": {
    Monday: [
      ["Period 1", "9:15 am - 10:25 am"],
      ["Period 2", "10:30 am - 11:40 am"],
      ["Advisory", "11:45 am - 12:16 pm"],
      ["Lunch", "12:23 pm - 12:53 pm"],
      ["Period 3", "12:59 pm - 2:27 pm"],
      ["Period 4", "2:32 pm - 4:00 pm"]
    ],
    // Add other days...
  },
  "B": {
    Monday: [
      ["Period 1", "9:15 am - 10:43 am"],
      ["Period 2", "10:48 am - 12:16 pm"],
      ["Lunch", "12:23 pm - 12:53 pm"],
      ["Advisory", "12:59 pm - 1:29 pm"],
      ["Period 3", "1:34 pm - 2:45 pm"],
      ["Period 4", "2:50 pm - 4:00 pm"]
    ],
    // Add other days...
  }
};

// === Load Schedule ===
const scheduleTable = document.getElementById("schedule-table");
let scheduleForToday = schedule[weekType][todayName];
if (typeof scheduleForToday === "string") {
  scheduleForToday = schedule[weekType][scheduleForToday];
}
scheduleForToday.forEach(([period, time]) => {
  const row = document.createElement("tr");
  const highlightTerms = ["Advisory", "Tutoring", "Discovery"];
  const isHighlighted = highlightTerms.some(term => period.toLowerCase().includes(term.toLowerCase()));
  const periodHTML = isHighlighted ? `<strong>${period}</strong>` : period;
  row.innerHTML = `<td>${periodHTML}</td><td>${time}</td>`;
  scheduleTable.appendChild(row);
});

// === Load Today’s Events ===
loadEvents("today-events", todayName.toLowerCase());

// === Load Upcoming Days ===
// Always show Monday–Friday in rotating order starting with today
const schoolDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const todayIndex = schoolDays.indexOf(todayName);

// Rotate so the list starts with the day after today
const rotatedDays = [
  ...schoolDays.slice(todayIndex + 1),
  ...schoolDays.slice(0, todayIndex + 1)
];

// Drop today, keep next 4 days
const upcomingDays = rotatedDays.slice(0, 4);

// Render upcoming day boxes
const container = document.getElementById("upcoming-days");
container.innerHTML = ""; // Clear any existing content

upcomingDays.forEach(day => {
  const column = document.createElement("div");
  column.className = "day-column";
  column.innerHTML = `<h4>${day}</h4><div id="${day.toLowerCase()}-events" class="day-events"></div>`;
  container.appendChild(column);
  loadEvents(`${day.toLowerCase()}-events`, day.toLowerCase());
});

// === Load Events Helper ===
function loadEvents(targetId, fileName) {
  fetch(`events/${fileName}.txt`)
    .then(res => res.ok ? res.text() : "")
    .then(text => {
      const box = document.getElementById(targetId);
      if (!box) return;

      box.innerHTML = "";

      const wrapper = document.createElement("div");
      wrapper.classList.add("event-html");
      wrapper.innerHTML = text.trim();
      box.appendChild(wrapper);
    })
    .catch(() => {
      const box = document.getElementById(targetId);
      if (box) box.textContent = "No events found.";
    });
}

// === Time-Based Background Logic ===
function updateBackgroundColorByTime() {
  const hour = DEBUG_MODE ? DEBUG_DATE.getHours() : new Date().getHours();
  const bg = document.getElementById('background-color-layer');
  if (!bg) return;

  if (hour >= 6 && hour < 11) {
    bg.style.backgroundColor = '#FBBF66'; // Sunrise
  } else if (hour >= 11 && hour < 15) {
    bg.style.backgroundColor = '#ADD8E6'; // Midday
  } else if (hour >= 15 && hour < 19) {
    bg.style.backgroundColor = '#4169E1'; // Evening
  } else {
    bg.style.backgroundColor = '#1c1c2e'; // Night
  }
}

function updateCloudColor() {
  const hour = DEBUG_MODE ? DEBUG_DATE.getHours() : new Date().getHours();
  const cloudLayer = document.querySelector('.layer5');
  if (!cloudLayer) return;

  if (hour >= 11 && hour < 15) {
    cloudLayer.style.filter = 'brightness(0) invert(1)'; // White
  } else {
    cloudLayer.style.filter = 'none'; // Original color
  }
}

// === Run on DOM Ready ===
window.addEventListener("DOMContentLoaded", () => {
  updateCloudColor();
  updateBackgroundColorByTime();

  setInterval(() => {
    updateCloudColor();
    updateBackgroundColorByTime();
  }, 600000); // every 10 minutes
});
