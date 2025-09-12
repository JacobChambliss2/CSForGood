fetch('../data.json')
  .then(response => response.json()) // parse JSON directly
  .then(data => {
    const firstFive = data.names.slice(0, 5); // first 5 names
    const ul = document.getElementById('tutorList');

    firstFive.forEach(name => {
      const li = document.createElement('li');
      li.textContent = name;
      ul.appendChild(li);
    });
  })
  .catch(err => console.error('Error loading JSON:', err));
