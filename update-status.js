// update-status.js
window.addEventListener('load', () => {
    // config.js で定義された定数を参照
    fetch(LAST_UPDATE_API_URL)
        .then(res => {
            if (!res.ok) throw new Error('Network error');
            return res.json();
        })
        .then(data => {
            const el = document.getElementById('last-update-time');
            if (el) el.innerText = data.last_updated;
        })
        .catch(err => {
            console.error('日時取得エラー:', err);
            const el = document.getElementById('last-update-time');
            if (el) el.innerText = 'Error';
        });
});