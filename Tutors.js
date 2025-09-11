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

        for (let i = 0; i < 10; i++) {
            if (actives[i] == true) {
                const button = document.createElement('button');

                button.setAttribute('id', `tutors${i}`); 
                button.innerHTML = `
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
