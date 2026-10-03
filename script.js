(function () {
  "use strict";

  var HABITS = [
    { id: "protein", label: "Protein at every meal", target: 7, goal: "Goal: every day" },
    { id: "calcium", label: "Two or three calcium foods", target: 7, goal: "Goal: every day" },
    { id: "vitc", label: "A vitamin C fruit or vegetable", target: 7, goal: "Goal: every day" },
    { id: "fish", label: "Fish", target: 2, goal: "Goal: 2 times a week" },
    { id: "ironzinc", label: "Iron and zinc foods", target: 3, goal: "Goal: 3 times a week" }
  ];
  var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var STORAGE_KEY = "dt-growth-tracker-v1";

  // Monday of the current week, as YYYY-MM-DD, so checks reset each new week.
  function weekId() {
    var d = new Date();
    var offset = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - offset);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function emptyState() {
    var checks = {};
    HABITS.forEach(function (h) { checks[h.id] = [false, false, false, false, false, false, false]; });
    return { week: weekId(), checks: checks };
  }

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && saved.week === weekId() && saved.checks) {
        var state = emptyState();
        HABITS.forEach(function (h) {
          if (Array.isArray(saved.checks[h.id]) && saved.checks[h.id].length === 7) {
            state.checks[h.id] = saved.checks[h.id].map(Boolean);
          }
        });
        return state;
      }
    } catch (e) { /* storage unavailable or invalid: start fresh */ }
    return emptyState();
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  var state = load();
  var tbody = document.querySelector("#tracker tbody");
  var summary = document.getElementById("summary");

  function countFor(id) {
    return state.checks[id].filter(Boolean).length;
  }

  function renderCount(habit) {
    var cell = document.getElementById("count-" + habit.id);
    var n = countFor(habit.id);
    cell.textContent = n + "/" + habit.target;
    cell.classList.toggle("met", n >= habit.target);
  }

  function renderSummary() {
    var met = HABITS.filter(function (h) { return countFor(h.id) >= h.target; }).length;
    summary.textContent = met + " of " + HABITS.length + " habits on target";
  }

  function build() {
    tbody.innerHTML = "";
    HABITS.forEach(function (habit) {
      var tr = document.createElement("tr");

      var th = document.createElement("th");
      th.scope = "row";
      th.textContent = habit.label;
      var goal = document.createElement("span");
      goal.className = "goal";
      goal.textContent = habit.goal;
      th.appendChild(goal);
      tr.appendChild(th);

      DAYS.forEach(function (day, i) {
        var td = document.createElement("td");
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "day";
        btn.textContent = "\u2713";
        btn.setAttribute("aria-label", habit.label + ", " + day);
        btn.setAttribute("aria-pressed", String(state.checks[habit.id][i]));
        btn.addEventListener("click", function () {
          state.checks[habit.id][i] = !state.checks[habit.id][i];
          btn.setAttribute("aria-pressed", String(state.checks[habit.id][i]));
          save();
          renderCount(habit);
          renderSummary();
        });
        td.appendChild(btn);
        tr.appendChild(td);
      });

      var countCell = document.createElement("td");
      countCell.className = "count";
      countCell.id = "count-" + habit.id;
      tr.appendChild(countCell);

      tbody.appendChild(tr);
      renderCount(habit);
    });
    renderSummary();
  }

  document.getElementById("reset").addEventListener("click", function () {
    state = emptyState();
    save();
    build();
  });

  build();
})();
