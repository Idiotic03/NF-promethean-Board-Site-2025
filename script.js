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
let lastClockUpdate = 0;
let lastDisplayedMinute = -1;
function updateClock() {
  now = new Date();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();
  
  // Only update DOM every minute (not every second) to reduce thrashing
  if (currentMinute !== lastDisplayedMinute) {
    lastDisplayedMinute = currentMinute;
    
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
      // Format time without seconds, with blinking colon
      const hours = now.getHours() % 12 || 12;
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
      timeElem.innerHTML = `${hours}<span class="time-blink">:</span>${minutes} ${ampm}`;
    }
  }

  const newDayIndex = now.getDay();
  if (newDayIndex !== currentDayIndex) {
    location.reload();
  }
}
setInterval(updateClock, 5000); // Update every 5 seconds (includes minute check)
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
      if (!box || !document.body.contains(box)) {
        console.warn("[Events] Target box not found or removed from DOM:", targetId);
        return;
      }

      // Lock container and insert wrapper
      box.innerHTML = "";
      const wrapper = document.createElement("div");
      wrapper.classList.add("event-html");
      wrapper.innerHTML = text.trim();
      box.appendChild(wrapper);

      // Resize after layout has settled so measurements are accurate
      requestAnimationFrame(() => {
        // Double-check elements still exist
        if (!box || !document.body.contains(box) || !document.body.contains(wrapper)) {
          return;
        }
        
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
      if (box && document.body.contains(box)) {
        box.innerHTML = "<div class='event-html'><p>No events available</p></div>";
      }
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
let bgColorInterval = null;
window.addEventListener("DOMContentLoaded", () => {
  updateCloudColor();
  updateBackgroundColorByTime();

  bgColorInterval = setInterval(() => {
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
  let bgLoopRafId = null;
  let resizeHandler = null;
  const startJsBgLoop = () => {
    document.body.classList.add('js-bg-loop');
    const layers = [
      { el: document.querySelector('.layer2'), speed: 0.015 },
      { el: document.querySelector('.layer3'), speed: 0.008 },
      { el: document.querySelector('.layer4'), speed: 0.004 },
      { el: document.querySelector('.layer5'), speed: 0.01 }
    ].filter(l => l.el);

    if (layers.length === 0) return;

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
    let last = performance.now();
    function loop(now) {
      const dt = Math.min(16.67, now - last);
      last = now;
      layers.forEach(l => {
        if (!l.el) return;
        l.offset += l.speed * dt;
        if (l.offset >= l.originalWidth) l.offset -= l.originalWidth;
        l.el.style.transform = `translate3d(${-l.offset}px,0,0)`;
      });
      bgLoopRafId = requestAnimationFrame(loop);
    }
    bgLoopRafId = requestAnimationFrame(loop);

    // Handle window resize (cleanup-aware version)
    resizeHandler = () => {
      layers.forEach(l => {
        const slides = Array.from(l.el.querySelectorAll('.slide'));
        const n = slides.length / 2 || slides.length;
        const vw = window.innerWidth;
        slides.forEach(s => s.style.width = `${vw}px`);
        l.el.style.width = `${vw * n * 2}px`;
        l.originalWidth = vw * n;
      });
    };
    window.addEventListener('resize', resizeHandler);
    
    // Store cleanup function for potential future use
    window.cleanupBgAnimation = () => {
      if (bgLoopRafId) cancelAnimationFrame(bgLoopRafId);
      if (resizeHandler) window.removeEventListener('resize', resizeHandler);
    };
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
  // Safety check: ensure element exists and is in DOM
  if (!element || !document.body.contains(element)) {
    console.warn("[fitText] Element not found or not in DOM", element);
    return;
  }
  
  const parent = element.parentElement;
  if (!parent) {
    console.warn("[fitText] Parent element not found");
    return;
  }
  
  const start = parseFloat(getComputedStyle(element).fontSize) / 16;
  let size = start;

  if (!Number.isFinite(size) || size <= 0) size = 2;

  element.style.fontSize = `${size}em`;
  element.style.wordBreak = 'break-word';

  // Limit iterations to prevent excessive reflows (max 20 iterations instead of potentially many more)
  let iterations = 0;
  const maxIterations = 15; // Reduced from 20 to prevent excessive DOM thrashing
  while (
    iterations < maxIterations &&
    (element.scrollHeight > parent.clientHeight ||
     element.scrollWidth  > parent.clientWidth) &&
    size > minEm
  ) {
    size = Math.max(minEm, +(size - 0.1).toFixed(2)); // Larger step to avoid excessive iterations
    element.style.fontSize = `${size}em`;
    iterations++;
  }
}

function fitUpcomingEvents(element, targetLines = 3, minEm = 1.1, maxEm = 3.0) {
  // Safety check: ensure element exists and is in DOM
  if (!element || !document.body.contains(element)) {
    console.warn("[fitUpcoming] Element not found or not in DOM", element);
    return;
  }
  
  const parent = element.parentElement;
  if (!parent) {
    console.warn("[fitUpcoming] Parent element not found");
    return;
  }

  const parentH = parent.clientHeight || 1;
  const lineH = 1.2;
  let startPx = parentH / (targetLines * lineH);
  let startEm = +(startPx / 16).toFixed(2);

  let size = Math.max(minEm, Math.min(maxEm, startEm));
  element.style.fontSize = `${size}em`;

  // Limit iterations to prevent excessive reflows (max 20 iterations)
  let iterations = 0;
  const maxIterations = 15; // Reduced from 20 to prevent excessive DOM thrashing
  while (
    iterations < maxIterations &&
    (element.scrollHeight > parent.clientHeight || element.scrollWidth > parent.clientWidth) &&
    size > minEm
  ) {
    size = +(Math.max(minEm, size - 0.1)).toFixed(2); // Larger step to avoid excessive iterations
    element.style.fontSize = `${size}em`;
    iterations++;
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
let carouselContentCache = {}; // Cache fetched event content to avoid repeated requests

function initNewsCarousel() {
  const schoolDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const todayIdx = schoolDays.indexOf(todayName);
  
  // Build carousel with: future days -> WIC -> SBHC
  carouselData = [];
  if (todayIdx >= 0) {
    carouselData = carouselData.concat(schoolDays.slice(todayIdx + 1)); // Future days
  }
  carouselData.push('WIC', 'SBHC'); // Add special content files

  console.log("[News Carousel] Initialized with items:", carouselData);

  if (carouselData.length > 0) {
    // Add small delay to ensure DOM is fully ready
    setTimeout(() => {
      if (document.body.contains(document.getElementById('news-carousel-content'))) {
        loadNextCarouselItem();
      }
    }, 100);
  }
}

function loadNextCarouselItem() {
  if (carouselData.length === 0) {
    console.warn("[News Carousel] No carousel data available");
    return;
  }
  
  if (carouselIndex >= carouselData.length) {
    carouselIndex = 0; // Safety reset if index is out of bounds
  }
  
  const item = carouselData[carouselIndex];
  const cacheKey = item.toLowerCase();
  
  // Check cache first
  if (carouselContentCache[cacheKey] !== undefined) {
    displayCarouselItem(carouselContentCache[cacheKey]);
    return;
  }
  
  const url = `./events/${cacheKey}.txt`;
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return res.text();
    })
    .then(text => {
      // Cache the content before displaying
      carouselContentCache[cacheKey] = text;
      displayCarouselItem(text);
    })
    .catch(err => {
      console.error("[News Carousel] Error loading", cacheKey, ":", err);
      const errorMsg = `<p style="color: #999;">No events for ${item}</p>`;
      carouselContentCache[cacheKey] = errorMsg;
      displayCarouselItem(errorMsg);
    });
}

function displayCarouselItem(content) {
  const container = document.getElementById('news-carousel-content');
  if (!container) {
    console.error("[News Carousel] Container not found");
    return;
  }
  
  // Aggressively clean up ALL previous items immediately
  const allPreviousItems = container.querySelectorAll('.carousel-content');
  allPreviousItems.forEach(item => {
    item.remove();
  });
  
  // Create new item
  const item = document.createElement('div');
  item.classList.add('carousel-content', 'event-html');
  item.innerHTML = content.trim();
  
  // Use requestAnimationFrame to batch DOM operations
  requestAnimationFrame(() => {
    // Double-check container still exists
    if (!document.body.contains(container)) {
      console.error("[News Carousel] Container was removed from DOM");
      return;
    }
    
    container.appendChild(item);
    
    // Trigger fade in on next frame
    requestAnimationFrame(() => {
      if (document.body.contains(item)) {
        item.classList.add('active');
        
        // Fit text after transitions settle
        requestAnimationFrame(() => {
          if (document.body.contains(item)) {
            fitTextToContainer(item, 1.3);
          }
        });
      }
    });
  });
  
  // Schedule next item after 8 seconds of display
  clearTimeout(carouselTimer);
  carouselTimer = setTimeout(() => {
    carouselIndex = (carouselIndex + 1) % carouselData.length;
    
    // If we've cycled through all, fade out then hide the carousel for 30 seconds before repeating
    if (carouselIndex === 0) {
      // Fade out the current item
      if (document.body.contains(item)) {
        item.classList.remove('active');
      }
      // After fade completes, hide carousel
      setTimeout(() => {
        hideCarouselTemporarily();
      }, 1000);
    } else {
      loadNextCarouselItem();
    }
  }, 8000);
}

function hideCarouselTemporarily() {
  const carouselBox = document.querySelector('.news-carousel');
  if (!carouselBox || !document.body.contains(carouselBox)) {
    console.warn("[Carousel] Carousel box not found or removed from DOM");
    return;
  }
  
  console.log("[Carousel] Hiding carousel temporarily...");
  
  requestAnimationFrame(() => {
    if (document.body.contains(carouselBox)) {
      carouselBox.classList.add('hidden');
    }
  });
  
  // After 30 seconds, show it again and start the cycle
  carouselTimer = setTimeout(() => {
    console.log("[Carousel] Showing carousel again...");
    if (document.body.contains(carouselBox)) {
      requestAnimationFrame(() => {
        carouselBox.classList.remove('hidden');
      });
    }
    carouselIndex = 0;
    loadNextCarouselItem();
  }, 30000);
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
  applyWeekLabel();
  
  // === AUTO-RELOAD SAFETY NET ===
  // Automatically reload the page every 5 minutes to prevent stale state/memory issues
  console.log("[Health] Auto-reload safety net: page will refresh every 5 minutes");
  setInterval(() => {
    console.log("[Health] Triggering auto-reload to maintain stability");
    location.reload();
  }, 5 * 60 * 1000); // 5 minutes in milliseconds
});

// A/B Week label application function (moved from index.html)
function applyWeekLabel() {
  const label = document.getElementById("week-label");
  const weekStr = document.getElementById("week-string");
  if (!label) return;

  const ACTIVE_SCHEDULE = window.ACTIVE_SCHEDULE || { mode: 'AUTO' };
  const SCHEDULE_META = window.SCHEDULE_META || {};

  // If a special schedule was set, it only applies for a single day.
  const todayKey = new Date().toISOString().slice(0,10);
  const stored = (() => { try { return localStorage.getItem('specialScheduleDate'); } catch(e) { return null; } })();

  // If ACTIVE_SCHEDULE.mode is AUTO (or special expired), show A/B week label
  if (!ACTIVE_SCHEDULE.mode || ACTIVE_SCHEDULE.mode === 'AUTO' || (stored && stored !== todayKey)) {
    const currentWeek = getCurrentWeek(); // "A" or "B"
    if (currentWeek === "A") {
      label.textContent = SCHEDULE_META.A?.label || 'A-WEEK';
      label.classList.add("a-week");
      label.classList.remove("b-week");
    } else {
      label.textContent = SCHEDULE_META.B?.label || 'B-WEEK';
      label.classList.add("b-week");
      label.classList.remove("a-week");
    }

    if (weekStr) {
      weekStr.textContent = `${currentWeek}-Week Bell Schedule`;
    }
    return;
  }

  // Otherwise, a special schedule key is active today — apply its meta
  const key = ACTIVE_SCHEDULE.mode.toUpperCase();
  const meta = SCHEDULE_META[key] || {};
  label.textContent = ACTIVE_SCHEDULE.weekLabelText || meta.label || key;
  label.style.backgroundColor = ACTIVE_SCHEDULE.weekLabelColor || meta.color || '';
  if (weekStr) weekStr.textContent = `${label.textContent} Bell Schedule`;
}

