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
            let selectedSubject = "All";
            let minSAT = 0;
    
            // Function to apply both filters together
            function applyFilters() {
                tutorData.forEach((tutor, i) => {
                    const button = document.getElementById(`tutor${i}`);
                    const matchesSAT = tutor.sat >= minSAT;
                    const matchesSubject =
                        selectedSubject === "All" ||
                        (selectedSubject === "Favorites" && button.classList.contains("favorite")) ||
                        tutor.subjects.includes(selectedSubject);
    
                    if (matchesSAT && matchesSubject) {
                        button.style.display = "block";
                    } else {
                        button.style.display = "none";
                    }
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
                        <div class="insideheart">
                                <img src="../Pictures/heart.png" 
                                    alt="Heart icon" 
                                    class="heart" 
                                    style="width:20px; height:20px; cursor:pointer;">
                        </div>
                    </div>
                `;
                tutorcards.appendChild(expanded);
               
                // Toggle heart icon in expanded card
                const expandedHeart = expanded.querySelector(".insideheart .heart");
                const matchingButton = Array.from(document.querySelectorAll(".tutor-card"))
                    .find(btn => btn.querySelector("strong").textContent === tutor.name);

                // Set initial heart state in expanded view
                if (matchingButton.classList.contains("favorite")) {
                    expandedHeart.src = "../Pictures/filledinheart.png";
                } else {
                    expandedHeart.src = "../Pictures/heart.png";
                }

                expandedHeart.addEventListener("click", () => {
                    const isFavorited = matchingButton.classList.contains("favorite");
                    const heartImg = matchingButton.querySelector(".heart");

                    if (isFavorited) {
                        // Remove from favorites
                        matchingButton.classList.remove("favorite");
                        heartImg.src = "../Pictures/heart.png";
                        expandedHeart.src = "../Pictures/heart.png";
                        const index = favtutors.findIndex(t => t.name === tutor.name);
                        if (index !== -1) favtutors.splice(index, 1);
                    } else {
                        // Add to favorites
                        matchingButton.classList.add("favorite");
                        heartImg.src = "../Pictures/filledinheart.png";
                        expandedHeart.src = "../Pictures/filledinheart.png";
                        favtutors.push({
                            name: tutor.name,
                            age: tutor.age,
                            school: tutor.school,
                            sat: tutor.sat
                        });
                    }
                });


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
            // SAT Slider
            const slider = document.getElementById('satrange');
            const output = document.getElementById('satscore');
            slider.addEventListener('input', function () {
                minSAT = parseInt(this.value, 10);
                output.textContent = this.value;
                applyFilters();
            });

              // Unified filter handler
        const filters = ["Math","Science","Language Arts","History","Biology","Chemistry","Computer Science","Spanish","French","Favorites", "All"];
        filters.forEach(filterName => {
            const filterElem = document.getElementById(`filter${filterName.replace(/\s/g,'')}`); // expects IDs like filterMath, filterEnglish
            if(filterElem) {
                filterElem.addEventListener("click", function() {
                    tutorData.forEach((tutor,i) => {
                        const button = document.getElementById(`tutor${i}`);
                        if(filterName === "All") {
                            button.style.display = "block";
                        } else if(filterName === "Favorites") {
                            button.style.display = button.classList.contains("favorite") ? "block" : "none";
                        } else {
                            button.style.display = tutor.subjects.includes(filterName) ? "block" : "none";
                        }
                        selectedSubject = filterName;
                        applyFilters();
                    });
                });
            }
        });

        const filterdefault = document.getElementById("filterDefault");
        filterdefault.addEventListener("click", function () {
            const allTutors = document.querySelectorAll(".tutor-card");
            allTutors.forEach(card => {
                card.style.display = "block";
                applyFilters();
            });
        });

       
        
        
    })
    .catch(error => console.error('Error loading data:', error));
});
