document.addEventListener("DOMContentLoaded", function () {
    fetch('../data.json')
    .then(response => response.json())
    .then(data => {
        console.log('Data loaded:', data); 
        const names = data.names;
        const ages = data.ages; 
        const schools = data.schools;
        const sats = data.sats;
        const subjects = data.subjects;
        const actives = data.actives;
        const favtutors = [];
        const imglink = `<img src='../Pictures/black.jpg' alt="Tutor photo" style="width:30px; height:30px; border-radius:50%; vertical-align:middle; margin-right:8px;">`;
        const heartlink = `<img src='../Pictures/heart.png' alt="Heart icon" style="width:20px; height:20px; vertical-align:right;">`;
        const tutorcards = document.getElementById('tutorcards');
        const backarrow = document.getElementById('backarrow');
        // Combine data into lists
        const tutorData = [];
        for (let i = 0; i < names.length; i++) {
            tutorData.push({
                name: names[i],
                age: ages[i],
                school: schools[i],
                sat: sats[i],
                subjects: subjects[i],
            });
            }

            

            // Create cards
            tutorData.forEach((tutor, i) => {
                const button = document.createElement('button');
                button.setAttribute('id', `tutor${i}`);
                button.innerHTML = `
                        ${imglink}
                        <strong>${tutor.name}</strong><br>
                        Age: ${tutor.age}<br>
                        School: ${tutor.school}<br>
                        SAT: ${tutor.sat} <br>
                        Subject: ${subjects[i]}<br>
                        <div class="hearticon">
                            <img src="../Pictures/heart.png" 
                                alt="Heart icon" 
                                class="heart" 
                                style="width:20px; height:20px; cursor:pointer;">
                        </div>
                `;
                button.classList.add("tutor-card");
                tutorcards.appendChild(button);
                // Add click event for heart toggle
                button.addEventListener("contextmenu", function (event) {
                    event.preventDefault();
                    const heartImg = button.querySelector(".heart");
                    if (heartImg.src.includes("filledinheart.png")) {
                        heartImg.src = "../Pictures/heart.png";
                        const index = favtutors.findIndex(t => t.name === tutor.name);
                        if (index !== -1) {
                            favtutors.splice(index, 1);
                        }
                        button.classList.remove("favorite"); // remove favorite class
                    } else {
                        heartImg.src = "../Pictures/filledinheart.png";
                        favtutors.push({name: tutor.name, age: tutor.age, school: tutor.school, sat: tutor.sat});
                        button.classList.add("favorite"); // add favorite class
                    }
                });
                button.addEventListener("click", function (event) {
                    event.preventDefault(); // Prevent browser menu
                    showExpandedTutor(tutor);
                });
            }); 

            function showExpandedTutor(tutor) {
                // Hide all normal cards
                document.querySelectorAll(".tutor-card").forEach(card => {
                    card.style.display = "none";
                });
                backarrow.style.display = "block";
                // Remove existing expanded card
                const oldExpanded = document.getElementById("expanded-card");
                if (oldExpanded) oldExpanded.remove();

                // Create expanded view
                const expanded = document.createElement("div");
                expanded.id = "expanded-card";
                expanded.classList.add("expanded-card");
                expanded.innerHTML = `
                    <div class = "leftsidecard">
                        <img src="../Pictures/black.jpg" alt="Tutor photo" style="width:120px; height:120px; border-radius:50%; margin-bottom:15px;">
                        <h2>${tutor.name}</h2>
                        <p><strong>Age:</strong> ${tutor.age}</p>
                        <p><strong>School:</strong> ${tutor.school}</p>
                        <p><strong>SAT Score:</strong> ${tutor.sat}</p>
                        <p><strong>Subjects:</strong> ${tutor.subjects}</p>
                        
                    </div>
                    <div class="rightsidecard">
                    <h3> Bio:</h3>
                    <p id = "bio">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam scelerisque aliquam odio et faucibus. Nulla rhoncus feugiat eros quis consectetur. Morbi neque ex, condimentum dapibus congue et, vulputate ut ligula. </p>
                    </div>
                `;
                tutorcards.appendChild(expanded);

                // Back button restores all tutor cards
                document.getElementById("backarrow").addEventListener("click", () => {
                    expanded.remove();
                    document.querySelectorAll(".tutor-card").forEach(card => {
                        card.style.display = "block";
                    });
                    
                    backarrow.style.display = "none";
                });
            }

            
            // Set up slider
            const slider = document.getElementById('satrange');
            const output = document.getElementById('satscore');
            slider.addEventListener('input', function () {
                output.textContent = this.value;
                tutorData.forEach((tutor,i) => {
                    const button = document.getElementById(`tutor${i}`);
                    if (tutor.sat < this.value) {
                        button.style.display = 'none';
                    } else {
                        button.style.display = 'block';
                    }
                    
                });
            });
            const favoritesFilter = document.getElementById("filterfavorites");

            favoritesFilter.addEventListener("click", function () {
              const allTutors = document.querySelectorAll(".tutor-card");
              allTutors.forEach(card => {
                if (!card.classList.contains("favorite")) {
                    card.style.display = "none";
                }
              });
            });

            const lafilter = document.getElementById("LACheck");
            lafilter.addEventListener("click", function () {
                const allTutors = document.querySelectorAll(".tutor-card");
                tutorData.forEach((tutor, i) => {
                    const button = document.getElementById(`tutor${i}`);
                    if (tutor.subjects.includes("Language Arts")) {
                        button.style.display = "block";
                    } else {
                        button.style.display = "none";
                    }
                });
              });
            const mathfilter = document.getElementById("MathCheck");
            mathfilter.addEventListener("click", function () {
                const allTutors = document.querySelectorAll(".tutor-card");
                tutorData.forEach((tutor, i) => {
                    const button = document.getElementById(`tutor${i}`);
                    if (tutor.subjects.includes("Math")) {
                        button.style.display = "block";
                    } else {
                        button.style.display = "none";
                    }
                });
              });
            const sciencefilter = document.getElementById("ScienceCheck");
            sciencefilter.addEventListener("click", function () {
                const allTutors = document.querySelectorAll(".tutor-card");
                tutorData.forEach((tutor, i) => {
                    const button = document.getElementById(`tutor${i}`);
                    if (tutor.subjects.includes("Science")) {
                        button.style.display = "block";
                    } else {
                        button.style.display = "none";
                    }
                });
              });
              const otherfilter = document.getElementById("OtherCheck");
              othercheck.addEventListener("click", function () {
                  const allTutors = document.querySelectorAll(".tutor-card");
                  allTutors.forEach(card => {
                    card.style.display = "block";
                });
                });
        })

        const filterdefault = document.getElementById("filterdefault");
        filterdefault.addEventListener("click", function () {
            const allTutors = document.querySelectorAll(".tutor-card");
            allTutors.forEach(card => {
                card.style.display = "block";
            });
        });
        
    })
    .catch(error => console.error('Error loading data:', error));
