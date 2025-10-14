//grab sample data from json/csv
fetch('../BackendData/data.json')
//directly take response from json
  .then(response => response.json())
  .then(data => {
    //firstFive placeholder for filter of tutors
    //right now takes first 5 names in data.json
    const firstFive = data.names.slice(0, 5);
    const ul = document.getElementById('tutorList');

    //for each 5 append to ul the name/element
    firstFive.forEach(name => {
      const li = document.createElement('li');
      li.textContent = name;
      ul.appendChild(li);
    });
  })
  // catch just incase some error (for troubleshooting)
.catch(err => console.error('Error loading JSON:', err));

//section for booking modal/pop up ui
const bookingModal = document.getElementById("bookingModal");
const modalTutorName = document.getElementById("modalTutorName");
const closeBtn = document.querySelector(".close");
const tutorList = document.getElementById("tutorList");

//identify a user click on any tutor name and grab the name clicked
tutorList.addEventListener("click", (e) => {
  const clicked = e.target.closest("li");
  if (!clicked) return;

  //book time with [tutor name]
  modalTutorName.textContent = `Book a time with ${clicked.textContent}`;
  bookingModal.style.display = "block";
});

//close button
closeBtn.addEventListener("click", () => {
  bookingModal.style.display = "none";
});

document.getElementById("rankForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // collect form data
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  // send to Flask
  const response = await fetch("http://127.0.0.1:5000/rank", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const tutors = await response.json();

  // update results table
  const tbody = document.querySelector("#resultsTable tbody");
  tbody.innerHTML = ""; // clear old results

  tutors.forEach(t => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.first_name} ${t.last_name}</td>
      <td>${t.Age}</td>
      <td>${t.School}</td>
      <td>${t.SAT}</td>
      <td>${t.distance}</td>
      <td>${t.Score.toFixed(3)}</td>
    `;
    tbody.appendChild(row);
  });
}); 