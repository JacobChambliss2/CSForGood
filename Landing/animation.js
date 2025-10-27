document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('fade-in');

  // For fade-out on navigation
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    if (link.hostname === window.location.hostname) {
      link.addEventListener('click', e => {
        e.preventDefault();
        document.body.classList.remove('fade-in');
        setTimeout(() => {
          window.location = link.href;
        }, 500); // match transition duration
      });
    }
  });
});
