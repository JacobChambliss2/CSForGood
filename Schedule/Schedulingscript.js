// Point this to where PHP actually runs:
// - If you used: php -S 127.0.0.1:8000  → set BASE = "http://127.0.0.1:8000/"
// - If uploaded to your host              → set BASE = "https://yourdomain.com/path/"
const BASE = "http://127.0.0.1:8000/";  // <-- CHANGE THIS for your setup

document.addEventListener("DOMContentLoaded", () => {
  const tutorList      = document.getElementById("tutorList");
  const dateInput      = document.getElementById("start");
  const bookingModal   = document.getElementById("bookingModal");
  const modalTutorName = document.getElementById("modalTutorName");
  const closeBtn       = document.querySelector(".close");

  (function tagHourLis() {
    document.querySelectorAll(".hours li").forEach((li, idx) => { li.dataset.hour = idx; });
  })();

  function clearAvailability() {
    document.querySelectorAll(".hours li").forEach(li => li.classList.remove("available"));
  }
  function renderAvailability(hoursArr) {
    clearAvailability();
    (hoursArr || []).forEach(h => {
      const li = document.querySelector(`.hours li[data-hour="${h}"]`);
      if (li) li.classList.add("available");
    });
  }
  function renderRankedTutors(rows) {
    tutorList.innerHTML = "";
    (rows || []).forEach(t => {
      const li = document.createElement("li");
      li.textContent = `${t.first_name} ${t.last_name}`;
      li.dataset.tutorId = t.id;
      tutorList.appendChild(li);
    });
  }

  async function fetchJSON(url, options) {
    const res = await fetch(url, options);
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Non-JSON response from", url, "→", text.slice(0, 200));
      throw new Error("Bad JSON");
    }
  }

  async function loadRankedTutors() {
    try {
      // GET so it works even if a host blocks POST by default
      const data = await fetchJSON(`${BASE}rank.php`);
      renderRankedTutors(data);
    } catch (err) {
      console.error("Failed to load ranked tutors:", err);
      tutorList.innerHTML = "<li>Could not load tutors</li>";
    }
  }

  async function loadAvailability(tutorId, ymd) {
    try {
      const data = await fetchJSON(`${BASE}availability.php?tutor_id=${encodeURIComponent(tutorId)}&date=${encodeURIComponent(ymd)}`);
      renderAvailability(data.hours || []);
    } catch (err) {
      console.error("Failed to load availability:", err);
      clearAvailability();
    }
  }

  let lastTutorId = null;

  tutorList.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;
    lastTutorId = li.dataset.tutorId;
    modalTutorName.textContent = `Book a time with ${li.textContent}`;
    bookingModal.style.display = "block";
    if (dateInput && dateInput.value) loadAvailability(lastTutorId, dateInput.value);
    else clearAvailability();
  });

  dateInput.addEventListener("change", () => {
    if (lastTutorId && dateInput.value) loadAvailability(lastTutorId, dateInput.value);
  });

  if (closeBtn) closeBtn.addEventListener("click", () => { bookingModal.style.display = "none"; });

  loadRankedTutors();
});
