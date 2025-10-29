const BASE = ""; // same-origin with your PHP server
const TOGGLE_URL = `${BASE}toggle_availability.php`;

// ---- MOCK TOGGLE ----
const MOCK = false; // set to false to hit real PHP endpoints

// ---- FAKE DATA ----
const MOCK_DATA = {
  tutors: [
    { id: 1, first_name: "Alice", last_name: "Nguyen" },
    { id: 2, first_name: "Ben",   last_name: "Patel"  },
    { id: 3, first_name: "Chloe", last_name: "Smith"  },
    { id: 4, first_name: "Diego", last_name: "Gomez"  },
    { id: 5, first_name: "John", last_name: "Pork"  }
  ],
  // Availability by date → tutorId → hours[]
  availabilityByDate: {
    [new Date().toISOString().slice(0,10)]: {
      1: [9,10,11,14,15],
      2: [13,14,15,16,17,18],
      3: [8,9,10,18,19],
      4: [12,13,17,20]
    },
    "2025-10-20": {
      1: [8,9,10,11],
      2: [15,16,17,18,19],
      3: [12,13,14],
      4: [9,10,11,12,13,14]
    }
  },
  // fallback if date not present
  defaultHours: { 1:[9,10,11], 2:[14,15,16], 3:[8,9], 4:[12,13,14] }
};

// Generate response objects identical to your real PHP output
function mockResponse(url){
  const u = new URL(url, location.href);
  const path = u.pathname.toLowerCase();

  if (path.endsWith("rank.php")){
    return MOCK_DATA.tutors.slice();
  }

  if (path.endsWith("availability.php")){
    const date = u.searchParams.get("date");
    const tutorId = u.searchParams.get("tutor_id");
    const dayMap = (date && MOCK_DATA.availabilityByDate[date]) || null;

    if (tutorId){
      const hours = (dayMap && dayMap[tutorId]) ||
                    MOCK_DATA.defaultHours[tutorId] ||
                    [];
      return { hours: hours.slice() };
    }

    const source = dayMap || MOCK_DATA.defaultHours;
    const rows = MOCK_DATA.tutors.map(t => ({
      tutor_id: t.id,
      hours: (source[t.id] || []).slice()
    }));
    return { tutors: rows };
  }

  return {};
}


// simple on-page logger so you can see what’s happening without DevTools
function dbg(...args){
  const el = document.getElementById("debug");
  if (!el) return;
  el.textContent += args.map(a => (typeof a==='string'? a : JSON.stringify(a))).join(' ') + "\n";
}

async function fetchJSON(url, options){
  // Serve from mock instantly if MOCK is on
  if (MOCK){
    const data = mockResponse(url);
    dbg("MOCK RESP", url, JSON.stringify(data).slice(0,200));
    // simple deep copy to mimic fetch JSON
    return JSON.parse(JSON.stringify(data));
  }

  // Otherwise, hit the real server; if it fails, fall back to mock
  dbg("FETCH", url);
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    dbg("RESP", url, "status", res.status, "body:", text.slice(0,200));
    if (!res.ok) throw new Error("HTTP " + res.status);
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("Non-JSON from " + url + ": " + text.slice(0,200));
    }
  } catch (e){
    dbg("FETCH FAIL → using MOCK for", url, "reason:", e.message);
    const data = mockResponse(url);
    return JSON.parse(JSON.stringify(data));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const tutorList      = document.getElementById("tutorList");
  const dateInput      = document.getElementById("start");
  const bookingModal   = document.getElementById("bookingModal");
  const modalTutorName = document.getElementById("modalTutorName");
  const closeBtn       = document.querySelector(".close");
  const availabilityDisplay = document.getElementById("availabilityDisplay");

  // Confirm UI (optional: guards if you haven't added the HTML yet)
  const confirmBar        = document.getElementById('confirmBar');
  const confirmBtn        = document.getElementById('confirmBtn');
  const confirmModal      = document.getElementById('confirmModal');
  const closeConfirmModal = document.getElementById('closeConfirmModal');
  const cancelConfirm     = document.getElementById('cancelConfirm');
  const submitConfirm     = document.getElementById('submitConfirm');
  const confirmList       = document.getElementById('confirmList');
  const confirmDateEl     = document.getElementById('confirmDate');

  const FAKE_CONFIRM = true; // set false when you wire a PHP endpoint

  // tag hours (0..23) if that left rail exists on your page
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
      tutorMap.set(String(t.id), {
        first_name: t.first_name,
        last_name: t.last_name,
        favorited: !!t.favorited
      });
  
      const li = document.createElement("li");
      li.dataset.tutorId = t.id;
  
      // star + name
      const star = document.createElement("span");
      star.className = "fav-star";
      star.textContent = t.favorited ? "★" : "☆"; // filled or outline
      star.setAttribute("aria-label", t.favorited ? "Favorited" : "Not favorited");
  
      const name = document.createElement("span");
      name.textContent = ` ${t.first_name} ${t.last_name}`;
  
      li.appendChild(star);
      li.appendChild(name);
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

  // ========= Availability Grid helpers =========
  function hourLabel(h) {
    const hour12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
    const ampm = h < 12 ? "am" : "pm";
    return `${hour12}:00${ampm}`;
  }

  const gridHost = document.getElementById("availabilityGrid");
  let gridState = {
    tutorCols: [],
    indexByTutorId: new Map()
  };

  function buildAvailabilityGrid(tutors){
    const tutorCols = (tutors||[]).map(t => ({ id: String(t.id) }));
    gridState.tutorCols = tutorCols;
    gridState.indexByTutorId = new Map(tutorCols.map((t,i)=>[t.id, i]));

    gridHost.innerHTML = "";
    const table = document.createElement("table");
    table.id = "availTable";
    table.style.borderCollapse = "collapse";
    table.style.minWidth = "100%";
    table.style.tableLayout = "fixed";
    table.style.marginTop = "0";

    const styleCell = (el, isHeader=false) => {
      el.style.border = "1px solid #ccc";
      el.style.padding = "6px 10px";
      if (isHeader) el.style.fontWeight = "600";
      return el;
    };

    const tbody = document.createElement("tbody");
    for (let h = 8; h <= 20; h++){
      const tr = document.createElement("tr");

      const th = styleCell(document.createElement("th"), true);
      th.textContent = hourLabel(h);
      th.style.width = "90px";
      th.style.textAlign = "left";
      tr.appendChild(th);

      tutorCols.forEach(t => {
        const td = styleCell(document.createElement("td"));
        td.setAttribute("data-cell", `${t.id}-${h}`);
        td.style.width = `${100 / tutorCols.length}%`;
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    }
    table.appendChild(tbody);

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

  function clearGridAvailability(){
    // wipe all state before painting a new date
    gridHost.querySelectorAll('td[data-cell]').forEach(td => {
      td.classList.remove('available', 'selected', 'confirmed');
    });
  }
  
  function markCellAvailable(tutorId, hour){
    const td = gridHost.querySelector(`[data-cell="${tutorId}-${hour}"]`);
    if (td) td.classList.add("available");
  }

  async function loadAllTutorsAvailability(ymd){
    try {
      const data = await fetchJSON(`${BASE}availability.php?date=${encodeURIComponent(ymd)}`);
      if (!data || data.error){
        dbg("Avail-all error:", data && data.error);
        clearGridAvailability();
        return;
      }
      clearGridAvailability();
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

  // ====== Confirm-flow state (local selections) ======
  const pendingSelections = new Map(); // Map<tutorId, Set<hour>>
  function selectionCount(){
    let n = 0; for (const set of pendingSelections.values()) n += set.size; return n;
  }
  function updateConfirmBar(){
    if (!confirmBar || !confirmBtn) return;
    const n = selectionCount();
    confirmBar.style.display = n > 0 ? 'flex' : 'none';
    confirmBtn.textContent = `Confirm ${n} slot(s)`;
  }
  function toggleSelection(tutorId, hour, td){
    if (td.classList.contains('confirmed')) return;
    if (!td.classList.contains('available') && !td.classList.contains('selected')) return;

    let set = pendingSelections.get(tutorId);
    if (!set){ set = new Set(); pendingSelections.set(tutorId, set); }

    if (set.has(hour)){
      set.delete(hour);
      td.classList.remove('selected');
      td.classList.add('available');
      if (set.size === 0) pendingSelections.delete(tutorId);
    } else {
      set.add(hour);
      td.classList.add('selected');
      td.classList.remove('available');
    }
    updateConfirmBar();
  }
  function hourLabelShort(h){
    const hour12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
    const ampm = h < 12 ? "am" : "pm";
    return `${hour12}${ampm}`;
  }
  function buildSelectionSummary(ymd){
    const items = [];
    for (const [tutorId, set] of pendingSelections.entries()){
      const t = tutorMap.get(String(tutorId)) || {first_name:'Tutor', last_name:String(tutorId)};
      const name = `${t.first_name} ${t.last_name}`;
      [...set].sort((a,b)=>a-b).forEach(hour => items.push({ tutorId:Number(tutorId), tutorName:name, date: ymd, hour }));
    }
    items.sort((a,b)=> a.tutorName.localeCompare(b.tutorName) || a.hour - b.hour);
    return items;
  }
  function clearSelectionsUI(){
    gridHost.querySelectorAll('td.selected').forEach(td=>{
      td.classList.remove('selected');
      td.classList.add('available');
    });
    pendingSelections.clear();
    updateConfirmBar();
  }

  let lastTutorId = null;

  tutorList.addEventListener("click", (e) => {
    const li = e.target.closest("li"); if (!li) return;
    lastTutorId = li.dataset.tutorId;
    if (modalTutorName) modalTutorName.textContent = `Book a time with ${li.textContent}`;
    if (bookingModal) bookingModal.style.display = "block";
    const ymd = selectedDate();
    loadAvailability(lastTutorId, ymd);
  });

    dateInput.addEventListener("change", () => {
      clearSelectionsUI(); // NEW
      const ymd = selectedDate();
      loadAllTutorsAvailability(ymd);
      if (lastTutorId) loadAvailability(lastTutorId, ymd);
    });
    

  if (closeBtn) closeBtn.addEventListener("click", () => bookingModal.style.display = "none");

  // Grid click: select/deselect (no DB write here)
  gridHost.addEventListener('click', (e) => {
    const td = e.target.closest('td[data-cell]');
    if (!td) return;

    // ignore truly locked cells
    if (td.classList.contains('confirmed')) return;

    const [tutorId, hourStr] = td.getAttribute('data-cell').split('-');
    const hour = Number(hourStr);
    toggleSelection(String(tutorId), hour, td);
  });

    // open modal and list selections
    confirmBtn.addEventListener('click', () => {
      const ymd = selectedDate();
      const items = buildSelectionSummary(ymd);

      confirmDateEl.textContent = `Date: ${ymd}`;
      confirmList.innerHTML = items.length
        ? items.map(i => `<li>${i.tutorName} — ${hourLabelShort(i.hour)}</li>`).join('')
        : '<li>No selections.</li>';

      confirmModal.style.display = 'block';
    });
    [closeConfirmModal, cancelConfirm].forEach(btn => btn.addEventListener('click', () => {
      confirmModal.style.display = 'none';
    }));

    // submit (fake now; ready for real later)
    submitConfirm.addEventListener('click', async () => {
      const ymd = selectedDate();
      const items = buildSelectionSummary(ymd);
      if (!items.length){ confirmModal.style.display='none'; return; }

      try{
        if (FAKE_CONFIRM){
          await new Promise(r=>setTimeout(r, 250)); // simulate success
        } else {
          const res = await fetch(CONFIRM_URL, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ date: ymd, slots: items })
          });
          const data = await res.json();
          if (!res.ok || data.error) throw new Error(data.error || 'Confirm failed');
        }

        // lock them in UI
        items.forEach(({tutorId, hour})=>{
          const td = gridHost.querySelector(`[data-cell="${tutorId}-${hour}"]`);
          if (!td) return;
          td.classList.remove('selected','available');
          td.classList.add('confirmed'); // visually distinct + locked
        });

        pendingSelections.clear();
        updateConfirmBar();
        confirmModal.style.display = 'none';
        dbg(`Confirmed ${items.length} slot(s) on ${ymd}.`);
      } catch(err){
        dbg('Confirm error:', err.message);
        alert('Could not confirm right now. Please try again.');
      }
    });


  // Confirm modal handlers (no-ops if modal not present)
  if (confirmBtn){
    confirmBtn.addEventListener('click', () => {
      const ymd = selectedDate();
      const items = buildSelectionSummary(ymd);
      if (confirmDateEl) confirmDateEl.textContent = `Date: ${ymd}`;
      if (confirmList) {
        confirmList.innerHTML = items.length
          ? items.map(i => `<li>${i.tutorName} — ${hourLabelShort(i.hour)}</li>`).join('')
          : '<li>No selections.</li>';
      }
      if (confirmModal) confirmModal.style.display = 'block';
    });
  }
  [closeConfirmModal, cancelConfirm].forEach(btn => {
    if (btn) btn.addEventListener('click', () => { if (confirmModal) confirmModal.style.display = 'none'; });
  });
  if (submitConfirm){
    submitConfirm.addEventListener('click', async () => {
      const ymd = selectedDate();
      const items = buildSelectionSummary(ymd);
      if (!items.length){ if (confirmModal) confirmModal.style.display='none'; return; }

      try{
        if (FAKE_CONFIRM){
          await new Promise(r=>setTimeout(r, 250)); // simulate
        } else {
          // wire your PHP here later:
          // await fetch(`${BASE}confirm_appointments.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ date: ymd, slots: items }) });
        }
        // Lock in UI
        items.forEach(({tutorId, hour})=>{
          const td = gridHost.querySelector(`[data-cell="${tutorId}-${hour}"]`);
          if (!td) return;
          td.classList.remove('selected','available');
          td.classList.add('confirmed');
        });
        pendingSelections.clear();
        updateConfirmBar();
        if (confirmModal) confirmModal.style.display = 'none';
        dbg(`Confirmed ${items.length} slot(s) on ${ymd}.`);
      } catch(err){
        dbg('Confirm error:', err.message);
        alert('Could not confirm right now. Please try again.');
      }
    });
  }

  // ---- bootstrap
  (async function init(){
    if (dateInput && !dateInput.value) dateInput.value = todayISO();
    const firstDate = selectedDate();
    dbg("Page loaded → date:", firstDate, "→ calling rank.php + availability.php…");

    const tutors = await (async () => {
      try {
        const data = await fetchJSON(`${BASE}rank.php`);
        renderRankedTutors(data);

        // Align tutor name bar to grid columns
        const ul = document.getElementById("tutorList");
        if (ul){
          if (!ul.firstElementChild || !ul.firstElementChild.classList.contains("grid-spacer")) {
            const spacer = document.createElement("li");
            spacer.className = "grid-spacer";
            ul.prepend(spacer);
          }
          ul.style.display = "grid";
          ul.style.gridTemplateColumns = `calc(112px + 2vw) repeat(${data.length}, 1fr)`;
          ul.style.columnGap = "100px";
          ul.style.rowGap = "0";
          ul.style.width = "100%";
          ul.style.margin = "0";
          ul.style.padding = "0";
          ul.style.listStyle = "none";
          ul.style.textAlign = "center";
        }
        return data;
      } catch (err) {
        dbg("Rank error:", err.message);
        tutorList.innerHTML = "<li>Could not load tutors</li>";
        return [];
      }
    })();

    buildAvailabilityGrid(tutors);
    await loadAllTutorsAvailability(firstDate);
  })();
});
