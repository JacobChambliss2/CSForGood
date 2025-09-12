fetch('./data.json')
    .then(response => response.json())
    .then(data => {
        console.log('Data loaded:', data); 
        const names = data.names;
        const ages = data.ages;
        const schools = data.schools;
        const sats = data.sats;
        const actives = data.actives;
        
        const tutors = [];
        const imglink = `<img src="Pictures/black.jpg" alt="Tutor photo" style="width:30px; height:30px; border-radius:50%; vertical-align:middle; margin-right:8px;">`;

        for (let i = 0; i < names.length; i++) {
            if (actives[i] == true) {
                const button = document.createElement('button');

                button.setAttribute('id', `tutors${i}`); 
                button.innerHTML = `
                    ${imglink}
                    <strong>${names[i]}</strong><br>
                    Age: ${ages[i]}<br>
                    School: ${schools[i]}<br>
                    SAT: ${sats[i]}
                    `;
                document.getElementById('tutorcards').appendChild(button); 
                tutors.push(button); 
            }
        }
    })
    .catch(error => console.error('Error loading data:', error));

const slider = document.getElementById('satrange');
const output = document.getElementById('satscore');
  
    // Update the display when the slider moves
    slider.addEventListener('input', function() {
      output.textContent = this.value; });
