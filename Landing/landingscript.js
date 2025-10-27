function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: 'en',
      includedLanguages: 'en,es,fr,de,zh-CN,hi,ar,ja,ru,pt', // Add more if needed
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
    },
    'google_translate_element'
  );
}

// Retry logic — ensures the widget always loads
function ensureGoogleTranslateLoaded(attempt = 0) {
  const element = document.getElementById('google_translate_element');
  const frame = element?.querySelector('iframe');

  // If iframe not loaded yet, retry up to 5 times
  if (!frame && attempt < 5) {
    setTimeout(() => {
      if (typeof googleTranslateElementInit === 'function') {
        googleTranslateElementInit();
      }
      ensureGoogleTranslateLoaded(attempt + 1);
    }, 1000);
  }
}

// Ensure everything runs when the page finishes loading
window.addEventListener('load', () => {
  ensureGoogleTranslateLoaded();
});
//source: https://stackoverflow.com/questions/54849362/how-to-achieve-this-typing-deleting-effect
const words = ["Tutorly Needs", "Tutoring Questions", "Academic Help", "Engagement with Others"];
let i = 0;
let timer;

function typingEffect() {
    let word = words[i].split("");
    var loopTyping = function() {
        if (word.length > 0) {
            document.getElementById('word').innerHTML += word.shift();
        } else {
            setTimeout(deletingEffect, 1000);
            return false;
        };
        timer = setTimeout(loopTyping, 150);
    };
    loopTyping();
};

function deletingEffect() {
    let word = words[i].split("");
    var loopDeleting = function() {
        if (word.length > 0) {
            word.pop();
            document.getElementById('word').innerHTML = word.join("");
        } else {
            if (words.length > (i + 1)) {
                i++;
            } else {
                i = 0;
            };
            typingEffect();
            return false;
        };
        timer = setTimeout(loopDeleting, 70);
    };
    loopDeleting();
};

typingEffect();
function adjustLayout() {
  const twoSides = document.querySelectorAll('.side');
  const misc = document.querySelector('.misc-inner');
  const miscContainer = document.querySelector('.misc-container');
  const footerColumns = document.querySelector('.footer-columns');
  const footerColumnList = document.querySelectorAll('.footer-column');

  if (!twoSides.length || !misc) return; // safety check

  // === For smaller screens ===
  if (window.innerWidth < 1024) {
    // --- Two Sides Section ---
    twoSides.forEach(side => {
      side.style.width = '90%';
      side.style.margin = '1.5em auto';
      side.style.display = 'block';
    });

    // --- Footer Section ---
    misc.style.flexDirection = 'column';
    misc.style.alignItems = 'center';
    misc.style.textAlign = 'center';
    miscContainer.style.maxWidth = '90%';
    miscContainer.style.textAlign = 'center';
    footerColumns.style.justifyContent = 'center';

    footerColumnList.forEach(col => {
      col.style.alignItems = 'center';
    });

  // === For desktops and larger screens ===
  } else {
    // --- Two Sides Section ---
    twoSides.forEach(side => {
      side.style.width = '45%';
      side.style.margin = '0';
      side.style.display = 'inline-block';
      side.style.verticalAlign = 'top';
    });

    // --- Footer Section ---
    misc.style.flexDirection = 'row';
    misc.style.alignItems = 'flex-start';
    misc.style.textAlign = 'left';
    miscContainer.style.maxWidth = '25em';
    miscContainer.style.textAlign = 'left';
    footerColumns.style.justifyContent = 'flex-end';

    footerColumnList.forEach(col => {
      col.style.alignItems = 'flex-start';
    });
  }
}
window.addEventListener('load', () => {
  let opacity = 0;
  const speed = 10; // lower = slower fade (ms between frames)
  const fade = () => {
    opacity += 0.03;
    document.body.style.opacity = opacity;
    if (opacity < 1) {
      setTimeout(fade, speed);
    }
  };
  document.body.style.opacity = 0;
  fade();
});

let slideIndex = 0;
showSlides();

function showSlides() {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";  
  }
  slideIndex++;
  if (slideIndex > slides.length) {slideIndex = 1}    
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";  
  dots[slideIndex-1].className += " active";
  setTimeout(showSlides, 2000); // Change image every 2 seconds
}