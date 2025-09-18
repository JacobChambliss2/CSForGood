fetch('../data.json')
  .then(response => response.json()) // parse JSON directly
  .then(data => {
    // firstFive placeholder for filter of tutors
    // right now takes first 5 names in data.json
    const firstFive = data.names.slice(0, 5);
    const ul = document.getElementById('tutorList');

    // for each 5 append to ul the name/element
    firstFive.forEach(name => {
      const li = document.createElement('li');
      li.textContent = name;
      ul.appendChild(li);
    });
  })
  // catch just incase some error
  .catch(err => console.error('Error loading JSON:', err));
