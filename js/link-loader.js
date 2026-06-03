// link-loader.js
function loadLinks(lang) {
    const fileName = `link/link_${lang}.txt`;
    fetch(fileName)
        .then(response => response.text())
        .then(data => {
            const container = document.getElementById('footer-links');
            container.innerHTML = ''; // 一度中身をクリア
            const lines = data.split('\n').filter(line => line.trim() !== '');
            lines.forEach(line => {
                const [text, url] = line.split(',');
                if (text && url) {
                    const a = document.createElement('a');
                    a.href = url.trim();
                    a.textContent = text.trim();
                    a.className = 'lang-switcher-link';
                    // 新規タブで開く設定を追加
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    container.appendChild(a);
                }
            });
        });
}

// 初期ロード
document.addEventListener('DOMContentLoaded', () => {
    // 現在の言語設定に合わせてロード（デフォルトはjaと想定）
    const currentLang = localStorage.getItem('lang') || 'ja';
    loadLinks(currentLang);
});
