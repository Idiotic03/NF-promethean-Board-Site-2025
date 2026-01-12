// === GLOBAL CONFIGURATION ===

// Determine current week type (A or B) based on start date
function getCurrentWeek() {
  const startDate = new Date("2026-01-12"); // Set your first A-week Monday here
  const now = new Date();
  const diffInDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  const weeksPassed = Math.floor(diffInDays / 7);
  return weeksPassed % 2 === 0 ? "A" : "B";
}

// === SPECIAL SCHEDULES ===
// Edit schedules here to customize periods and times for special days
window.SPECIAL_SCHEDULES = {
  EVENT: {
    default: [
      ["Period 1", "9:15 am - 10:21 am"],
      ["Period 2", "10:26 am - 11:31 am"],
      ["Event", "11:36 am - 12:16 pm"],
      ["Lunch", "12:23 pm - 12:53 pm"],
      ["Period 3", "12:59 pm - 2:27 pm"],
      ["Period 4", "2:32 pm - 4:00 pm"]
    ]
  },

  GARDEN: {
    default: [
      ["Period 1", "9:15 am - 10:43 am"],
      ["Period 2", "10:48 am - 12:16 pm"],
      ["Lunch", "12:23 pm - 12:53 pm"],
      ["Period 3", "12:59 pm - 2:09 pm"],
      ["Garden Event", "2:10 pm - 2:50 pm"],
      ["Period 4", "2:55 pm - 4:00 pm"]
    ]
  },

  LONG_ADVISORY: {
    default: [
      ["Long Advisory", "9:15 am - 9:55 am"],
      ["Period 1", "10:00 am - 11:05 am"],
      ["Period 2", "11:10 am - 12:16 pm"],
      ["Lunch", "12:23 pm - 12:53 pm"],
      ["Period 3", "12:59 pm - 2:27 pm"],
      ["Period 4", "2:32 pm - 4:00 pm"]
    ]
  },

  DELAYED: {
    default: [
      ["Period 1", "11:15 am - 12:13 pm"],
      ["Lunch", "12:20 pm - 12:50 pm"],
      ["Period 2", "12:56 pm - 1:54 pm"],
      ["Period 3", "1:59 pm - 2:57 pm"],
      ["Period 4", "3:02 pm - 4:00 pm"]
    ]
  }
};

// === ACTIVE SCHEDULE ===
// Set mode to 'AUTO' for automatic A/B weeks, or set to a special schedule key
// Special schedules automatically expire at the end of the day
window.ACTIVE_SCHEDULE = {
  mode: 'AUTO' // Options: 'AUTO', 'EVENT', 'GARDEN', 'LONG_ADVISORY', 'DELAYED'
};

// === SCHEDULE METADATA ===
// Defines label text and color for each schedule
window.SCHEDULE_META = {
  A: { label: 'A-WEEK', color: '#d9534f' },
  B: { label: 'B-WEEK', color: '#0275d8' },
  EVENT: { label: 'EVENT DAY', color: '#f39c12' },
  GARDEN: { label: 'Garden Day', color: '#2ecc71' },
  LONG_ADVISORY: { label: 'Long Advisory', color: '#9b59b6' },
  DELAYED: { label: 'Delayed Start', color: '#e67e22' }
};


