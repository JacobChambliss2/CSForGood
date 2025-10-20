function googleTranslateElementInit() {
    new google.translate.TranslateElement(
        {
            pageLanguage: 'en',                 // default site language
            includedLanguages: 'en,es,fr,de,zh-CN,zh-TW,ja,vi,ar',  // languages available
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        'google_translate_element'
    );
}
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