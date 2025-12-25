function setVideoSpeed(speed) {
    const video = document.querySelector('video');
    if (video) {
        video.playbackRate = speed;
    }
}

// Первичная установка при загрузке
function initSpeed() {
    chrome.storage.local.get(['preferredSpeed'], (result) => {
        const speed = parseFloat(result.preferredSpeed) || 1.5;
        setVideoSpeed(speed);
    });
}

// Открытие в фоне по ЛКМ (оставляем как было)
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.href.includes('watch?v=') && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        chrome.runtime.sendMessage({ action: "openVideo", url: link.href });
    }
}, true);

// Слушаем команды из попапа
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "forceUpdateSpeed") {
        setVideoSpeed(request.newSpeed);
    }
});

// Срабатывает при переходе между видео
window.addEventListener('yt-navigate-finish', initSpeed);

// На случай, если плеер подгрузился позже события навигации
const observer = new MutationObserver(() => {
    const video = document.querySelector('video');
    if (video && !video.dataset.initDone) {
        video.dataset.initDone = "true";
        initSpeed();
    }
});
observer.observe(document.body, { childList: true, subtree: true });