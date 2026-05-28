let currentController = null;
const nameInput = document.getElementById('name');
const titleInput = document.getElementById('title');
const resultsDiv = document.getElementById('results');
const searchButton = document.getElementById('searchButton');

function escapeHtml(str) {
    if (str == null) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function copyId(id, iconEl) {
    navigator.clipboard.writeText(id).then(() => {
        const original = iconEl.innerText;
        iconEl.innerText = "check";
        iconEl.style.color = "var(--accent-color)";
        setTimeout(() => { iconEl.innerText = original; iconEl.style.color = ""; }, 1500);
    });
}

async function search() {
    if (currentController) currentController.abort();
    currentController = new AbortController();
    const signal = currentController.signal;
    const lang = localStorage.getItem('lang') || 'ja';
    const name = nameInput.value.trim();
    const title = titleInput.value.trim();
    resultsDiv.innerHTML = "";

    if (name.length < 1 && title.length < 1) {
        resultsDiv.innerHTML = `<p class="error">${escapeHtml(translations[lang].error_input)}</p>`;
        return;
    }

    searchButton.disabled = true;
    resultsDiv.innerHTML = `<p class="message">${escapeHtml(translations[lang].status_searching)}</p>`;

    try {
        const response = await fetch(`${SCRIPT_URL}?name=${encodeURIComponent(name)}&title=${encodeURIComponent(title)}`, { signal });
        const result = await response.json();
        console.log("RESULT=", result);
        if (signal.aborted) return;
        resultsDiv.innerHTML = "";

        if (result.status === "error") {
            resultsDiv.innerHTML = `<p class="error">${escapeHtml(result.message)}</p>`;
            return;
        }
        if (!result.data || result.data.length === 0) {
            resultsDiv.innerHTML = `<p class="message">No results found.</p>`;
            return;
        }

        result.data.forEach(item => {
            const card = createCard(item, lang);
            resultsDiv.appendChild(card);
        });
    } catch (err) {
        if (err.name === 'AbortError') return;
        console.error(err);
        resultsDiv.innerHTML = `<p class="error">${escapeHtml(translations[lang].error_connection)}</p>`;
    } finally {
        if (currentController && currentController.signal === signal) searchButton.disabled = false;
    }
}

function createCard(item, lang) {
    const card = document.createElement('div');
    card.className = 'card';
    const cardId = document.createElement('div');
    cardId.className = 'card-id';
    const idSpan = document.createElement('span');
    idSpan.textContent = item.id;
    const copyIcon = document.createElement('span');
    copyIcon.className = 'material-icons copy-icon';
    copyIcon.textContent = 'content_copy';
    copyIcon.addEventListener('click', () => copyId(item.id, copyIcon));
    cardId.appendChild(idSpan);
    cardId.appendChild(copyIcon);
    const details = document.createElement('div');
    details.className = 'card-details';
    details.innerHTML = `<div><span>${escapeHtml(translations[lang].label_date)}</span>${escapeHtml(item.date)}</div>
                         <div><span>${escapeHtml(translations[lang].label_sender)}</span>${escapeHtml(item.name)}</div>
                         <div><span>${escapeHtml(translations[lang].label_title)}</span>${escapeHtml(item.title)}</div>`;
    card.appendChild(cardId);
    card.appendChild(details);
    return card;
}

nameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') search(); });
titleInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') search(); });
searchButton.addEventListener('click', search);
