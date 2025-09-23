//grab sample data from json/csv
fetch('../data.json')
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

// Optional: close modal when clicking outside the modal box
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});