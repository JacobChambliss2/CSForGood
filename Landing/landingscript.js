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