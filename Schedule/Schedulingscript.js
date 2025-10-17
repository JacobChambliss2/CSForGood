const BASE = ""; // same-origin with your PHP server

// simple on-page logger so you can see what’s happening without DevTools
function dbg(...args){
  const el = document.getElementById("debug");
  if (!el) return;
  el.textContent += args.map(a => (typeof a==='string'? a : JSON.stringify(a))).join(' ') + "\n";
}

async function fetchJSON(url, options){
  dbg("FETCH", url);
  const res = await fetch(url, options);
  const text = await res.text();
  dbg("RESP", url, "status", res.status, "body:", text.slice(0,200));
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Non-JSON from " + url + ": " + text.slice(0,200));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const tutorList      = document.getElementById("tutorList");
  const dateInput      = document.getElementById("start");
  const bookingModal   = document.getElementById("bookingModal");
  const modalTutorName = document.getElementById("modalTutorName");
  const closeBtn       = document.querySelector(".close");
  const availabilityDisplay = document.getElementById("availabilityDisplay");

  // tag hours (0..23)
  document.querySelectorAll(".hours li").forEach((li, idx) => li.dataset.hour = idx);

  // helpers
  const todayISO = () => new Date().toISOString().slice(0,10);
  const selectedDate = () => (dateInput && dateInput.value) ? dateInput.value : todayISO();

  function clearAvailability(){
    document.querySelectorAll(".hours li").forEach(li => li.classList.remove("available"));
  }
  function renderAvailability(hours){
    clearAvailability();
    (hours||[]).forEach(h => {
      const li = document.querySelector(`.hours li[data-hour="${h}"]`);
      if (li) li.classList.add("available");
    });
  }

  // cache tutors so we can show names next to availability
  const tutorMap = new Map(); // id -> {first_name,last_name}

  function renderRankedTutors(rows){
    tutorList.innerHTML = "";
    (rows||[]).forEach(t => {
      tutorMap.set(String(t.id), { first_name: t.first_name, last_name: t.last_name });
      const li = document.createElement("li");
      li.textContent = `${t.first_name} ${t.last_name}`;
      li.dataset.tutorId = t.id;
      tutorList.appendChild(li);
    });
    dbg("Rendered tutors:", (rows||[]).length);
  }

  async function loadRankedTutors(){
    try {
      const data = await fetchJSON(`${BASE}rank.php`);
      renderRankedTutors(data);
    } catch (err) {
      dbg("Rank error:", err.message);
      tutorList.innerHTML = "<li>Could not load tutors</li>";
    }
  }

  async function loadAvailability(tutorId, ymd){
    try {
      const data = await fetchJSON(`${BASE}availability.php?tutor_id=${encodeURIComponent(tutorId)}&date=${encodeURIComponent(ymd)}`);
      renderAvailability(data.hours || []);
    } catch (err) {
      dbg("Avail error:", err.message);
      clearAvailability();
    }
  }

// ========= NEW: Availability Grid helpers =========

// Make a 0..23 hour label
function hourLabel(h){
  const ampm = h === 0 ? "12:00am"
            : h < 12 ? `${h}:00am`
            : h === 12 ? "12:00pm"
            : `${h-12}:00pm`;
  return ampm;
}

const gridHost = document.getElementById("availabilityGrid");
let gridState = {
  tutorCols: [],          // array of {id, label}
  indexByTutorId: new Map() // tutor_id -> column index (starting at 0 for first tutor col)
};

// Build an empty grid (header + hour rows, blank cells)
function buildAvailabilityGrid(tutors){
  // map tutors to {id,label}
  const tutorCols = (tutors||[]).map(t => ({
    id: String(t.id),
    label: `${t.first_name} ${t.last_name}`.trim() || `Tutor ${t.id}`
  }));
  gridState.tutorCols = tutorCols;
  gridState.indexByTutorId = new Map(tutorCols.map((t,i)=>[t.id, i]));

  // (Re)build table
  gridHost.innerHTML = "";
  const table = document.createElement("table");
  table.id = "availTable";
  table.style.borderCollapse = "collapse";
  table.style.minWidth = "700px";

  // tiny helper for cells
  const styleCell = (el, isHeader=false) => {
    el.style.border = "1px solid #ccc";
    el.style.padding = "6px 10px";
    if (isHeader) el.style.fontWeight = "600";
    return el;
  };

  // THEAD
  const thead = document.createElement("thead");
  const htr = document.createElement("tr");

  // top-left corner
  htr.appendChild(styleCell(document.createElement("th"), true)).textContent = "Hour";

  // tutor headers
  tutorCols.forEach(t => {
    const th = styleCell(document.createElement("th"), true);
    th.textContent = t.label;
    th.setAttribute("data-tutor-id", t.id);
    htr.appendChild(th);
  });
  thead.appendChild(htr);
  table.appendChild(thead);

  // TBODY with 24 hour rows
  const tbody = document.createElement("tbody");
  for (let h = 0; h < 24; h++){
    const tr = document.createElement("tr");

    // hour label (frozen left)
    const th = styleCell(document.createElement("th"), true);
    th.textContent = hourLabel(h);
    tr.appendChild(th);

    // one cell per tutor; we key cells by tutorId-hour for fast lookup later
    tutorCols.forEach(t => {
      const td = styleCell(document.createElement("td"));
      td.setAttribute("data-cell", `${t.id}-${h}`);
      // default style is empty; you’ll style .available later
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  }
  table.appendChild(tbody);

  // simple legend (optional)
  const legend = document.createElement("div");
  legend.style.margin = "8px 0 0 0";
  legend.innerHTML = `
    <span style="display:inline-block;width:14px;height:14px;border:1px solid #ccc;vertical-align:middle;margin-right:6px;"></span>
    Unavailable
    &nbsp;&nbsp;&nbsp;
    <span class="available" style="display:inline-block;width:14px;height:14px;border:1px solid #ccc;vertical-align:middle;margin:0 6px;background:#c7f7c7;"></span>
    Available
  `;

  gridHost.appendChild(table);
  gridHost.appendChild(legend);
}

// Clear all green cells
function clearGridAvailability(){
  const cells = gridHost.querySelectorAll('[data-cell].available');
  cells.forEach(td => td.classList.remove("available"));
}

// Mark a specific tutor/hour cell as available
function markCellAvailable(tutorId, hour){
  const td = gridHost.querySelector(`[data-cell="${tutorId}-${hour}"]`);
  if (td) td.classList.add("available");
}

// ========= REPLACE: loadAllTutorsAvailability with this =========
async function loadAllTutorsAvailability(ymd){
  try {
    // fetch all tutors’ availability for the chosen date
    const data = await fetchJSON(`${BASE}availability.php?date=${encodeURIComponent(ymd)}`);

    if (!data || data.error){
      dbg("Avail-all error:", data && data.error);
      clearGridAvailability();
      return;
    }

    // clear all old green cells
    clearGridAvailability();

    // fill green cells
    (data.tutors || []).forEach(t => {
      const tutorId = String(t.tutor_id);
      const hours = Array.isArray(t.hours) ? t.hours : [];
      hours.forEach(h => {
        const hour = parseInt(h, 10);
        if (!Number.isNaN(hour)) markCellAvailable(tutorId, hour);
      });
    });

    dbg("All-tutor availability painted for", ymd);
  } catch (err) {
    dbg("Avail-all fetch error:", err.message);
    clearGridAvailability();
  }
}


  let lastTutorId = null;

  tutorList.addEventListener("click", (e) => {
    const li = e.target.closest("li"); if (!li) return;
    lastTutorId = li.dataset.tutorId;
    modalTutorName.textContent = `Book a time with ${li.textContent}`;
    bookingModal.style.display = "block";
    const ymd = selectedDate();
    loadAvailability(lastTutorId, ymd);
  });

  dateInput.addEventListener("change", () => {
    const ymd = selectedDate();
    // refresh the all-tutors table for the newly chosen date
    loadAllTutorsAvailability(ymd);
    // if a tutor modal is open/selected, refresh their hour highlights too
    if (lastTutorId) loadAvailability(lastTutorId, ymd);
  });

  if (closeBtn) closeBtn.addEventListener("click", () => bookingModal.style.display = "none");

  // ---- bootstrap: ensure date input has a value (fallback to today), then load both
  (async function init(){
    if (dateInput && !dateInput.value) dateInput.value = todayISO();
    const firstDate = selectedDate();
    dbg("Page loaded → date:", firstDate, "→ calling rank.php + availability.php…");

    // load tutors first so we can build the columns
    const tutors = await (async () => {
      try {
        const data = await fetchJSON(`${BASE}rank.php`);
        renderRankedTutors(data);   // your existing function (kept)
        return data;
      } catch (err) {
        dbg("Rank error:", err.message);
        tutorList.innerHTML = "<li>Could not load tutors</li>";
        return [];
      }
    })();

    // build the empty grid from the ranked tutors
    buildAvailabilityGrid(tutors);

    // now paint the availability for the chosen date
    await loadAllTutorsAvailability(firstDate);
  })();

});
