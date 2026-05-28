document.addEventListener('DOMContentLoaded', () => {
    fetch('link.txt')
        .then(response => response.text())
        .then(data => {
            const container = document.getElementById('footer-links');
            // 空行を除外し、各行を処理
            const lines = data.split('\n').filter(line => line.trim() !== '');
            
            lines.forEach(line => {
                const [text, url] = line.split(',');
                if (text && url) {
                    const a = document.createElement('a');
                    a.href = url.trim();
                    a.textContent = text.trim();
                    container.appendChild(a);
                }
            });
        })
        .catch(err => console.error('リンクの読み込みに失敗しました:', err));
});