// update-status.js
window.addEventListener('load', () => {
    // 既存のURLの末尾に ?callback=callback をつける
    const url = LAST_UPDATE_API_URL + "?callback=callback";
    
    // JSONP読み込み用のスクリプトタグを動的に生成
    const script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);
});

// GASから呼ばれるコールバック関数
function callback(data) {
    const el = document.getElementById('last-update-time');
    if (el) el.innerText = data.last_updated;
}
