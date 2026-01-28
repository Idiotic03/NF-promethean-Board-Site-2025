// === CONFIG IS LOADED FROM config.js ===
// Expected globals: ACTIVE_SCHEDULE, SPECIAL_SCHEDULES, SCHEDULE_META, getCurrentWeek()

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
let now = new Date();
let currentDayIndex = now.getDay();
let todayName = weekdays[currentDayIndex];
let weekType = getCurrentWeek();

// Helper function to get current active schedule configuration
function getActiveScheduleConfig() {
  const ACTIVE_SCHEDULE = window.ACTIVE_SCHEDULE || { mode: 'AUTO' };
  const SPECIAL_SCHEDULES = window.SPECIAL_SCHEDULES || {};
  const SCHEDULE_META = window.SCHEDULE_META || {};
  
  let forcedSchedule = null;
  let activeMeta = null;
  
  if (ACTIVE_SCHEDULE.mode && ACTIVE_SCHEDULE.mode !== 'AUTO') {
    const key = ACTIVE_SCHEDULE.mode.toUpperCase();
    const todayKey = new Date().toISOString().slice(0,10);
    const stored = localStorage.getItem('specialScheduleDate');
    
    // Check if special schedule expired
    if (stored && stored !== todayKey) {
      // Reset to AUTO since day changed
      window.ACTIVE_SCHEDULE.mode = 'AUTO';
      localStorage.removeItem('specialScheduleDate');
    } else {
      if (SPECIAL_SCHEDULES[key] && SPECIAL_SCHEDULES[key].default) {
        forcedSchedule = SPECIAL_SCHEDULES[key].default;
        activeMeta = SCHEDULE_META[key] || null;
        localStorage.setItem('specialScheduleDate', todayKey);
      }
    }
  }
  
  return { forcedSchedule, activeMeta };
}

// Get initial config
let { forcedSchedule, activeMeta } = getActiveScheduleConfig();
const SPECIAL_SCHEDULES = window.SPECIAL_SCHEDULES || {};
const SCHEDULE_META = window.SCHEDULE_META || {};

// Apply the correct class to the body (for color changes)
document.body.classList.remove("a-week", "b-week");
document.body.classList.add(`${weekType.toLowerCase()}-week`);

// === DOM Update ===
document.getElementById("day-name").textContent = todayName;
document.getElementById("week-label").textContent = `${weekType}-WEEK`;

// === LIVE CLOCK + ROLLOVER HANDLING ===
let clockUpdateScheduled = false;
function updateClock() {
  if (clockUpdateScheduled) return;
  clockUpdateScheduled = true;
  
  requestAnimationFrame(() => {
    now = new Date();

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
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    }

    const newDayIndex = now.getDay();
    if (newDayIndex !== currentDayIndex) {
      location.reload();
    }
    
    clockUpdateScheduled = false;
  });
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
    Tuesday: [
      ["Period 1", "9:15 am - 10:25 am"],
      ["Period 2", "10:30 am - 11:40 am"],
      ["Tutoring", "11:45 am - 12:16 pm"],
      ["Lunch", "12:23 pm - 12:53 pm"],
      ["Period 3", "12:59 pm - 2:27 pm"],
      ["Period 4", "2:32 pm - 4:00 pm"]
    ],
    Wednesday: "Tuesday",
    Thursday: "Tuesday",
    Friday: [
      ["Period 1", "9:15 am - 10:10 am"],
      ["Period 2", "10:15 am - 11:10 am"],
      ["Discovery", "11:15 am - 12:16 pm"],
      ["Lunch", "12:23 pm - 12:53 pm"],
      ["Period 3", "12:59 pm - 2:27 pm"],
      ["Period 4", "2:32 pm - 4:00 pm"]
    ]
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
    Tuesday: [
      ["Period 1", "9:15 am - 10:43 am"],
      ["Period 2", "10:48 am - 12:16 pm"],
      ["Lunch", "12:23 pm - 12:53 pm"],
      ["Tutoring", "12:59 pm - 1:29 pm"],
      ["Period 3", "1:34 pm - 2:45 pm"],
      ["Period 4", "2:50 pm - 4:00 pm"]
    ],
    Wednesday: "Tuesday",
    Thursday: "Tuesday",
    Friday: [
      ["Period 1", "9:15 am - 10:43 am"],
      ["Period 2", "10:48 am - 12:16 pm"],
      ["Lunch", "12:23 pm - 12:53 pm"],
      ["Discovery", "12:59 pm - 1:59 pm"],
      ["Period 3", "2:04 pm - 2:50 pm"],
      ["Period 4", "3:04 pm - 4:00 pm"]
    ]
  }
};

// === Load Schedule ===
const scheduleTable = document.getElementById("schedule-table");
let scheduleForToday = null;

if (forcedSchedule) {
  scheduleForToday = forcedSchedule;
} else {
  scheduleForToday = schedule[weekType][todayName];
  if (typeof scheduleForToday === "string") {
    scheduleForToday = schedule[weekType][scheduleForToday];
  }
}

// Render schedule rows (guard missing table)
if (scheduleTable && Array.isArray(scheduleForToday)) {
  scheduleForToday.forEach(([period, time]) => {
  const row = document.createElement("tr");
  const highlightTerms = ["Advisory", "Tutoring", "Discovery"];
  // Add special schedule-specific terms if a special schedule is active
  const ACTIVE_SCHEDULE = window.ACTIVE_SCHEDULE || { mode: 'AUTO' };
  if (ACTIVE_SCHEDULE.mode && ACTIVE_SCHEDULE.mode !== 'AUTO') {
    const mode = ACTIVE_SCHEDULE.mode.toUpperCase();
    if (mode === 'EVENT') highlightTerms.push('Event');
    if (mode === 'GARDEN') highlightTerms.push('Garden');
    if (mode === 'LONG_ADVISORY') highlightTerms.push('Long Advisory');
  }
  const isHighlighted = highlightTerms.some(term => period.toLowerCase().includes(term.toLowerCase()));
  const periodHTML = isHighlighted ? `<strong>${period}</strong>` : period;
  row.innerHTML = `<td>${periodHTML}</td><td>${time}</td>`;
  scheduleTable.appendChild(row);
  });
}

// === Load Today’s Events ===
loadEvents("today-events", todayName.toLowerCase());

// === Load Upcoming Days ===
// Show only the remaining days this week (no loop/wrap)
const schoolDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const todayIdx = schoolDays.indexOf(todayName);

// If today is a weekday, list only days AFTER today up to Friday
const upcomingDays = todayIdx === -1 ? [] : schoolDays.slice(todayIdx + 1);

// Render upcoming day boxes
const container = document.getElementById("upcoming-days");
if (container) {
  container.innerHTML = ""; // Clear any existing content

  if (upcomingDays.length === 0) {
    // Optional: show a small message on Fridays
    // container.innerHTML = `<div class="no-upcoming">No more school days this week</div>`;
  } else {
    upcomingDays.forEach(day => {
      const column = document.createElement("div");
      column.className = "day-column";
      column.innerHTML = `<h4>${day}</h4><div id="${day.toLowerCase()}-events" class="day-events"></div>`;
      container.appendChild(column);
      loadEvents(`${day.toLowerCase()}-events`, day.toLowerCase());
    });
  }
}

// === Update Week Label Function ===
function updateWeekLabel() {
  const weekLabelElem = document.getElementById('week-label');
  if (!weekLabelElem) return;
  
  // Check current schedule config
  const ACTIVE_SCHEDULE = window.ACTIVE_SCHEDULE || { mode: 'AUTO' };
  
  if (ACTIVE_SCHEDULE.mode === 'AUTO') {
    // Use A/B week
    weekLabelElem.textContent = `${weekType}-WEEK`;
    const weekColor = weekType === 'A' ? '#d9534f' : '#0275d8';
    weekLabelElem.style.backgroundColor = weekColor;
  } else {
    // Use special schedule metadata
    const key = ACTIVE_SCHEDULE.mode.toUpperCase();
    const meta = SCHEDULE_META[key];
    if (meta) {
      weekLabelElem.textContent = meta.label;
      weekLabelElem.style.backgroundColor = meta.color;
    }
  }
}

// Apply week label on initial load
updateWeekLabel();

// === Load Events Helper ===
function loadEvents(targetId, fileName) {
  const url = `./events/${fileName}.txt`; // make path explicitly relative
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`${res.status} ${res.statusText} → ${url}`);
      return res.text();
    })
    .then(text => {
      const box = document.getElementById(targetId);
      if (!box) return;

      // Lock container and insert wrapper
      box.innerHTML = "";
      const wrapper = document.createElement("div");
      wrapper.classList.add("event-html");
      wrapper.innerHTML = text.trim();
      box.appendChild(wrapper);

      // Resize after layout has settled so measurements are accurate
      requestAnimationFrame(() => {
        // If this is a smaller day-events column, use height-based fitter
        if (box.classList.contains('day-events')) {
          fitUpcomingEvents(wrapper, 3, 1.1, 3.0);
        } else {
          // For main today's events box, prefer a slightly larger minimum
          fitTextToContainer(wrapper, 0.9);
        }
      });
    })
    .catch(err => {
      console.error("[Events]", err);
      const box = document.getElementById(targetId);
      if (box) box.textContent = "No events found.";
    });
}


// === TIME-BASED BACKGROUND LOGIC ===
function updateBackgroundColorByTime() {
  const hour = new Date().getHours();
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
  const hour = new Date().getHours();
  const cloudLayer = document.querySelector('.layer5');
  if (!cloudLayer) return;

  if (hour >= 11 && hour < 15) {
    cloudLayer.style.filter = 'brightness(0) invert(1)'; // White
  } else {
    cloudLayer.style.filter = 'none'; // Original color
  }
}

// === RUN ON DOM READY ===
window.addEventListener("DOMContentLoaded", () => {
  updateCloudColor();
  updateBackgroundColorByTime();

  setInterval(() => {
    updateCloudColor();
    updateBackgroundColorByTime();
  }, 600000); // every 10 minutes

  // Preload background images and start animations when ready
  const bgUrls = ['Brush-02.png', 'Skyline-03.png', 'Mountains-04.png', 'Clouds-05.png'];
  let loaded = 0;
  bgUrls.forEach(url => {
    const img = new Image();
    img.onload = () => { loaded += 1; if (loaded === bgUrls.length) document.body.classList.add('bg-ready'); };
    img.onerror = () => { loaded += 1; if (loaded === bgUrls.length) document.body.classList.add('bg-ready'); };
    img.src = url;
  });

  // Start JS-driven seamless background loop once images are preloaded
  const startJsBgLoop = () => {
    document.body.classList.add('js-bg-loop');
    const layers = [
      { el: document.querySelector('.layer2'), speed: 0.015 },
      { el: document.querySelector('.layer3'), speed: 0.008 },
      { el: document.querySelector('.layer4'), speed: 0.004 },
      { el: document.querySelector('.layer5'), speed: 0.01 }
    ].filter(l => l.el);

    // Initialize: set pixel widths and duplicate slides for seamless loop
    layers.forEach(l => {
      const slides = Array.from(l.el.querySelectorAll('.slide'));
      if (slides.length === 0) return;
      const n = slides.length;
      const vw = window.innerWidth;
      slides.forEach(s => { s.style.width = `${vw}px`; });
      l.el.innerHTML = l.el.innerHTML + l.el.innerHTML; // duplicate
      l.el.style.width = `${vw * n * 2}px`;
      l.originalWidth = vw * n;
      l.offset = 0;
    });

    // Animate layers using requestAnimationFrame for smooth looping
    let rafId = null;
    let last = performance.now();
    function loop(now) {
      const dt = Math.min(16.67, now - last); // cap to 60fps for smoother movement
      last = now;
      layers.forEach(l => {
        if (!l.el) return;
        l.offset += l.speed * dt;
        if (l.offset >= l.originalWidth) l.offset -= l.originalWidth;
        l.el.style.transform = `translate3d(${-l.offset}px,0,0)`; // use decimal for smoother rendering
      });
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    // Handle window resize
    window.addEventListener('resize', () => {
      layers.forEach(l => {
        const slides = Array.from(l.el.querySelectorAll('.slide'));
        const n = slides.length / 2 || slides.length;
        const vw = window.innerWidth;
        slides.forEach(s => s.style.width = `${vw}px`);
        l.el.style.width = `${vw * n * 2}px`;
        l.originalWidth = vw * n;
      });
    });
  };

  // Start loop when backgrounds are ready
  if (document.body.classList.contains('bg-ready')) {
    startJsBgLoop();
  } else {
    const ro = new MutationObserver(() => {
      if (document.body.classList.contains('bg-ready')) {
        ro.disconnect();
        startJsBgLoop();
      }
    });
    ro.observe(document.body, { attributes: true });
  }
});

function fitTextToContainer(element, minEm = 1.0) {
  const parent = element.parentElement;
  const start = parseFloat(getComputedStyle(element).fontSize) / 16;
  let size = start;

  if (!Number.isFinite(size) || size <= 0) size = 2;

  element.style.fontSize = `${size}em`;
  element.style.wordBreak = 'break-word';

  while (
    (element.scrollHeight > parent.clientHeight ||
     element.scrollWidth  > parent.clientWidth) &&
    size > minEm
  ) {
    size = Math.max(minEm, +(size - 0.05).toFixed(2));
    element.style.fontSize = `${size}em`;
  }
}

function fitUpcomingEvents(element, targetLines = 3, minEm = 1.1, maxEm = 3.0) {
  const parent = element.parentElement;
  if (!parent) return;

  const parentH = parent.clientHeight || 1;
  const lineH = 1.2;
  let startPx = parentH / (targetLines * lineH);
  let startEm = +(startPx / 16).toFixed(2);

  let size = Math.max(minEm, Math.min(maxEm, startEm));
  element.style.fontSize = `${size}em`;

  while (
    (element.scrollHeight > parent.clientHeight || element.scrollWidth > parent.clientWidth) &&
    size > minEm
  ) {
    size = +(Math.max(minEm, size - 0.05)).toFixed(2);
    element.style.fontSize = `${size}em`;
  }
}
// Update week-string to match week type
const weekStr = document.getElementById('week-string');
if (weekStr) {
  weekStr.textContent = `${weekType}-Week Bell Schedule`;
}

// === NEWS CAROUSEL ===
let carouselData = [];
let carouselIndex = 0;
let carouselTimer = null;
const ATTENDANCE_API = 'https://script.google.com/macros/s/AKfycbzsRddE-AwEbRkcJJn5fj1S2UZ5qXQ1n9-_xyHkjDSUNI-l1bzaYmAuZPakL89PatEN/exec';
let attendanceData = null;
let attendanceRefreshTimer = null;

function initNewsCarousel() {
  const schoolDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const todayIdx = schoolDays.indexOf(todayName);
  
  // Build carousel with: week/schedule info -> future days -> WIC -> SBHC -> attendance -> fade out
  carouselData = [];
  carouselData.push('__SCHEDULE_INFO__'); // Week/schedule type info (first)
  carouselData = carouselData.concat(schoolDays.slice(todayIdx + 1)); // Future days
  carouselData.push('WIC', 'SBHC'); // Add special content files
  carouselData.push('__ATTENDANCE__'); // Attendance dashboard (last before fade)

  if (carouselData.length > 0) {
    loadNextCarouselItem();
  }
}

function buildScheduleInfoSlide() {
  // Determine current schedule type
  let scheduleType;
  let scheduleData;
  
  if (window.ACTIVE_SCHEDULE.mode === 'AUTO') {
    scheduleType = getCurrentWeek();
    scheduleData = window.SCHEDULE_META[scheduleType];
  } else {
    scheduleType = window.ACTIVE_SCHEDULE.mode;
    scheduleData = window.SCHEDULE_META[scheduleType];
  }
  
  if (!scheduleData) {
    return '<p>Schedule info unavailable</p>';
  }
  
  const { label, color } = scheduleData;
  let message = '';
  
  if (scheduleType === 'A') {
    message = 'It\'s <strong>A-WEEK</strong><br/>Follow the A-week bell schedule!';
  } else if (scheduleType === 'B') {
    message = 'It\'s <strong>B-WEEK</strong><br/>Follow the B-week bell schedule!';
  } else if (scheduleType === 'GARDEN') {
    message = 'It\'s Garden day! Join us in the garden at 2:10 and help us celebrate our wonderful garden!';
  } else if (scheduleType === 'LONG_ADVISORY') {
    message = 'Today is a Long Advisory Day. Remember to go to your advisory first thing in the morning!';
  } else if (scheduleType === 'EVENT') {
    message = 'Today we have an event! Please report to the Cafeteria for our special event at 11:36am!';
  } else if (scheduleType === 'DELAYED') {
    message = 'Today we had a Delayed start. Make the most out of this shorter day and try to stay warm!';
  } else {
    message = `Today is <strong>${label}</strong><br/>Have a great day!`;
  }
  
  return `
    <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; padding: 20px; text-align: center;">
      <div style="background-color: ${color}; color: white; padding: 30px 40px; border-radius: 10px; font-size: 2.5em; font-weight: bold; margin-bottom: 20px;">
        ${label}
      </div>
      <div style="font-size: 1.8em; line-height: 1.4;">
        ${message}
      </div>
    </div>
  `;
}

function loadNextCarouselItem() {
  if (carouselData.length === 0) return;
  
  const item = carouselData[carouselIndex];
  
  if (item === '__ATTENDANCE__') {
    displayAttendanceDashboard();
  } else if (item === '__SCHEDULE_INFO__') {
    displayScheduleInfo();
  } else {
    const url = `./events/${item.toLowerCase()}.txt`;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.text();
      })
      .then(text => {
        displayCarouselItem(text);
      })
      .catch(err => {
        console.error("[News Carousel]", err);
        displayCarouselItem(`<p>No events for ${item}</p>`);
      });
  }
}

function displayScheduleInfo() {
  const container = document.getElementById('news-carousel-content');
  
  // Remove previous item
  const previousItem = container.querySelector('.carousel-content');
  if (previousItem) {
    previousItem.classList.remove('active');
    setTimeout(() => {
      if (previousItem.parentNode === container) {
        previousItem.remove();
      }
    }, 1000);
  }
  
  // Create schedule info slide
  const html = buildScheduleInfoSlide();
  const item = document.createElement('div');
  item.classList.add('carousel-content');
  item.innerHTML = html;
  
  // Batch DOM operations
  requestAnimationFrame(() => {
    container.appendChild(item);
    
    // Trigger fade in on next frame
    requestAnimationFrame(() => {
      item.classList.add('active');
    });
  });
  
  // Schedule next item after 6 seconds
  clearTimeout(carouselTimer);
  carouselTimer = setTimeout(() => {
    carouselIndex = (carouselIndex + 1) % carouselData.length;
    
    if (carouselIndex === 0) {
      hideCarouselTemporarily();
    } else {
      loadNextCarouselItem();
    }
  }, 6000);
}

function displayCarouselItem(content) {
  const container = document.getElementById('news-carousel-content');
  
  // Remove previous item more efficiently
  const previousItem = container.querySelector('.carousel-content');
  if (previousItem) {
    previousItem.classList.remove('active');
    setTimeout(() => {
      if (previousItem.parentNode === container) {
        previousItem.remove();
      }
    }, 1000);
  }
  
  // Create new item
  const item = document.createElement('div');
  item.classList.add('carousel-content', 'event-html');
  item.innerHTML = content.trim();
  
  // Use requestAnimationFrame to batch DOM operations
  requestAnimationFrame(() => {
    container.appendChild(item);
    
    // Trigger fade in on next frame
    requestAnimationFrame(() => {
      item.classList.add('active');
      
      // Fit text after transitions settle
      requestAnimationFrame(() => {
        fitTextToContainer(item, 1.3);
      });
    });
  });
  
  // Schedule next item after 6 seconds of display (fade happens during display time)
  clearTimeout(carouselTimer);
  carouselTimer = setTimeout(() => {
    carouselIndex = (carouselIndex + 1) % carouselData.length;
    
    // If we've cycled through all, hide the carousel for 30 seconds before repeating
    if (carouselIndex === 0) {
      hideCarouselTemporarily();
    } else {
      loadNextCarouselItem();
    }
  }, 6000);
}

function hideCarouselTemporarily() {
  const carouselBox = document.querySelector('.news-carousel');
  console.log("[Carousel] Hiding carousel temporarily...", carouselBox);
  
  if (carouselBox) {
    requestAnimationFrame(() => {
      carouselBox.classList.add('hidden');
      console.log("[Carousel] Hidden class added. Classes:", carouselBox.className);
    });
  }
  
  clearInterval(attendanceRefreshTimer);
  
  // After 30 seconds, show it again and start the cycle
  carouselTimer = setTimeout(() => {
    console.log("[Carousel] Showing carousel again...");
    if (carouselBox) {
      requestAnimationFrame(() => {
        carouselBox.classList.remove('hidden');
      });
    }
    carouselIndex = 0;
    loadNextCarouselItem();
  }, 30000);
}

function fetchAttendanceData() {
  return fetch(ATTENDANCE_API)
    .then(res => res.json())
    .then(data => {
      // Get current week's Monday and Friday
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
      const mondayOfThisWeek = new Date(today.setDate(diff));
      mondayOfThisWeek.setHours(0, 0, 0, 0);
      
      const fridayOfThisWeek = new Date(mondayOfThisWeek);
      fridayOfThisWeek.setDate(fridayOfThisWeek.getDate() + 4);
      fridayOfThisWeek.setHours(23, 59, 59, 999);
      
      // Parse attendance records and count by day (current week only)
      const attendanceByDay = {
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0
      };
      
      const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const attendanceSet = new Set(); // Track unique attendees per day to avoid double-counting
      
      if (data.data && Array.isArray(data.data)) {
        data.data.forEach(record => {
          if (record.ts && record.email && record.mark === "I'm Here!") {
            const date = new Date(record.ts);
            
            // Only count if it's within this week
            if (date >= mondayOfThisWeek && date <= fridayOfThisWeek) {
              const dayName = weekDays[date.getDay()];
              
              // Only count if it's a school day
              if (attendanceByDay.hasOwnProperty(dayName)) {
                const dayKey = `${dayName}-${record.email}`;
                if (!attendanceSet.has(dayKey)) {
                  attendanceSet.add(dayKey);
                  attendanceByDay[dayName]++;
                }
              }
            }
          }
        });
      }
      
      attendanceData = attendanceByDay;
      return attendanceByDay;
    })
    .catch(err => {
      console.error("[Attendance]", err);
      return null;
    });
}

function displayAttendanceDashboard() {
  const container = document.getElementById('news-carousel-content');
  
  // Remove previous item
  const previousItem = container.querySelector('.carousel-content');
  if (previousItem) {
    previousItem.classList.remove('active');
    setTimeout(() => {
      if (previousItem.parentNode === container) {
        previousItem.remove();
      }
    }, 1000);
  }
  
  // Fetch initial data and display
  fetchAttendanceData().then(data => {
    if (!data) {
      displayCarouselItem(`<p>Unable to load attendance data</p>`);
      return;
    }
    
    const dashboardHTML = buildAttendanceDashboard(data);
    const item = document.createElement('div');
    item.classList.add('carousel-content', 'attendance-dashboard');
    item.innerHTML = dashboardHTML;
    
    // Batch DOM operations
    requestAnimationFrame(() => {
      container.appendChild(item);
      
      requestAnimationFrame(() => {
        item.classList.add('active');
      });
    });
    
    // Auto-refresh every 5 seconds
    clearInterval(attendanceRefreshTimer);
    attendanceRefreshTimer = setInterval(() => {
      fetchAttendanceData().then(data => {
        if (data && item.parentNode === container) {
          // Use requestAnimationFrame to batch updates
          requestAnimationFrame(() => {
            const updatedHTML = buildAttendanceDashboard(data);
            item.innerHTML = updatedHTML;
          });
        }
      });
    }, 5000);
    
    // Schedule next carousel item after 12 seconds (attendance displays longer)
    clearTimeout(carouselTimer);
    carouselTimer = setTimeout(() => {
      clearInterval(attendanceRefreshTimer);
      carouselIndex = (carouselIndex + 1) % carouselData.length;
      
      if (carouselIndex === 0) {
        hideCarouselTemporarily();
      } else {
        loadNextCarouselItem();
      }
    }, 12000);
  });
}

function buildAttendanceDashboard(data) {
  if (!data) {
    return '<div style="padding: 20px; text-align: center;"><p>Unable to load attendance</p></div>';
  }
  
  const schoolDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  let html = '<div class="attendance-container">';
  
  // Today's attendance
  const todayAttendance = data[todayName] || 0;
  html += `<div class="attendance-today"><span class="label">Today's Attendance:</span> <span class="number">${todayAttendance}</span></div>`;
  
  // Bar chart for the week
  html += '<div class="attendance-chart">';
  const maxAttendance = Math.max(...schoolDays.map(day => data[day] || 0), 1);
  
  schoolDays.forEach(day => {
    const count = data[day] || 0;
    const percentage = (count / maxAttendance) * 100;
    const dayLabel = day.substring(0, 3);
    html += `
      <div class="chart-bar-container">
        <div class="chart-bar-label">${dayLabel}</div>
        <div class="chart-bar-wrapper">
          <div class="chart-bar" style="height: ${percentage}%;"></div>
        </div>
        <div class="chart-bar-value">${count}</div>
      </div>
    `;
  });
  
  html += '</div>';
  
  // Add reminder text below bar chart
  html += '<div style="margin-top: 20px; font-size: 1.3em; color: #555; font-weight: 500; text-align: center;">Scan the QR code above to show that you\'re here!</div>';
  
  html += '</div>';
  return html;
}

// === PUBLIC API: Change Schedule Type ===
// Users can call this function to change the schedule:
// changeSchedule('AUTO') - revert to automatic A/B weeks
// changeSchedule('GARDEN') - switch to Garden Day schedule
// changeSchedule('EVENT') - switch to Event Day schedule
// changeSchedule('LONG_ADVISORY') - switch to Long Advisory schedule
// changeSchedule('DELAYED') - switch to Delayed Start schedule
window.changeSchedule = function(mode) {
  if (window.ACTIVE_SCHEDULE) {
    window.ACTIVE_SCHEDULE.mode = mode;
  } else {
    window.ACTIVE_SCHEDULE = { mode: mode };
  }
  
  // Reload the page to apply changes
  // (This ensures the schedule table is re-rendered)
  location.reload();
};

// Start carousel when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  initNewsCarousel();
});

