let translations = {};

async function loadLanguage() {
    try {
        const res = await fetch('lang/language.json');
        translations = await res.json();
        setLang(localStorage.getItem('lang') || 'ja');
    } catch (err) {
        console.error("lang/language.json 読込失敗", err);
    }
}

function setLang(lang) {
    if (!translations[lang]) return;
    localStorage.setItem('lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) setTextWithLineBreaks(el, translations[lang][key]);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) el.placeholder = translations[lang][key];
    });

    const t = translations[lang];
    const linkHtml = `<a href="https://youtu.be/uoa8-pQY838?si=Fsja-1kfuoj4hcCf&t=87" target="_blank" rel="noopener noreferrer" style="color: var(--accent-color);">${escapeHtml(t.link_how_to)}</a>`;
    document.getElementById('description-tail').innerHTML = t.description_tail.replace('[link_how_to]', linkHtml);
    // リンクを読み込み直す
    if (typeof loadLinks === 'function') {
        loadLinks(lang);
    }
}

window.addEventListener('load', loadLanguage);

function setTextWithLineBreaks(el, text) {
    el.replaceChildren();

    String(text).split(/<br\s*\/?>/i).forEach((part, index) => {
        if (index > 0) el.appendChild(document.createElement('br'));
        el.appendChild(document.createTextNode(part));
    });
}
