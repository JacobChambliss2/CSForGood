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

  // tag hours
  document.querySelectorAll(".hours li").forEach((li, idx) => li.dataset.hour = idx);

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

  function renderRankedTutors(rows){
    tutorList.innerHTML = "";
    (rows||[]).forEach(t => {
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

  // ✅ NEW: automatically load today's availability for all tutors
  async function loadTodayAvailabilityAllTutors() {
    try {
      const data = await fetchJSON(`${BASE}availability.php`);
      if (data.error) {
        availabilityDisplay.textContent = ` ${data.error}`;
        return;
      }
      availabilityDisplay.innerHTML = `<h3>Today's Availability (${data.date})</h3>`;

      const table = document.createElement("table");
      table.style.borderCollapse = "collapse";
      table.style.marginTop = "10px";
      table.innerHTML = `
        <tr>
          <th style="border:1px solid #ccc; padding:6px;">Tutor ID</th>
          <th style="border:1px solid #ccc; padding:6px;">Available Hours</th>
        </tr>
      `;

      (data.tutors || []).forEach(t => {
        const row = document.createElement("tr");
        const hours = t.hours && t.hours.length ? t.hours.join(", ") : "—";
        row.innerHTML = `
          <td style="border:1px solid #ccc; padding:6px;">${t.tutor_id}</td>
          <td style="border:1px solid #ccc; padding:6px;">${hours}</td>
        `;
        table.appendChild(row);
      });

      availabilityDisplay.appendChild(table);
      dbg("Loaded today's availability:", data);
    } catch (err) {
      availabilityDisplay.textContent = " Failed to load today's availability.";
      dbg("Avail-all error:", err.message);
    }
  }

  let lastTutorId = null;

  tutorList.addEventListener("click", (e) => {
    const li = e.target.closest("li"); if (!li) return;
    lastTutorId = li.dataset.tutorId;
    modalTutorName.textContent = `Book a time with ${li.textContent}`;
    bookingModal.style.display = "block";
    if (dateInput && dateInput.value) loadAvailability(lastTutorId, dateInput.value);
    else clearAvailability();
  });

  dateInput.addEventListener("change", () => {
    if (lastTutorId && dateInput.value) loadAvailability(lastTutorId, dateInput.value);
  });

  if (closeBtn) closeBtn.addEventListener("click", () => bookingModal.style.display = "none");

  // kick off both ranking and today's availability
  dbg("Page loaded, calling rank.php and availability.php…");
  loadRankedTutors();
  loadTodayAvailabilityAllTutors();
});
