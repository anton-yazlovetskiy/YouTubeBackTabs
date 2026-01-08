// Функция проверки: жив ли контекст расширения
function isContextValid() {
    return chrome.runtime && !!chrome.runtime.id;
}

// 1. Внедряем стили
const styleId = 'yt-pro-neon-style';
if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .yt-pro-opened-video {
            outline: 4px solid #00f3ff !important;
            outline-offset: -4px !important;
            box-shadow: inset 0 0 15px #00f3ff, 0 0 10px #00f3ff !important;
            border-radius: 12px !important;
            position: relative !important;
            z-index: 5 !important;
        }
    `;
    (document.head || document.documentElement).appendChild(style);
}

const getContainer = (el) => {
    return el.closest('ytd-rich-grid-media') || 
           el.closest('ytd-compact-video-renderer') || 
           el.closest('ytd-video-renderer') ||
           el.closest('ytd-grid-video-renderer') ||
           el.closest('ytd-rich-item-renderer') || el;
};

// 2. Функция пометки с защитой контекста
function applyNeon() {
    if (!isContextValid()) return; // ПРЕКРАЩАЕМ работу, если контекст сдох

    chrome.storage.local.get(['openedVideos'], (res) => {
        if (chrome.runtime.lastError) return; // Доп. проверка на ошибку
        const opened = Array.isArray(res.openedVideos) ? res.openedVideos : [];
        if (opened.length === 0) return;

        const links = document.querySelectorAll('a[href*="watch?v="]');
        links.forEach(link => {
            try {
                const url = new URL(link.href, window.location.origin);
                const id = url.searchParams.get('v');
                if (id && opened.includes(id)) {
                    const container = getContainer(link);
                    if (container && !container.classList.contains('yt-pro-opened-video')) {
                        container.classList.add('yt-pro-opened-video');
                    }
                }
            } catch(e) {}
        });
    });
}

// 3. Обработчик клика
document.addEventListener('mousedown', (e) => {
    if (!isContextValid()) return;

    const link = e.target.closest('a[href*="watch?v="]');
    if (link && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const url = new URL(link.href, window.location.origin);
        const videoId = url.searchParams.get('v');

        if (videoId) {
            getContainer(link).classList.add('yt-pro-opened-video');

            chrome.storage.local.get(['openedVideos'], (res) => {
                if (chrome.runtime.lastError) return;
                let list = Array.isArray(res.openedVideos) ? res.openedVideos : [];
                if (!list.includes(videoId)) {
                    list.push(videoId);
                    if (list.length > 1000) list = list.slice(-1000);
                    chrome.storage.local.set({ openedVideos: list });
                }
            });
        }
    }
}, true);

document.addEventListener('click', (e) => {
    if (!isContextValid()) return;

    const link = e.target.closest('a[href*="watch?v="]');
    if (link && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        e.stopImmediatePropagation();
        chrome.runtime.sendMessage({ action: "openVideo", url: link.href });
    }
}, true);

// 4. Установка скорости
function syncSpeed() {
    if (!isContextValid()) return;

    chrome.storage.local.get(['preferredSpeed'], (r) => {
        if (chrome.runtime.lastError) return;
        const video = document.querySelector('video');
        if (video && r.preferredSpeed) {
            video.playbackRate = parseFloat(r.preferredSpeed);
        }
    });
}

// 5. ПЕРИОДИЧЕСКИЕ ПРОВЕРКИ (Раз в секунду)
setInterval(() => {
    applyNeon();
    syncSpeed();
}, 1000);

// Инициализация при появлении видео
const observer = new MutationObserver(() => {
    const video = document.querySelector('video');
    if (video && !video.dataset.initDone) {
        video.dataset.initDone = "true";
        syncSpeed();
    }
});
observer.observe(document.documentElement, { childList: true, subtree: true });

setTimeout(applyNeon, 1000);