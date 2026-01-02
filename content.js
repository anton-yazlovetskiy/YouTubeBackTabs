function setVideoSpeed(speed) {
    const video = document.querySelector('video');
    if (video) video.playbackRate = speed;
}

function initSpeed() {
    chrome.storage.local.get(['preferredSpeed'], (result) => {
        const speed = parseFloat(result.preferredSpeed) || 1.5;
        setVideoSpeed(speed);
    });
}

// Исправленный перехват клика
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    // Проверяем, что это ссылка на видео и не нажаты модификаторы (Ctrl/Shift)
    if (link && link.href.includes('watch?v=') && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        e.stopImmediatePropagation(); // Блокируем другие скрипты
        chrome.runtime.sendMessage({ action: "openVideo", url: link.href });
    }
}, true);

chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "forceUpdateSpeed") setVideoSpeed(request.newSpeed);
});

window.addEventListener('yt-navigate-finish', initSpeed);
const observer = new MutationObserver(() => {
    const video = document.querySelector('video');
    if (video && !video.dataset.initDone) {
        video.dataset.initDone = "true";
        initSpeed();
    }
});
observer.observe(document.body, { childList: true, subtree: true });