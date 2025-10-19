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
