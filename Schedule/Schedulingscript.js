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

  // ---- NEW: load availability for ALL tutors for the selected date and show on page
  async function loadAllTutorsAvailability(ymd){
    try {
      const data = await fetchJSON(`${BASE}availability.php?date=${encodeURIComponent(ymd)}`);
      if (data.error) {
        availabilityDisplay.textContent = `⚠️ ${data.error}`;
        return;
      }

      // header
      availabilityDisplay.innerHTML = `<h3>Availability for ${data.date}</h3>`;

      // table
      const table = document.createElement("table");
      table.style.borderCollapse = "collapse";
      table.style.marginTop = "10px";
      table.innerHTML = `
        <tr>
          <th style="border:1px solid #ccc; padding:6px;">Tutor</th>
          <th style="border:1px solid #ccc; padding:6px;">Available Hours</th>
        </tr>
      `;

      // build rows using cached names when available
      (data.tutors || []).forEach(t => {
        const row = document.createElement("tr");
        const meta = tutorMap.get(String(t.tutor_id));
        const label = meta ? `${meta.first_name} ${meta.last_name} (ID ${t.tutor_id})`
                           : `ID ${t.tutor_id}`;
        const hours = (t.hours && t.hours.length) ? t.hours.join(", ") : "—";
        row.innerHTML = `
          <td style="border:1px solid #ccc; padding:6px;">${label}</td>
          <td style="border:1px solid #ccc; padding:6px;">${hours}</td>
        `;
        table.appendChild(row);
      });

      availabilityDisplay.appendChild(table);
      dbg("All-tutor availability loaded.");
    } catch (err) {
      availabilityDisplay.textContent = " Failed to load availability.";
      dbg("Avail-all error:", err.message);
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
  if (dateInput && !dateInput.value) dateInput.value = todayISO();
  const firstDate = selectedDate();
  dbg("Page loaded → date:", firstDate, "→ calling rank.php + availability.php…");
  loadRankedTutors();
  loadAllTutorsAvailability(firstDate);
});
