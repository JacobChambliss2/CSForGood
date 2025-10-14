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
                button.addEventListener("click", function (event) {
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
            }); 
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
