document.addEventListener("DOMContentLoaded", function () {
    fetch('./data.json')
        .then(response => response.json())
        .then(data => {
            console.log('Data loaded:', data); 
            const names = data.names;
            const ages = data.ages;
            const schools = data.schools;
            const sats = data.sats;
            const actives = data.actives;

            const imglink = `<img src='../Pictures/black.jpg' alt="Tutor photo" style="width:30px; height:30px; border-radius:50%; vertical-align:middle; margin-right:8px;">`;
            const heartlink = `<img src='../Pictures/heart.png' alt="Heart icon" style="width:20px; height:20px; vertical-align:right;">`;
            const tutorcards = document.getElementById('tutorcards');

            // Combine data into lists
            const tutorData = [];
            for (let i = 0; i < names.length; i++) {
                if (actives[i] === true) {
                    tutorData.push({
                        name: names[i],
                        age: ages[i],
                        school: schools[i],
                        sat: sats[i]
                    });
                }
            }

            // Sort by SAT highest to lowest
            tutorData.sort((a, b) => b.sat - a.sat);

            // Create cards
            tutorData.forEach((tutor, i) => {
                const button = document.createElement('button');
                button.setAttribute('id', `tutor${i}`);
                button.innerHTML = `
                    ${imglink}
                    <strong>${tutor.name}</strong><br>
                    Age: ${tutor.age}<br>
                    School: ${tutor.school}<br>
                    SAT: ${tutor.sat}
                    <div class="hearticon">
                    ${heartlink}
                    </div>
                `;
                tutorcards.appendChild(button);
            });

            // Set up slider
            const slider = document.getElementById('satrange');
            const output = document.getElementById('satscore');
            slider.addEventListener('input', function () {
                output.textContent = this.value;
                tutorData.forEach((tutor,i) => {
                    const button = document.getElementById(`tutor${i}`);
                    if (tutor.sat >= this.value) {
                        button.style.display = 'block';
                    } else {
                        button.style.display = 'none';
                    }
                });
            });
        })
        .catch(error => console.error('Error loading data:', error));
        document.addEventListener("DOMContentLoaded", function() {
            //make it so you can favorite a tutor
        });
});
